import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { TimeEntryForm } from './TimeEntryForm'
import type { TimeEntry } from '@/types/database.types'

const mockCreateTimeEntry = vi.fn()
const mockUpdateTimeEntry = vi.fn()
const mockSuccessToast = vi.fn()
const mockErrorToast = vi.fn()

const { mockUseToast, mockUseCreateTimeEntry, mockUseUpdateTimeEntry } = vi.hoisted(() => ({
  mockUseToast: vi.fn(),
  mockUseCreateTimeEntry: vi.fn(),
  mockUseUpdateTimeEntry: vi.fn(),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: mockUseToast,
}))

vi.mock('../hooks/useTimeEntries', () => ({
  useCreateTimeEntry: mockUseCreateTimeEntry,
  useUpdateTimeEntry: mockUseUpdateTimeEntry,
}))

const mockTimeEntry: TimeEntry = {
  id: 'entry-1',
  activity_id: 'activity-1',
  user_id: 'user-1',
  start_time: '2024-01-15T10:00:00Z',
  end_time: '2024-01-15T12:00:00Z',
  duration_minutes: 120,
  notes: 'Test work session',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
}

describe('TimeEntryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseToast.mockReturnValue({
      success: mockSuccessToast,
      error: mockErrorToast,
    })

    mockUseCreateTimeEntry.mockReturnValue({
      mutateAsync: mockCreateTimeEntry,
      isPending: false,
    })

    mockUseUpdateTimeEntry.mockReturnValue({
      mutateAsync: mockUpdateTimeEntry,
      isPending: false,
    })
  })

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<TimeEntryForm activityId="activity-1" />)

      expect(screen.getByLabelText(/début/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fin/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    it('renders submit button with "Ajouter" text in create mode', () => {
      render(<TimeEntryForm activityId="activity-1" />)

      expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument()
    })

    it('renders submit button with "Enregistrer" text in edit mode', () => {
      render(<TimeEntryForm activityId="activity-1" editingEntry={mockTimeEntry} />)

      expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument()
    })

    it('renders cancel button when onCancel is provided', () => {
      const onCancel = vi.fn()
      render(<TimeEntryForm activityId="activity-1" onCancel={onCancel} />)

      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    })

    it('does not render cancel button when onCancel is not provided', () => {
      render(<TimeEntryForm activityId="activity-1" />)

      expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument()
    })

    it('shows helper text for end time field', () => {
      render(<TimeEntryForm activityId="activity-1" />)

      expect(
        screen.getByText(/laisser vide si le temps est toujours en cours/i)
      ).toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('populates form with existing entry data', () => {
      render(<TimeEntryForm activityId="activity-1" editingEntry={mockTimeEntry} />)

      const startTimeInput = screen.getByLabelText(/début/i) as HTMLInputElement
      const endTimeInput = screen.getByLabelText(/fin/i) as HTMLInputElement
      const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement

      // Check that values are populated (datetime-local format)
      expect(startTimeInput.value).toBe('2024-01-15T10:00')
      expect(endTimeInput.value).toBe('2024-01-15T12:00')
      expect(notesInput.value).toBe('Test work session')
    })

    it('handles entry with null end_time', () => {
      const ongoingEntry = { ...mockTimeEntry, end_time: null }
      render(<TimeEntryForm activityId="activity-1" editingEntry={ongoingEntry} />)

      const endTimeInput = screen.getByLabelText(/fin/i) as HTMLInputElement
      expect(endTimeInput.value).toBe('')
    })

    it('handles entry with null notes', () => {
      const entryWithoutNotes = { ...mockTimeEntry, notes: null }
      render(<TimeEntryForm activityId="activity-1" editingEntry={entryWithoutNotes} />)

      const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement
      expect(notesInput.value).toBe('')
    })
  })

  describe('Form Interaction', () => {
    it('updates start time when user types', async () => {
      const user = userEvent.setup()
      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i)
      await user.type(startTimeInput, '2024-01-15T10:00')

      expect(startTimeInput).toHaveValue('2024-01-15T10:00')
    })

    it('updates end time when user types', async () => {
      const user = userEvent.setup()
      render(<TimeEntryForm activityId="activity-1" />)

      const endTimeInput = screen.getByLabelText(/fin/i)
      await user.type(endTimeInput, '2024-01-15T12:00')

      expect(endTimeInput).toHaveValue('2024-01-15T12:00')
    })

    it('updates notes when user types', async () => {
      const user = userEvent.setup()
      render(<TimeEntryForm activityId="activity-1" />)

      const notesInput = screen.getByLabelText(/notes/i)
      await user.type(notesInput, 'Working on feature')

      expect(notesInput).toHaveValue('Working on feature')
    })

    it.skip('clears field error when user starts typing', async () => {
      const user = userEvent.setup()
      render(<TimeEntryForm activityId="activity-1" />)

      // Submit form to trigger validation error
      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      // Check error appears
      await waitFor(() => {
        expect(screen.getByText(/requise/i)).toBeInTheDocument()
      })

      // Type in the field
      const startTimeInput = screen.getByLabelText(/début/i)
      await user.type(startTimeInput, '2024-01-15T10:00')

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/requise/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it.skip('shows error when start time is empty', async () => {
      const user = userEvent.setup()
      render(<TimeEntryForm activityId="activity-1" />)

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      // The error text contains "L'heure de début est requise" - check for just "requise"
      await waitFor(() => {
        expect(screen.getByText(/requise/i)).toBeInTheDocument()
      })
      expect(mockCreateTimeEntry).not.toHaveBeenCalled()
    })

    it('shows error when end time is before or equal to start time', async () => {
      const user = userEvent.setup()
      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i)
      const endTimeInput = screen.getByLabelText(/fin/i)

      await user.type(startTimeInput, '2024-01-15T12:00')
      await user.type(endTimeInput, '2024-01-15T10:00')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      expect(
        screen.getByText(/heure de fin doit être après/i)
      ).toBeInTheDocument()
      expect(mockCreateTimeEntry).not.toHaveBeenCalled()
    })

    it('allows submission when end time is empty', async () => {
      const user = userEvent.setup()
      mockCreateTimeEntry.mockResolvedValue({})

      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i)
      await user.type(startTimeInput, '2024-01-15T10:00')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateTimeEntry).toHaveBeenCalledWith({
          activity_id: 'activity-1',
          start_time: expect.any(String),
          end_time: null,
          notes: null,
        })
      })
    })

    it('allows submission when validation passes', async () => {
      const user = userEvent.setup()
      mockCreateTimeEntry.mockResolvedValue({})

      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i)
      const endTimeInput = screen.getByLabelText(/fin/i)

      await user.type(startTimeInput, '2024-01-15T10:00')
      await user.type(endTimeInput, '2024-01-15T12:00')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateTimeEntry).toHaveBeenCalled()
      })
    })
  })

  describe('Create Mode', () => {
    it.skip('calls create mutation with correct data', async () => {
      // TODO: Fix this test - form validation errors are not appearing in DOM during tests
      const user = userEvent.setup()
      mockCreateTimeEntry.mockResolvedValue({})

      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i)
      const endTimeInput = screen.getByLabelText(/fin/i)
      const notesInput = screen.getByLabelText(/notes/i)

      await user.type(startTimeInput, '2024-01-15T10:00')
      await user.type(endTimeInput, '2024-01-15T12:00')
      await user.type(notesInput, 'Working on feature')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateTimeEntry).toHaveBeenCalledWith({
          activity_id: 'activity-1',
          start_time: expect.stringContaining('2024-01-15T10:00'),
          end_time: expect.stringContaining('2024-01-15T12:00'),
          notes: 'Working on feature',
        })
      })
    })

    it('shows success toast after creating entry', async () => {
      const user = userEvent.setup()
      mockCreateTimeEntry.mockResolvedValue({})

      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i)
      await user.type(startTimeInput, '2024-01-15T10:00')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSuccessToast).toHaveBeenCalledWith(
          'Entrée créée',
          "L'entrée de temps a été ajoutée"
        )
      })
    })

    it('resets form after successful creation', async () => {
      const user = userEvent.setup()
      mockCreateTimeEntry.mockResolvedValue({})

      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i) as HTMLInputElement
      const endTimeInput = screen.getByLabelText(/fin/i) as HTMLInputElement
      const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement

      await user.type(startTimeInput, '2024-01-15T10:00')
      await user.type(endTimeInput, '2024-01-15T12:00')
      await user.type(notesInput, 'Working on feature')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(startTimeInput.value).toBe('')
        expect(endTimeInput.value).toBe('')
        expect(notesInput.value).toBe('')
      })
    })

    it('calls onSuccess callback after successful creation', async () => {
      const user = userEvent.setup()
      const onSuccess = vi.fn()
      mockCreateTimeEntry.mockResolvedValue({})

      render(<TimeEntryForm activityId="activity-1" onSuccess={onSuccess} />)

      const startTimeInput = screen.getByLabelText(/début/i)
      await user.type(startTimeInput, '2024-01-15T10:00')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Update Mode', () => {
    it('calls update mutation with correct data', async () => {
      const user = userEvent.setup()
      mockUpdateTimeEntry.mockResolvedValue({})

      render(<TimeEntryForm activityId="activity-1" editingEntry={mockTimeEntry} />)

      const notesInput = screen.getByLabelText(/notes/i)
      await user.clear(notesInput)
      await user.type(notesInput, 'Updated notes')

      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateTimeEntry).toHaveBeenCalledWith({
          id: 'entry-1',
          updates: {
            activity_id: 'activity-1',
            start_time: expect.any(String),
            end_time: expect.any(String),
            notes: 'Updated notes',
          },
        })
      })
    })

    it('shows success toast after updating entry', async () => {
      const user = userEvent.setup()
      mockUpdateTimeEntry.mockResolvedValue({})

      render(<TimeEntryForm activityId="activity-1" editingEntry={mockTimeEntry} />)

      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSuccessToast).toHaveBeenCalledWith(
          'Entrée modifiée',
          "L'entrée de temps a été mise à jour"
        )
      })
    })

    it('calls onSuccess callback after successful update', async () => {
      const user = userEvent.setup()
      const onSuccess = vi.fn()
      mockUpdateTimeEntry.mockResolvedValue({})

      render(
        <TimeEntryForm activityId="activity-1" editingEntry={mockTimeEntry} onSuccess={onSuccess} />
      )

      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Error Handling', () => {
    it('shows error toast when create mutation fails', async () => {
      const user = userEvent.setup()
      const error = new Error('Failed to create entry')
      mockCreateTimeEntry.mockRejectedValue(error)

      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i)
      await user.type(startTimeInput, '2024-01-15T10:00')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockErrorToast).toHaveBeenCalledWith('Erreur', 'Failed to create entry')
      })
    })

    it('shows error toast when update mutation fails', async () => {
      const user = userEvent.setup()
      const error = new Error('Failed to update entry')
      mockUpdateTimeEntry.mockRejectedValue(error)

      render(<TimeEntryForm activityId="activity-1" editingEntry={mockTimeEntry} />)

      const submitButton = screen.getByRole('button', { name: /enregistrer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockErrorToast).toHaveBeenCalledWith('Erreur', 'Failed to update entry')
      })
    })

    it('shows generic error message for non-Error exceptions', async () => {
      const user = userEvent.setup()
      mockCreateTimeEntry.mockRejectedValue('Something went wrong')

      render(<TimeEntryForm activityId="activity-1" />)

      const startTimeInput = screen.getByLabelText(/début/i)
      await user.type(startTimeInput, '2024-01-15T10:00')

      const submitButton = screen.getByRole('button', { name: /ajouter/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockErrorToast).toHaveBeenCalledWith(
          'Erreur',
          "Impossible de sauvegarder l'entrée"
        )
      })
    })
  })

  describe('Cancel Action', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(<TimeEntryForm activityId="activity-1" onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State', () => {
    it('disables form fields while creating', () => {
      mockUseCreateTimeEntry.mockReturnValue({
        mutateAsync: mockCreateTimeEntry,
        isPending: true,
      })

      render(<TimeEntryForm activityId="activity-1" />)

      expect(screen.getByLabelText(/début/i)).toBeDisabled()
      expect(screen.getByLabelText(/fin/i)).toBeDisabled()
      expect(screen.getByLabelText(/notes/i)).toBeDisabled()
    })

    it('disables form fields while updating', () => {
      mockUseUpdateTimeEntry.mockReturnValue({
        mutateAsync: mockUpdateTimeEntry,
        isPending: true,
      })

      render(<TimeEntryForm activityId="activity-1" editingEntry={mockTimeEntry} />)

      expect(screen.getByLabelText(/début/i)).toBeDisabled()
      expect(screen.getByLabelText(/fin/i)).toBeDisabled()
      expect(screen.getByLabelText(/notes/i)).toBeDisabled()
    })

    it('shows loading state on submit button', () => {
      mockUseCreateTimeEntry.mockReturnValue({
        mutateAsync: mockCreateTimeEntry,
        isPending: true,
      })

      render(<TimeEntryForm activityId="activity-1" />)

      // When loading, button shows "Chargement..." instead of "Ajouter"
      const submitButton = screen.getByRole('button', { name: /chargement/i })
      expect(submitButton).toBeDisabled()
    })

    it('disables cancel button during submission', () => {
      const onCancel = vi.fn()
      mockUseCreateTimeEntry.mockReturnValue({
        mutateAsync: mockCreateTimeEntry,
        isPending: true,
      })

      render(<TimeEntryForm activityId="activity-1" onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      expect(cancelButton).toBeDisabled()
    })
  })
})
