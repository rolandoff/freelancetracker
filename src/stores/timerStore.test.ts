import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTimerStore } from './timerStore'

const initialState = useTimerStore.getState()

describe('useTimerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useTimerStore.setState(initialState, true)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts and stops a timer, resetting state', () => {
    useTimerStore.getState().startTimer('activity-1')
    let state = useTimerStore.getState()
    expect(state.activityId).toBe('activity-1')
    expect(state.isRunning).toBe(true)
    expect(state.elapsedSeconds).toBe(0)

    state.stopTimer()

    state = useTimerStore.getState()
    expect(state.activityId).toBeNull()
    expect(state.isRunning).toBe(false)
    expect(state.elapsedSeconds).toBe(0)
  })

  it('pauses and resumes an active timer', () => {
    const store = useTimerStore.getState()
    store.startTimer('activity-1')
    store.pauseTimer()
    expect(useTimerStore.getState().isRunning).toBe(false)

    store.resumeTimer()
    expect(useTimerStore.getState().isRunning).toBe(true)
  })

  it('tracks elapsed seconds when ticking', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    const store = useTimerStore.getState()
    store.startTimer('activity-1')

    vi.advanceTimersByTime(3500)
    store.tick()

    expect(useTimerStore.getState().elapsedSeconds).toBe(3)
  })

  it('resets timer without stopping activity', () => {
    const store = useTimerStore.getState()
    store.startTimer('activity-1')
    store.resetTimer()

    expect(useTimerStore.getState().elapsedSeconds).toBe(0)
    expect(useTimerStore.getState().isRunning).toBe(true)
    expect(useTimerStore.getState().startTime).not.toBeNull()
  })
})
