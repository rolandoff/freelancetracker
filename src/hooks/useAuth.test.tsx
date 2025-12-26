import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'

const {
  mockGetSession,
  mockOnAuthStateChange,
  mockUnsubscribe,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockUnsubscribe: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

const createSession = (overrides: Partial<{ user: { id: string } }> = {}) => ({
  user: overrides.user ?? { id: 'user-1' },
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockUnsubscribe.mockReset()

    mockGetSession.mockResolvedValue({ data: { session: createSession() } })
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initially loads session and user', async () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockGetSession).toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual({ id: 'user-1' })
    expect(result.current.session).toEqual(createSession())
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles session being null', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } })
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('updates state on auth change and unsubscribes on unmount', async () => {
    let authChangeCallback: ((event: string, session: ReturnType<typeof createSession> | null) => void) | null =
      null
    mockOnAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      }
    })

    const { result, unmount } = renderHook(() => useAuth())

    await act(async () => {
      await Promise.resolve()
    })

    expect(authChangeCallback).toBeTruthy()

    await act(async () => {
      authChangeCallback?.('SIGNED_OUT', null)
      await Promise.resolve()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)

    await act(async () => {
      authChangeCallback?.('SIGNED_IN', createSession({ user: { id: 'user-2' } }))
      await Promise.resolve()
    })

    expect(result.current.user).toEqual({ id: 'user-2' })

    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
