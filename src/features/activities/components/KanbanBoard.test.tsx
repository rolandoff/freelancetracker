import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { KanbanBoard } from './KanbanBoard'
import { ACTIVITY_STATUSES } from '@/lib/constants'
import type { ActivityWithRelations } from '../hooks/useActivities'
import type { ActivityStatus } from '@/types/database.types'
import type { Active, DragEndEvent, DragStartEvent, Over } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import { act } from 'react'

interface MockKanbanColumnProps {
  status: ActivityStatus
  title: string
  color: string
  activities: ActivityWithRelations[]
  onActivityClick?: (activity: ActivityWithRelations) => void
}

interface MockActivityFormProps {
  activity?: ActivityWithRelations
  onClose: () => void
}

interface MockActivityDetailModalProps {
  activity: ActivityWithRelations
  onClose: () => void
  onEdit: () => void
}

interface MockActivityCardProps {
  activity: ActivityWithRelations
  isDragOverlay?: boolean
}

const {
  mockUseActivities,
  mockUseUpdateActivityStatus,
  mockUseActivitiesRealtime,
  mockKanbanColumn,
  mockActivityForm,
  mockActivityDetailModal,
  mockActivityCard,
} = vi.hoisted(() => {
  const mockKanbanColumn = vi.fn((props: MockKanbanColumnProps) => {
    const firstActivity = props.activities.find((a) => a.status === props.status)
    return (
      <div data-testid={`kanban-column-${props.status}`}>
        <span>{props.title}</span>
        <button
          data-testid={`select-activity-${props.status}`}
          onClick={() => firstActivity && props.onActivityClick?.(firstActivity)}
        >
          Select
        </button>
      </div>
    )
  })

  const mockActivityForm = vi.fn(({ activity, onClose }: MockActivityFormProps) => (
    <div data-testid={activity ? 'activity-form-edit' : 'activity-form-create'}>
      <button onClick={onClose}>close</button>
    </div>
  ))

  const mockActivityDetailModal = vi.fn(
    ({ activity, onClose, onEdit }: MockActivityDetailModalProps) => (
      <div data-testid="activity-detail-modal">
        <span>{activity?.title}</span>
        <button onClick={onEdit}>edit</button>
        <button onClick={onClose}>dismiss</button>
      </div>
    )
  )

  const mockActivityCard = vi.fn(({ activity }: MockActivityCardProps) => (
    <div data-testid={`activity-card-${activity.id}`}>{activity.title}</div>
  ))

  return {
    mockUseActivities: vi.fn(),
    mockUseUpdateActivityStatus: vi.fn(),
    mockUseActivitiesRealtime: vi.fn(),
    mockKanbanColumn,
    mockActivityForm,
    mockActivityDetailModal,
    mockActivityCard,
  }
})

const dndHandlers: { onDragStart?: (event: DragStartEvent) => void; onDragEnd?: (event: DragEndEvent) => void } = {}

const createDragStartEvent = (id: string): DragStartEvent => {
  const active = { id } as Active
  return { active } as DragStartEvent
}

const createDragEndEvent = (activeId: string, overId?: string): DragEndEvent => {
  const active = { id: activeId } as Active
  const over = overId ? ({ id: overId } as Over) : null
  return { active, over } as DragEndEvent
}

vi.mock('../hooks/useActivities', () => ({
  useActivities: mockUseActivities,
  useUpdateActivityStatus: mockUseUpdateActivityStatus,
}))

vi.mock('../hooks/useActivitiesRealtime', () => ({
  useActivitiesRealtime: mockUseActivitiesRealtime,
}))

vi.mock('./KanbanColumn', () => ({
  KanbanColumn: mockKanbanColumn,
}))

vi.mock('./ActivityForm', () => ({
  ActivityForm: mockActivityForm,
}))

vi.mock('./ActivityDetailModal', () => ({
  ActivityDetailModal: mockActivityDetailModal,
}))

vi.mock('./ActivityCard', () => ({
  ActivityCard: mockActivityCard,
}))

