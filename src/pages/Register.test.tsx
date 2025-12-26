import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@/test/testUtils'
import { ROUTES } from '@/lib/constants'
import { Register } from './Register'

const supabaseMocks = vi.hoisted(() => {
  const insert = vi.fn()
  return {
    signUp: vi.fn(),
    from: vi.fn(() => ({
      insert,
    })),
    insert,
  }
})

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: supabaseMocks.signUp,
    },
    from: supabaseMocks.from,
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => routerMocks.navigate,
  }
})

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders form fields and navigation links', () => {
    render(<Register />)

    expect(screen.getByRole('heading', { name: /freelancetracker/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i, { selector: 'input#password' })).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /se connecter/i })).toHaveAttribute('href', ROUTES.LOGIN)
  })

  it('validates email, password and confirm password before submitting', async () => {
    render(<Register />)

    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }))

    expect(await screen.findByText(/email est requis/i)).toBeInTheDocument()
    expect(await screen.findByText(/mot de passe requis/i)).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(
      screen.getByLabelText(/mot de passe/i, { selector: 'input#password' }),
      'Password123'
    )
    await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'Different123')
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }))

    expect(await screen.findByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument()
    expect(supabaseMocks.signUp).not.toHaveBeenCalled()
  })

  it('registers user, creates settings, alerts and navigates on success', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    supabaseMocks.signUp.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    supabaseMocks.insert.mockResolvedValue({ error: null })

    render(<Register />)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/mot de passe/i, { selector: 'input#password' }), 'Password123')
    await userEvent.type(
      screen.getByLabelText(/confirmer le mot de passe/i),
      'Password123'
    )
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }))

    await waitFor(() => {
      expect(supabaseMocks.signUp).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password123',
      })
      expect(supabaseMocks.insert).toHaveBeenCalledWith({ user_id: 'user-1' })
      expect(alertSpy).toHaveBeenCalled()
      expect(routerMocks.navigate).toHaveBeenCalledWith(ROUTES.LOGIN)
    })
  })

  it('shows submit error when signUp fails', async () => {
    supabaseMocks.signUp.mockRejectedValue(new Error('Adresse déjà utilisée'))

    render(<Register />)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(
      screen.getByLabelText(/mot de passe/i, { selector: 'input#password' }),
      'Password123'
    )
    await userEvent.type(screen.getByLabelText(/confirmer le mot de passe/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /s'inscrire/i }))

    expect(await screen.findByText(/adresse déjà utilisée/i)).toBeInTheDocument()
  })
})
