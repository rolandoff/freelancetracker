import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { RatesTable } from './RatesTable'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Rate } from '@/types/database.types'

// Helper to create a complete mock UseQueryResult
const createMockQueryResult = (
  data: Rate[] | undefined,
  isLoading: boolean
): UseQueryResult<Rate[], Error> => ({
  data,
  isLoading,
  isSuccess: !isLoading && data !== undefined,
  isError: false,
  error: null,
  status: isLoading ? 'pending' : 'success',
  fetchStatus: 'idle',
  isPending: isLoading,
  isRefetching: false,
  isLoadingError: false,
  isRefetchError: false,
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isFetched: !isLoading,
  isFetchedAfterMount: !isLoading,
  isFetching: false,
  isPlaceholderData: false,
  isStale: false,
  refetch: vi.fn(),
  // @ts-expect-error - Partial mock
  promise: Promise.resolve(data),
})

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

const { mockDeleteRate, mockUseRates, mockCreateRate, mockUpdateRate } = vi.hoisted(() => ({
  mockDeleteRate: vi.fn(),
  mockUseRates: vi.fn(),
  mockCreateRate: vi.fn(),
  mockUpdateRate: vi.fn(),
}))

vi.mock('../hooks/useRates', () => ({
  useRates: mockUseRates,
  useDeleteRate: () => ({
    mutateAsync: mockDeleteRate,
  }),
  useCreateRate: () => ({
    mutateAsync: mockCreateRate,
    isPending: false,
  }),
  useUpdateRate: () => ({
    mutateAsync: mockUpdateRate,
    isPending: false,
  }),
}))

// Mock window.confirm
global.confirm = vi.fn(() => true)

describe('RatesTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock return value
    mockUseRates.mockReturnValue(createMockQueryResult(mockRates, false))
  })

  it('renders loading state', () => {
    mockUseRates.mockReturnValue(createMockQueryResult(undefined, true))

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

    mockUseRates.mockReturnValue(createMockQueryResult(clientRates, false))

    render(<RatesTable clientId="client-1" clientName="Test Client" />)
    expect(screen.getByText('Programación')).toBeInTheDocument()
  })

  it('shows empty state when no rates exist', () => {
    mockUseRates.mockReturnValue(createMockQueryResult([], false))

    render(<RatesTable />)
    expect(screen.getByText('No hay tarifas configuradas')).toBeInTheDocument()
  })

  it('calls delete mutation when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup()
    mockDeleteRate.mockResolvedValue({})

    render(<RatesTable />)

    // Get all buttons and find the ones with trash icons (delete buttons)
    const allButtons = screen.getAllByRole('button')
    const deleteButton = allButtons.find(btn => {
      const svg = btn.querySelector('svg')
      return svg?.classList.contains('lucide-trash2')
    })

    expect(deleteButton).toBeDefined()
    await user.click(deleteButton!)

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('¿Eliminar esta tarifa?')
      expect(mockDeleteRate).toHaveBeenCalledWith('rate-1')
    })
  })

  it('does not call delete when user cancels confirmation', async () => {
    const user = userEvent.setup()
    vi.mocked(global.confirm).mockReturnValue(false)

    render(<RatesTable />)

    // Get all buttons and find the ones with trash icons (delete buttons)
    const allButtons = screen.getAllByRole('button')
    const deleteButton = allButtons.find(btn => {
      const svg = btn.querySelector('svg')
      return svg?.classList.contains('lucide-trash2')
    })

    expect(deleteButton).toBeDefined()
    await user.click(deleteButton!)

    expect(mockDeleteRate).not.toHaveBeenCalled()
  })

  it('opens edit form when edit button is clicked', async () => {
    const user = userEvent.setup()
    mockUpdateRate.mockResolvedValue({})

    render(<RatesTable />)

    // Get all buttons and find the ones with pencil icons (edit buttons)
    const allButtons = screen.getAllByRole('button')
    const editButton = allButtons.find(btn => {
      const svg = btn.querySelector('svg')
      return svg?.classList.contains('lucide-pencil')
    })

    expect(editButton).toBeDefined()
    await user.click(editButton!)

    // The form should open - look for form title (just "Editar Tarifa" when editing existing rate)
    await waitFor(() => {
      expect(screen.getByText('Editar Tarifa')).toBeInTheDocument()
    })
  })
})
