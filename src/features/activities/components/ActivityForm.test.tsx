import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { ActivityForm } from './ActivityForm'
import type { Activity } from '@/types/database.types'

const {
  mockUseCreateActivity,
  mockUseUpdateActivity,
  mockUseClients,
  mockUseProjects,
  mockUseApplicableRate,
  mockCreateMutate,
  mockUpdateMutate,
} = vi.hoisted(() => {
  const mockCreateMutate = vi.fn()
  const mockUpdateMutate = vi.fn()
  return {
    mockUseCreateActivity: vi.fn(),
    mockUseUpdateActivity: vi.fn(),
    mockUseClients: vi.fn(),
    mockUseProjects: vi.fn(),
    mockUseApplicableRate: vi.fn(),
    mockCreateMutate,
    mockUpdateMutate,
  }
})

vi.mock('../hooks/useActivities', () => ({
  useCreateActivity: mockUseCreateActivity,
  useUpdateActivity: mockUseUpdateActivity,
}))

vi.mock('@/features/clients/hooks/useClients', () => ({
  useClients: mockUseClients,
}))

vi.mock('@/features/projects/hooks/useProjects', () => ({
  useProjects: mockUseProjects,
}))

vi.mock('@/features/rates/hooks/useRates', () => ({
  useApplicableRate: mockUseApplicableRate,
}))

const baseClients = [
  { id: 'client-1', name: 'Cliente Uno' },
  { id: 'client-2', name: 'Cliente Dos' },
]

const baseProjects = [
  { id: 'project-1', name: 'Proyecto Uno', client_id: 'client-1' },
  { id: 'project-2', name: 'Proyecto Dos', client_id: 'client-2' },
]

describe('ActivityForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateMutate.mockReset()
    mockUpdateMutate.mockReset()

    mockUseCreateActivity.mockReturnValue({
      mutateAsync: mockCreateMutate,
    })
    mockUseUpdateActivity.mockReturnValue({
      mutateAsync: mockUpdateMutate,
    })
    mockUseClients.mockReturnValue({ data: baseClients })
    mockUseProjects.mockReturnValue({ data: baseProjects })
    mockUseApplicableRate.mockReturnValue({ data: null })
  })

  const renderForm = (props?: Partial<React.ComponentProps<typeof ActivityForm>>) => {
    const onClose = vi.fn()
    render(<ActivityForm onClose={onClose} {...props} />)
    return { onClose }
  }

  it('renders required fields with default values', () => {
    renderForm()

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cliente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/proyecto/i)).toBeDisabled()
    expect(screen.getByLabelText(/tipo de servicio/i)).toHaveValue('programacion')
    expect(screen.getByLabelText(/estado/i)).toHaveValue('por_validar')
  })

  it('shows validation errors when required fields missing', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(screen.getByText(/El título es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/El cliente es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/El proyecto es requerido/i)).toBeInTheDocument()
    })
    expect(mockCreateMutate).not.toHaveBeenCalled()
  })

  it('filters projects by selected client', async () => {
    const user = userEvent.setup()
    renderForm()

    const clientSelect = screen.getByLabelText(/cliente/i)
    await user.selectOptions(clientSelect, 'client-2')

    const projectSelect = screen.getByLabelText(/proyecto/i)
    expect(projectSelect).not.toBeDisabled()

    // Only project tied to client-2 should be present (in addition to placeholder)
    const options = Array.from(projectSelect.querySelectorAll('option')).map((opt) => opt.value)
    expect(options).toContain('project-2')
    expect(options).not.toContain('project-1')
  })

  it('auto-fills hourly rate when applicable rate is available for new activity', async () => {
    mockUseApplicableRate.mockReturnValue({
      data: { hourly_rate: 150 },
    })

    renderForm()

    await waitFor(() => {
      expect(screen.getByLabelText(/Tarifa Horaria/i)).toHaveValue(150)
    })
  })

  it('submits create mutation with normalized data and closes form', async () => {
    const user = userEvent.setup()
    const onCloseSpy = renderForm().onClose
    mockCreateMutate.mockResolvedValue({})

    await user.type(screen.getByLabelText(/título/i), 'Nueva actividad')
    await user.type(screen.getByLabelText(/descripción/i), 'Detalles')
    await user.selectOptions(screen.getByLabelText(/cliente/i), 'client-1')
    const projectSelect = screen.getByLabelText(/proyecto/i)
    await waitFor(() => expect(projectSelect).not.toBeDisabled())
    await user.selectOptions(projectSelect, 'project-1')
    await user.type(screen.getByLabelText(/horas estimadas/i), '5')
    await user.type(screen.getByLabelText(/tarifa horaria/i), '120')

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nueva actividad',
          client_id: 'client-1',
          project_id: 'project-1',
          sort_order: 0,
          completed_at: null,
          invoiced_at: null,
        })
      )
      expect(onCloseSpy).toHaveBeenCalled()
    })
  })

  it('submits update mutation when editing activity', async () => {
    const user = userEvent.setup()
    const activity: Activity = {
      id: 'activity-1',
      user_id: 'user-1',
      client_id: 'client-1',
      project_id: 'project-1',
      title: 'Existente',
      description: 'Old desc',
      service_type: 'programacion',
      status: 'en_curso',
      estimated_hours: 10,
      hourly_rate: 100,
      observations: 'Obs',
      sort_order: 0,
      completed_at: null,
      invoiced_at: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }
    mockUpdateMutate.mockResolvedValue({})

    renderForm({ activity })

    await user.clear(screen.getByLabelText(/título/i))
    await user.type(screen.getByLabelText(/título/i), 'Actividad editada')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: 'activity-1',
        updates: expect.objectContaining({
          title: 'Actividad editada',
        }),
      })
    })
  })

  it('shows alert when mutation fails', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    mockCreateMutate.mockRejectedValue(new Error('Mutation failed'))

    renderForm()

    await user.type(screen.getByLabelText(/título/i), 'Nueva actividad')
    await user.selectOptions(screen.getByLabelText(/cliente/i), 'client-1')
    const projectSelect = screen.getByLabelText(/proyecto/i)
    await waitFor(() => expect(projectSelect).not.toBeDisabled())
    await user.selectOptions(projectSelect, 'project-1')

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error al guardar la actividad')
    })

    alertSpy.mockRestore()
  })
})
