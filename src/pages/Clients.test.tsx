import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/testUtils'
import userEvent from '@testing-library/user-event'
import { Clients } from './Clients'

// Mock Supabase
const mockSupabase = vi.hoisted(() => {
  const mock: any = {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  }
  
  mock.from.mockReturnValue(mock)
  mock.select.mockReturnValue(mock)
  mock.eq.mockReturnValue(mock)
  mock.order.mockResolvedValue({ data: [], error: null })
  
  return mock
})

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
}

vi.mock('@/hooks/useToast', () => ({
  useToast: () => mockToast,
}))

const mockUser = { id: 'user-123', email: 'test@example.com' }

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}))

describe('Clients page', () => {
  it('renders heading and main sections', async () => {
    render(<Clients />)
    
    expect(screen.getByRole('heading', { name: /clients/i })).toBeInTheDocument()
    expect(screen.getByText(/gérez vos clients/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nouveau client/i })).toBeInTheDocument()
  })

  it('renders inactive filter checkbox', () => {
    render(<Clients />)
    
    expect(screen.getByLabelText(/afficher les clients inactifs/i)).toBeInTheDocument()
  })

  it('opens create modal when clicking Nouveau client button', async () => {
    const user = userEvent.setup()
    render(<Clients />)

    await user.click(screen.getByRole('button', { name: /nouveau client/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /nouveau client/i })).toBeInTheDocument()
    })
  })
})
