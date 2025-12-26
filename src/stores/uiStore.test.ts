import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { useUIStore } from './uiStore'

const initialState = useUIStore.getState()
let setItemSpy: MockInstance

beforeEach(() => {
  localStorage.clear()
  useUIStore.setState(initialState, true)
  setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useUIStore - theme controls', () => {
  it('sets and toggles theme while persisting partial state', () => {
    const { setTheme, toggleTheme } = useUIStore.getState()

    setTheme('dark')

    expect(useUIStore.getState().theme).toBe('dark')
    expect(setItemSpy).toHaveBeenCalled()
    const storedValue = localStorage.getItem('ui-storage')
    expect(storedValue).not.toBeNull()
    const stored = JSON.parse(storedValue!)
    expect(stored.state).toMatchObject({ theme: 'dark', sidebarOpen: true })

    toggleTheme()
    expect(useUIStore.getState().theme).toBe('light')
  })
})

describe('useUIStore - sidebar controls', () => {
  it('sets and toggles sidebar visibility', () => {
    const { setSidebarOpen, toggleSidebar } = useUIStore.getState()

    setSidebarOpen(false)
    expect(useUIStore.getState().sidebarOpen).toBe(false)

    toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })
})

describe('useUIStore - notifications', () => {
  it('adds notifications with deterministic ids and can remove them', () => {
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.123456)

    const { addNotification, removeNotification } = useUIStore.getState()

    const id = addNotification({
      type: 'success',
      title: 'Saved',
      message: 'All good',
    })

    expect(id).toBe('1700000000000_0.123456')
    expect(useUIStore.getState().notifications).toHaveLength(1)

    removeNotification(id)
    expect(useUIStore.getState().notifications).toHaveLength(0)

    dateSpy.mockRestore()
    randomSpy.mockRestore()
  })

  it('clears all notifications', () => {
    const { addNotification, clearNotifications } = useUIStore.getState()

    addNotification({ type: 'error', title: 'Oops' })
    addNotification({ type: 'warning', title: 'Heads up' })

    expect(useUIStore.getState().notifications).toHaveLength(2)

    clearNotifications()
    expect(useUIStore.getState().notifications).toHaveLength(0)
  })
})
