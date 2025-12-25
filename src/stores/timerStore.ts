import { create } from 'zustand'

interface TimerStore {
  // Active timer
  activityId: string | null
  startTime: Date | null
  elapsedSeconds: number
  isRunning: boolean

  // Actions
  startTimer: (activityId: string) => void
  stopTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  resetTimer: () => void
  tick: () => void
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  activityId: null,
  startTime: null,
  elapsedSeconds: 0,
  isRunning: false,

  startTimer: (activityId) => {
    // Stop any existing timer first
    const state = get()
    if (state.isRunning) {
      state.stopTimer()
    }

    set({
      activityId,
      startTime: new Date(),
      elapsedSeconds: 0,
      isRunning: true,
    })
  },

  stopTimer: () => {
    set({
      activityId: null,
      startTime: null,
      elapsedSeconds: 0,
      isRunning: false,
    })
  },

  pauseTimer: () => {
    set({ isRunning: false })
  },

  resumeTimer: () => {
    const state = get()
    if (state.activityId && state.startTime) {
      set({ isRunning: true })
    }
  },

  resetTimer: () => {
    set({
      elapsedSeconds: 0,
      startTime: new Date(),
    })
  },

  tick: () => {
    const state = get()
    if (state.isRunning && state.startTime) {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - state.startTime.getTime()) / 1000)
      set({ elapsedSeconds: elapsed })
    }
  },
}))

// Timer tick interval (update every second)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useTimerStore.getState()
    if (state.isRunning) {
      state.tick()
    }
  }, 1000)
}