interface MockDndContextProps {
  children: ReactNode
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
}

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd }: MockDndContextProps) => {
    dndHandlers.onDragStart = onDragStart
    dndHandlers.onDragEnd = onDragEnd
    return <div data-testid="dnd-context">{children}</div>
  },
  DragOverlay: ({ children }: { children: ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
  closestCorners: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
}))

const sampleActivities: ActivityWithRelations[] = [
  {
    id: 'activity-1',
    user_id: 'user-1',
    client_id: 'client-1',
    project_id: 'project-1',
    title: 'Actividad 1',
    description: null,
    service_type: 'programacion',
    status: 'por_validar',
    estimated_hours: null,
    hourly_rate: null,
    observations: null,
    sort_order: 0,
    completed_at: null,
    invoiced_at: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'activity-2',
    user_id: 'user-1',
    client_id: 'client-1',
    project_id: 'project-1',
    title: 'Actividad 2',
    description: null,
    service_type: 'programacion',
    status: 'en_curso',
    estimated_hours: null,
    hourly_rate: null,
    observations: null,
    sort_order: 1,
    completed_at: null,
    invoiced_at: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

describe('KanbanBoard', () => {
  let updateStatusMutate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    dndHandlers.onDragStart = undefined
    dndHandlers.onDragEnd = undefined

    mockUseActivities.mockReturnValue({
      data: sampleActivities,
      isLoading: false,
    })

    updateStatusMutate = vi.fn()
    mockUseUpdateActivityStatus.mockReturnValue({
      mutate: updateStatusMutate,
    })
  })

  it('renders loading state when activities are being fetched', () => {
    mockUseActivities.mockReturnValue({
      data: null,
      isLoading: true,
    })

    render(<KanbanBoard />)

    expect(screen.getByText(/Cargando actividades/i)).toBeInTheDocument()
  })

  it('renders a column for each activity status and subscribes to realtime updates', () => {
    render(<KanbanBoard />)

    ACTIVITY_STATUSES.forEach((status) => {
      expect(screen.getByTestId(`kanban-column-${status.value}`)).toBeInTheDocument()
    })
    expect(mockUseActivitiesRealtime).toHaveBeenCalled()
  })

  it('opens the create activity form when clicking the new activity button', async () => {
    const user = userEvent.setup()
    render(<KanbanBoard />)

    await user.click(screen.getByRole('button', { name: /Nueva Actividad/i }))

    expect(screen.getByTestId('activity-form-create')).toBeInTheDocument()

    await user.click(screen.getByTestId('activity-form-create').querySelector('button')!)
    expect(screen.queryByTestId('activity-form-create')).not.toBeInTheDocument()
  })

  it('opens the detail modal when selecting an activity and switches to edit mode', async () => {
    const user = userEvent.setup()
    render(<KanbanBoard />)

    await user.click(screen.getByTestId('select-activity-por_validar'))
    expect(screen.getByTestId('activity-detail-modal')).toBeInTheDocument()

    await user.click(screen.getByTestId('activity-detail-modal').querySelector('button')!)
    expect(screen.getByTestId('activity-form-edit')).toBeInTheDocument()
  })

  it('shows drag overlay for active activity and updates status on drop', async () => {
    render(<KanbanBoard />)

    await act(async () => {
      dndHandlers.onDragStart?.(createDragStartEvent('activity-1'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('activity-card-activity-1')).toBeInTheDocument()
    })

    await act(async () => {
      dndHandlers.onDragEnd?.(createDragEndEvent('activity-1', 'en_curso'))
    })
    await waitFor(() => {
      expect(updateStatusMutate).toHaveBeenCalledWith({ id: 'activity-1', status: 'en_curso' })
    })
  })

  it('does not update status when drop target is missing or unchanged', async () => {
    render(<KanbanBoard />)

    await act(async () => {
      dndHandlers.onDragEnd?.(createDragEndEvent('activity-1', undefined))
    })
    await act(async () => {
      dndHandlers.onDragEnd?.(createDragEndEvent('activity-1', 'activity-1'))
    })

    expect(updateStatusMutate).not.toHaveBeenCalled()
  })
})
