import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@/test/testUtils'
import type { ActivityWithRelations } from '../hooks/useActivities'
import { ActivityDetailModal } from './ActivityDetailModal'

const mockUseActivityTotalHours = vi.hoisted(() => vi.fn())
const timeEntriesProps = vi.hoisted(() => [] as Array<{ activityId: string }>)

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean
    onClose: () => void
    title: ReactNode
    children: ReactNode
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose}>close</button>
        {children}
      </div>
    ) : null,
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="badge" {...props}>
      {children}
    </span>
  ),
}))

vi.mock('@/utils/format', () => ({
  formatCurrency: (value: number) => `€${value}`,
  formatHours: (minutes: number) => `${minutes} minutes`,
}))

vi.mock('../hooks/useTimeEntries', () => ({
  useActivityTotalHours: mockUseActivityTotalHours,
}))

vi.mock('./TimeEntriesList', () => ({
  TimeEntriesList: (props: { activityId: string }) => {
    timeEntriesProps.push(props)
    return <div data-testid="time-entries-list" />
  },
}))

const baseActivity: ActivityWithRelations = {
  id: 'activity-1',
  user_id: 'user-1',
  client_id: 'client-1',
  project_id: 'project-1',
  title: 'Analyse fonctionnelle',
  description: 'Analyse détaillée des besoins client',
  service_type: 'programacion',
  status: 'en_curso',
  estimated_hours: 10,
  hourly_rate: 120,
  observations: 'Prévoir un point hebdomadaire',
  sort_order: 0,
  completed_at: '2025-01-02T00:00:00Z',
  invoiced_at: '2025-01-05T00:00:00Z',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  client: { id: 'client-1', name: 'Société Alpine' },
  project: { id: 'project-1', name: 'Portail Freelance', color: '#FF0000' },
}

describe('ActivityDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    timeEntriesProps.length = 0
    mockUseActivityTotalHours.mockReturnValue({ data: 2 })
  })

  it('returns null when activity is not provided', () => {
    const { container } = render(<ActivityDetailModal activity={null} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders activity details, badges, costs and observations', () => {
    render(<ActivityDetailModal activity={baseActivity} onClose={vi.fn()} />)

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Analyse fonctionnelle')).toBeInTheDocument()
    expect(screen.getByText('Analyse détaillée des besoins client')).toBeInTheDocument()
    expect(screen.getAllByTestId('badge')).toHaveLength(2)
    expect(screen.getByText('Société Alpine')).toBeInTheDocument()
    expect(screen.getByText('Portail Freelance')).toBeInTheDocument()
    expect(screen.getByText('Tarif horaire')).toBeInTheDocument()
    expect(screen.getByText('Temps estimé')).toBeInTheDocument()
    expect(screen.getByText('Temps réel')).toBeInTheDocument()
    expect(screen.getByText('€1200')).toBeInTheDocument()
    expect(screen.getByText('€240')).toBeInTheDocument()
    expect(screen.getByText(/Prévoir un point hebdomadaire/)).toBeInTheDocument()
  })

  it('passes activity id to TimeEntriesList and handles edit/close actions', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onClose = vi.fn()

    render(
      <ActivityDetailModal activity={baseActivity} onClose={onClose} onEdit={onEdit} />
    )

    expect(timeEntriesProps).toEqual([{ activityId: 'activity-1' }])

    await user.click(screen.getByRole('button', { name: /Modifier/i }))
    expect(onEdit).toHaveBeenCalled()

    await user.click(screen.getByText('close'))
    expect(onClose).toHaveBeenCalled()
  })
})
