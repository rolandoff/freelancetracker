import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { RatesTable } from './RatesTable'

const mockRates = [
  {
    id: 'rate-1',
    user_id: 'user-1',
    client_id: null,
    service_type: 'programacion' as const,
    hourly_rate: 50,
    description: 'Base rate for programming',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rate-2',
    user_id: 'user-1',
    client_id: null,
    service_type: 'diseno' as const,
    hourly_rate: 45,
    description: null,
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

const mockDeleteRate = vi.fn()

vi.mock('../hooks/useRates', () => ({
  useRates: vi.fn(() => ({
    data: mockRates,
    isLoading: false,
  })),
  useDeleteRate: () => ({
    mutateAsync: mockDeleteRate,
  }),
}))

// Mock window.confirm
global.confirm = vi.fn(() => true)

describe('RatesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    const { useRates } = require('../hooks/useRates')
    useRates.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    render(<RatesTable />)
    expect(screen.getByText('Cargando tarifas...')).toBeInTheDocument()
  })

  it('renders base rates title', () => {
    render(<RatesTable />)
    expect(screen.getByText('Tarifas Base')).toBeInTheDocument()
  })

  it('renders client-specific rates title', () => {
    render(<RatesTable clientId="client-1" clientName="Test Client" />)
    expect(screen.getByText('Tarifas para Test Client')).toBeInTheDocument()
  })

  it('renders rate cards with service type and hourly rate', () => {
    render(<RatesTable />)
    expect(screen.getByText('Programación')).toBeInTheDocument()
    expect(screen.getByText('50.00 €/h')).toBeInTheDocument()
  })

  it('renders active badge for active rates', () => {
    render(<RatesTable />)
    expect(screen.getByText('Activa')).toBeInTheDocument()
  })

  it('renders inactive badge for inactive rates', () => {
    render(<RatesTable />)
    expect(screen.getByText('Inactiva')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<RatesTable />)
    expect(screen.getByText('Base rate for programming')).toBeInTheDocument()
  })

  it('opens create form when Nueva Tarifa button is clicked', async () => {
    const user = userEvent.setup()
    render(<RatesTable />)
    
    const newRateButton = screen.getByText('Nueva Tarifa')
    await user.click(newRateButton)
    
    // Form should be rendered (checking for title)
    await waitFor(() => {
      expect(screen.getByText('Nueva Tarifa Base')).toBeInTheDocument()
    })
  })

  it('filters rates by client when clientId is provided', () => {
    const clientRates = [
      {
        ...mockRates[0],
        id: 'rate-3',
        client_id: 'client-1',
      },
    ]

    const { useRates } = require('../hooks/useRates')
    useRates.mockReturnValue({
      data: clientRates,
      isLoading: false,
    })

    render(<RatesTable clientId="client-1" clientName="Test Client" />)
    expect(screen.getByText('Programación')).toBeInTheDocument()
  })

  it('shows empty state when no rates exist', () => {
    const { useRates } = require('../hooks/useRates')
    useRates.mockReturnValue({
      data: [],
      isLoading: false,
    })

    render(<RatesTable />)
    expect(screen.getByText('No hay tarifas configuradas')).toBeInTheDocument()
  })

  it('calls delete mutation when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup()
    mockDeleteRate.mockResolvedValue({})
    
    render(<RatesTable />)
    
    const deleteButtons = screen.getAllByTitle(/delete/i)
    await user.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('¿Eliminar esta tarifa?')
      expect(mockDeleteRate).toHaveBeenCalledWith('rate-1')
    })
  })

  it('does not call delete when user cancels confirmation', async () => {
    const user = userEvent.setup()
    vi.mocked(global.confirm).mockReturnValue(false)
    
    render(<RatesTable />)
    
    const deleteButtons = screen.getAllByTitle(/delete/i)
    await user.click(deleteButtons[0])
    
    expect(mockDeleteRate).not.toHaveBeenCalled()
  })

  it('opens edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<RatesTable />)
    
    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn => btn.querySelector('svg'))
    
    if (editButton) {
      await user.click(editButton)
      
      await waitFor(() => {
        expect(screen.getByText('Editar Tarifa')).toBeInTheDocument()
      })
    }
  })
})
