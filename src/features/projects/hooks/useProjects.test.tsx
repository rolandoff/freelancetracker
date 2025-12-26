import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from '@/test/queryClient'
import { useProjects } from './useProjects'

const mockSupabase = vi.hoisted(() => {
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockOrder = vi.fn()
  return { mockFrom, mockSelect, mockOrder }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockSupabase.mockFrom,
  },
}))

const { mockFrom, mockSelect, mockOrder } = mockSupabase

const projects = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
]

describe('useProjects', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ order: mockOrder })
  })

  it('fetches and returns projects ordered by name', async () => {
    mockOrder.mockResolvedValue({ data: projects, error: null })

    const { result } = renderHook(() => useProjects(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toEqual(projects)
    })

    expect(mockFrom).toHaveBeenCalledWith('projects')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true })
  })

  it('exposes error when supabase returns error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: new Error('Failed') })

    const { result } = renderHook(() => useProjects(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error)
    })
  })
})
