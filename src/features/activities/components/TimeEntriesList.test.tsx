import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { TimeEntriesList } from './TimeEntriesList'
import type { TimeEntry } from '@/types/database.types'

const {
  mockUseTimeEntries,
  mockUseDeleteTimeEntry,
  mockUseActivityTotalHours,
  mockUseToast,
  mockFormatDuration,
  mockFormatDateTime,
  mockTimeEntryForm,
} = vi.hoisted(() => ({
  mockUseTimeEntries: vi.fn(),
  mockUseDeleteTimeEntry: vi.fn(),
  mockUseActivityTotalHours: vi.fn(),
  mockUseToast: vi.fn(),
  mockFormatDuration: vi.fn(),
  mockFormatDateTime: vi.fn(),
  mockTimeEntryForm: vi.fn(
    (props: { editingEntry: TimeEntry | null; onSuccess?: () => void; onCancel?: () => void }) => (
      <div data-testid="time-entry-form">
        <span data-testid="editing-entry">{props.editingEntry?.id ?? 'new-entry'}</span>
        <button type="button" data-testid="mock-success" onClick={() => props.onSuccess?.()}>
          trigger-success
        </button>
        <button type="button" data-testid="mock-cancel" onClick={() => props.onCancel?.()}>
          trigger-cancel
        </button>
      </div>
    )
  ),
}))

const mockSuccessToast = vi.fn()
const mockErrorToast = vi.fn()
const mockDeleteMutation = vi.fn()

vi.mock('../hooks/useTimeEntries', () => ({
  useTimeEntries: mockUseTimeEntries,
  useDeleteTimeEntry: mockUseDeleteTimeEntry,
  useActivityTotalHours: mockUseActivityTotalHours,
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: mockUseToast,
}))

vi.mock('@/utils/format', () => ({
  formatDuration: mockFormatDuration,
  formatDateTime: mockFormatDateTime,
}))

vi.mock('./TimeEntryForm', () => ({
  TimeEntryForm: mockTimeEntryForm,
}))

const createEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  id: 'entry-1',
  activity_id: 'activity-1',
  user_id: 'user-1',
  start_time: '2024-01-15T10:00:00Z',
  end_time: '2024-01-15T12:00:00Z',
  duration_minutes: 120,
  notes: 'Worked on feature',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T12:00:00Z',
  ...overrides,
})

