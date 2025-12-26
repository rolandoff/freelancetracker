import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { ActivityCard } from './ActivityCard'
import type { ActivityWithRelations } from '../hooks/useActivities'

const mockActivity: ActivityWithRelations = {
  id: '1',
  user_id: 'user-1',
  client_id: 'client-1',
  project_id: 'project-1',
  title: 'Test Activity',
  description: 'Test description',
  service_type: 'programacion',
  status: 'en_curso',
  estimated_hours: 10,
  hourly_rate: 50,
  sort_order: 0,
  observations: null,
  completed_at: null,
  invoiced_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  client: {
    id: 'client-1',
    name: 'Test Client',
    email: 'test@example.com',
    phone: null,
    address: null,
    siret: null,
    notes: null,
    is_active: true,
    user_id: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  project: {
    id: 'project-1',
    name: 'Test Project',
    description: null,
    client_id: 'client-1',
    user_id: 'user-1',
    status: 'active',
    start_date: null,
    end_date: null,
    budget: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
}

// Mock useTimerStore
vi.mock('@/stores/timerStore', () => ({
  useTimerStore: vi.fn(() => ({
    startTimer: vi.fn(),
  })),
}))

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  useDraggable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  })),
}))

describe('ActivityCard', () => {
  it('renders activity title', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
  })

  it('renders activity description when provided', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders service type badge', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Programación')).toBeInTheDocument()
  })

  it('renders client and project names', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Test Client')).toBeInTheDocument()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('renders estimated hours when provided', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText(/10\.0h/)).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    const onClickMock = vi.fn()
    
    render(<ActivityCard activity={mockActivity} onClick={onClickMock} />)
    
    await user.click(screen.getByText('Test Activity'))
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })

  it('starts timer when play button is clicked', async () => {
    const user = userEvent.setup()
    const { useTimerStore } = await import('@/stores/timerStore')
    const startTimerMock = vi.fn()
    
    vi.mocked(useTimerStore).mockReturnValue({
      startTimer: startTimerMock,
      stopTimer: vi.fn(),
      pauseTimer: vi.fn(),
      resumeTimer: vi.fn(),
      resetTimer: vi.fn(),
      tick: vi.fn(),
      activityId: null,
      startTime: null,
      elapsedSeconds: 0,
      isRunning: false,
    })
    
    render(<ActivityCard activity={mockActivity} />)
    
    const playButton = screen.getByTitle('Start timer')
    await user.click(playButton)
    
    expect(startTimerMock).toHaveBeenCalledWith('1')
  })

  it('does not render description when not provided', () => {
    const activityWithoutDesc = { ...mockActivity, description: null }
    render(<ActivityCard activity={activityWithoutDesc} />)
    
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  it('renders in drag overlay mode', () => {
    render(<ActivityCard activity={mockActivity} isDragOverlay />)
    expect(screen.getByText('Test Activity')).toBeInTheDocument()
  })
})
