import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { TimeTracker } from './TimeTracker'

const mockCreateTimeEntry = vi.fn()
const mockStopTimer = vi.fn()
const mockPauseTimer = vi.fn()
const mockResumeTimer = vi.fn()

vi.mock('../hooks/useTimeEntries', () => ({
  useCreateTimeEntry: () => ({
    mutateAsync: mockCreateTimeEntry,
  }),
}))

vi.mock('../hooks/useActivities', () => ({
  useActivities: () => ({
    data: [
      {
        id: 'activity-1',
        title: 'Test Activity',
      },
    ],
  }),
}))

vi.mock('@/stores/timerStore', () => ({
  useTimerStore: vi.fn(),
}))

describe('TimeTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows no timer message when no activity is active', () => {
    const { useTimerStore } = require('@/stores/timerStore')
    useTimerStore.mockReturnValue({
      activityId: null,
      startTime: null,
      elapsedSeconds: 0,
      isRunning: false,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    expect(screen.getByText('No hay temporizador activo')).toBeInTheDocument()
  })

  it('displays timer with activity title when timer is running', () => {
    const { useTimerStore } = require('@/stores/timerStore')
    useTimerStore.mockReturnValue({
      activityId: 'activity-1',
      startTime: new Date(),
      elapsedSeconds: 125,
      isRunning: true,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
    expect(screen.getByText('00:02:05')).toBeInTheDocument()
  })

  it('formats time correctly for hours, minutes, and seconds', () => {
    const { useTimerStore } = require('@/stores/timerStore')
    useTimerStore.mockReturnValue({
      activityId: 'activity-1',
      startTime: new Date(),
      elapsedSeconds: 3665,
      isRunning: true,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    expect(screen.getByText('01:01:05')).toBeInTheDocument()
  })

  it('shows pause button when timer is running', () => {
    const { useTimerStore } = require('@/stores/timerStore')
    useTimerStore.mockReturnValue({
      activityId: 'activity-1',
      startTime: new Date(),
      elapsedSeconds: 60,
      isRunning: true,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    expect(screen.getByText('Pausar')).toBeInTheDocument()
  })

  it('shows resume button when timer is paused', () => {
    const { useTimerStore } = require('@/stores/timerStore')
    useTimerStore.mockReturnValue({
      activityId: 'activity-1',
      startTime: new Date(),
      elapsedSeconds: 60,
      isRunning: false,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    expect(screen.getByText('Reanudar')).toBeInTheDocument()
  })

  it('calls pauseTimer when pause button is clicked', async () => {
    const user = userEvent.setup()
    const { useTimerStore } = require('@/stores/timerStore')
    useTimerStore.mockReturnValue({
      activityId: 'activity-1',
      startTime: new Date(),
      elapsedSeconds: 60,
      isRunning: true,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    await user.click(screen.getByText('Pausar'))
    expect(mockPauseTimer).toHaveBeenCalledTimes(1)
  })

  it('calls resumeTimer when resume button is clicked', async () => {
    const user = userEvent.setup()
    const { useTimerStore } = require('@/stores/timerStore')
    useTimerStore.mockReturnValue({
      activityId: 'activity-1',
      startTime: new Date(),
      elapsedSeconds: 60,
      isRunning: false,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    await user.click(screen.getByText('Reanudar'))
    expect(mockResumeTimer).toHaveBeenCalledTimes(1)
  })

  it('saves time entry and stops timer when stop button is clicked', async () => {
    const user = userEvent.setup()
    const startTime = new Date('2024-01-01T10:00:00Z')
    const { useTimerStore } = require('@/stores/timerStore')
    
    mockCreateTimeEntry.mockResolvedValue({})
    
    useTimerStore.mockReturnValue({
      activityId: 'activity-1',
      startTime,
      elapsedSeconds: 60,
      isRunning: true,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    await user.click(screen.getByText('Detener'))

    await waitFor(() => {
      expect(mockCreateTimeEntry).toHaveBeenCalledWith({
        activity_id: 'activity-1',
        start_time: startTime.toISOString(),
        end_time: expect.any(String),
        notes: null,
      })
      expect(mockStopTimer).toHaveBeenCalled()
    })
  })

  it('shows saving state when stopping timer', async () => {
    const user = userEvent.setup()
    const { useTimerStore } = require('@/stores/timerStore')
    
    mockCreateTimeEntry.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )
    
    useTimerStore.mockReturnValue({
      activityId: 'activity-1',
      startTime: new Date(),
      elapsedSeconds: 60,
      isRunning: true,
      pauseTimer: mockPauseTimer,
      resumeTimer: mockResumeTimer,
      stopTimer: mockStopTimer,
    })

    render(<TimeTracker />)
    await user.click(screen.getByText('Detener'))
    
    expect(screen.getByText('Guardando...')).toBeInTheDocument()
  })
})