describe('TimeEntriesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseTimeEntries.mockReturnValue({
      data: [createEntry()],
      isLoading: false,
    })

    mockUseActivityTotalHours.mockReturnValue({
      data: 4.5,
    })

    mockUseDeleteTimeEntry.mockReturnValue({
      mutateAsync: mockDeleteMutation,
      isPending: false,
    })

    mockUseToast.mockReturnValue({
      success: mockSuccessToast,
      error: mockErrorToast,
    })

    mockDeleteMutation.mockResolvedValue(undefined)
    mockFormatDateTime.mockImplementation((value: string) => `formatted-${value}`)
    mockFormatDuration.mockImplementation((value: number | null | undefined) => `duration-${value}`)
  })

  it('renders loader while fetching entries', () => {
    // Arrange
    mockUseTimeEntries.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    // Act
    const { container } = render(<TimeEntriesList activityId="activity-1" />)

    // Assert
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })

  it('renders empty state when no entries are available', () => {
    // Arrange
    mockUseTimeEntries.mockReturnValue({
      data: [],
      isLoading: false,
    })

    // Act
    render(<TimeEntriesList activityId="activity-1" />)

    // Assert
    expect(
      screen.getByText(/Aucune entrée de temps. Ajoutez votre première entrée/i)
    ).toBeInTheDocument()
  })

  it('renders entries table with formatted values and total hours', () => {
    // Arrange
    const entry = createEntry({ id: 'entry-2', start_time: '2024-02-01T08:00:00Z' })
    mockUseTimeEntries.mockReturnValue({
      data: [entry],
      isLoading: false,
    })
    mockUseActivityTotalHours.mockReturnValue({
      data: 3.789,
    })

    // Act
    render(<TimeEntriesList activityId="activity-1" />)

    // Assert
    expect(mockFormatDateTime).toHaveBeenCalledWith(entry.start_time)
    expect(mockFormatDuration).toHaveBeenCalledWith(entry.duration_minutes)
    expect(screen.getByText(/Total: 3.79 heures/)).toBeInTheDocument()
    expect(screen.getByText(`formatted-${entry.start_time}`)).toBeInTheDocument()
    expect(screen.getByText('duration-120')).toBeInTheDocument()
  })

  it('opens the form modal when clicking the add entry button', async () => {
    // Arrange
    mockUseTimeEntries.mockReturnValue({
      data: [],
      isLoading: false,
    })
    const user = userEvent.setup()

    // Act
    render(<TimeEntriesList activityId="activity-1" />)
    await user.click(screen.getByRole('button', { name: /ajouter une entrée/i }))

    // Assert
    expect(screen.getByTestId('time-entry-form')).toBeInTheDocument()
    expect(screen.getByTestId('editing-entry')).toHaveTextContent('new-entry')
  })

  it('opens edit form with the selected entry', async () => {
    // Arrange
    const user = userEvent.setup()
    mockUseTimeEntries.mockReturnValue({
      data: [createEntry(), createEntry({ id: 'entry-2' })],
      isLoading: false,
    })

    // Act
    render(<TimeEntriesList activityId="activity-1" />)
    const editButtons = screen.getAllByRole('button', { name: /modifier/i })
    await user.click(editButtons[0])

    // Assert
    expect(screen.getByTestId('editing-entry')).toHaveTextContent('entry-1')
  })

  it('calls delete mutation and shows success toast on confirmation', async () => {
    // Arrange
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Act
    render(<TimeEntriesList activityId="activity-1" />)
    await user.click(screen.getByRole('button', { name: /supprimer/i }))

    // Assert
    await waitFor(() => {
      expect(mockDeleteMutation).toHaveBeenCalledWith({ id: 'entry-1', activityId: 'activity-1' })
    })
    expect(mockSuccessToast).toHaveBeenCalledWith('Entrée supprimée', "L'entrée de temps a été supprimée")

    confirmSpy.mockRestore()
  })

  it('shows error toast when deletion fails', async () => {
    // Arrange
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const error = new Error('Delete failed')
    mockDeleteMutation.mockRejectedValueOnce(error)

    // Act
    render(<TimeEntriesList activityId="activity-1" />)
    await user.click(screen.getByRole('button', { name: /supprimer/i }))

    // Assert
    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith('Erreur', 'Delete failed')
    })

    confirmSpy.mockRestore()
  })

  it('does not delete entry when user cancels confirmation', async () => {
    // Arrange
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    // Act
    render(<TimeEntriesList activityId="activity-1" />)
    await user.click(screen.getByRole('button', { name: /supprimer/i }))

    // Assert
    expect(mockDeleteMutation).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('disables delete button while mutation is pending', () => {
    // Arrange
    mockUseDeleteTimeEntry.mockReturnValue({
      mutateAsync: mockDeleteMutation,
      isPending: true,
    })

    // Act
    render(<TimeEntriesList activityId="activity-1" />)

    // Assert
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeDisabled()
  })

  it('closes the modal when the form reports success', async () => {
    // Arrange
    mockUseTimeEntries.mockReturnValue({
      data: [],
      isLoading: false,
    })
    const user = userEvent.setup()

    // Act
    render(<TimeEntriesList activityId="activity-1" />)
    await user.click(screen.getByRole('button', { name: /ajouter une entrée/i }))
    await user.click(screen.getByTestId('mock-success'))

    // Assert
    await waitFor(() => {
      expect(screen.queryByTestId('time-entry-form')).not.toBeInTheDocument()
    })
  })
})
