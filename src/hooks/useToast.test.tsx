import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from './useToast'

const storeMock = vi.hoisted(() => {
  return {
    addNotification: vi.fn(),
    removeNotification: vi.fn(),
  }
})

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    addNotification: storeMock.addNotification,
    removeNotification: storeMock.removeNotification,
  }),
}))

const { addNotification, removeNotification } = storeMock

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds a notification and auto-removes it after the default duration', () => {
    vi.useFakeTimers()
    addNotification.mockReturnValue('toast-id')
    const { result } = renderHook(() => useToast())

    act(() => {
      const id = result.current.toast({ type: 'success', title: 'Saved' })
      expect(id).toBe('toast-id')
    })

    expect(addNotification).toHaveBeenCalledWith({ type: 'success', title: 'Saved' })
    expect(removeNotification).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(removeNotification).toHaveBeenCalledWith('toast-id')
  })

  it('uses the provided duration when scheduling auto-removal', () => {
    vi.useFakeTimers()
    addNotification.mockReturnValue('custom-duration')
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ type: 'info', title: 'Processing', duration: 1500 })
    })

    expect(removeNotification).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1499)
    })
    expect(removeNotification).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(removeNotification).toHaveBeenCalledWith('custom-duration')
  })

  it('skips auto-removal when duration is zero or negative', () => {
    vi.useFakeTimers()
    addNotification.mockReturnValue('no-timeout')
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ type: 'warning', title: 'Persistent', duration: 0 })
    })

    act(() => {
      vi.advanceTimersByTime(10_000)
    })

    expect(removeNotification).not.toHaveBeenCalled()
  })

  ;(['success', 'error', 'warning', 'info'] as const).forEach((method) => {
    it(`provides a convenience "${method}" helper`, () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current[method]('Title', 'Message', 2000)
      })

      expect(addNotification).toHaveBeenCalledWith({
        type: method,
        title: 'Title',
        message: 'Message',
        duration: 2000,
      })
    })
  })

  it('exposes remove helper that proxies removeNotification', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.remove('to-remove')
    })

    expect(removeNotification).toHaveBeenCalledWith('to-remove')
  })
})
