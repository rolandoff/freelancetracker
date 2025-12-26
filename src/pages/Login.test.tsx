import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@/test/testUtils'
import { Login } from './Login'
import { ROUTES } from '@/lib/constants'

const supabaseMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
}))

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: supabaseMocks.signInWithPassword,
    },
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => routerMocks.navigate,
  }
})

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form with navigation links', () => {
    render(<Login />)

    expect(screen.getByRole('heading', { name: /freelancetracker/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /mot de passe oublié/i })).toHaveAttribute(
      'href',
      ROUTES.FORGOT_PASSWORD
    )
    expect(screen.getByRole('link', { name: /s'inscrire/i })).toHaveAttribute(
      'href',
      ROUTES.REGISTER
    )
  })

  it('shows validation errors when submitting empty form', async () => {
    render(<Login />)

    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(await screen.findByText(/email est requis/i)).toBeInTheDocument()
    expect(await screen.findByText(/mot de passe est requis/i)).toBeInTheDocument()
    expect(supabaseMocks.signInWithPassword).not.toHaveBeenCalled()
  })

  it('submits credentials and navigates to dashboard on success', async () => {
    supabaseMocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    render(<Login />)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(supabaseMocks.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password123',
      })
      expect(routerMocks.navigate).toHaveBeenCalledWith(ROUTES.DASHBOARD)
    })
  })

  it('shows authentication error when Supabase rejects request', async () => {
    supabaseMocks.signInWithPassword.mockRejectedValue(new Error('Identifiants invalides'))

    render(<Login />)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/mot de passe/i), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /se connecter/i }))

    expect(
      await screen.findByText(/identifiants invalides/i)
    ).toBeInTheDocument()
  })
})
