import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileSettings } from './ProfileSettings'
import { supabase } from '@/lib/supabase'
import * as useAuthModule from '@/hooks/useAuth'
import * as useToastModule from '@/hooks/useToast'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/useToast')

const mockUserSettings = {
  id: 'settings-1',
  user_id: 'user-1',
  company_name: 'My Company',
  siret: '12345678901234',
  address: '123 Rue de la Paix',
  city: 'Paris',
  postal_code: '75001',
  country: 'FR',
  tva_applicable: false,
  taux_cotisations: 24.6,
  plafond_ca_annuel: 77700,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
}

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2025-01-01T00:00:00Z',
  role: 'authenticated',
  updated_at: '2025-01-01T00:00:00Z',
}

const mockSuccess = vi.fn()
const mockError = vi.fn()

describe('ProfileSettings', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()

    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      isAuthenticated: true,
    })

    vi.mocked(useToastModule.useToast).mockReturnValue({
      toast: vi.fn(),
      success: mockSuccess,
      error: mockError,
      info: vi.fn(),
      warning: vi.fn(),
      remove: vi.fn(),
    })
  })

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileSettings />
      </QueryClientProvider>
    )

  describe('Loading State', () => {
    it('should show loading spinner while fetching settings', () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(new Promise(() => {})),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderComponent()

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()
    })
  })

  describe('Form Rendering', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUserSettings,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should render profile form with all fields', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/SIRET/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Code postal/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Ville/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Pays/i)).toBeInTheDocument()
      })
    })

    it('should display loaded settings data in form fields', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('My Company')).toBeInTheDocument()
        expect(screen.getByDisplayValue('12345678901234')).toBeInTheDocument()
        expect(screen.getByDisplayValue('123 Rue de la Paix')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Paris')).toBeInTheDocument()
        expect(screen.getByDisplayValue('75001')).toBeInTheDocument()
        expect(screen.getByDisplayValue('FR')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUserSettings,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should validate SIRET format on submit', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('12345678901234')).toBeInTheDocument()
      })

      const siretInput = screen.getByLabelText(/SIRET/i)
      await user.clear(siretInput)
      await user.type(siretInput, '123')

      const submitButton = screen.getByRole('button', {
        name: /Enregistrer les modifications/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Le SIRET doit contenir exactement 14 chiffres/i)).toBeInTheDocument()
      })
    })

    it('should clear validation error when field is corrected', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('12345678901234')).toBeInTheDocument()
      })

      const siretInput = screen.getByLabelText(/SIRET/i)
      await user.clear(siretInput)
      await user.type(siretInput, '123')

      const submitButton = screen.getByRole('button', {
        name: /Enregistrer les modifications/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Le SIRET doit contenir exactement 14 chiffres/i)).toBeInTheDocument()
      })

      await user.clear(siretInput)
      await user.type(siretInput, '98765432109876')

      expect(screen.queryByText(/Le SIRET doit contenir exactement 14 chiffres/i)).not.toBeInTheDocument()
    })

    it('should allow empty optional fields', async () => {
      const user = userEvent.setup()
      const mockUpdate = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUserSettings,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('12345678901234')).toBeInTheDocument()
      })

      const siretInput = screen.getByLabelText(/SIRET/i)
      await user.clear(siretInput)

      const submitButton = screen.getByRole('button', {
        name: /Enregistrer les modifications/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled()
      })
    })
  })

  describe('Form Submission', () => {
    it('should update settings on valid form submission', async () => {
      const user = userEvent.setup()
      const mockUpdate = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUserSettings,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockUpdate,
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('My Company')).toBeInTheDocument()
      })

      const companyInput = screen.getByLabelText(/Nom de l'entreprise/i)
      await user.clear(companyInput)
      await user.type(companyInput, 'Updated Company')

      const submitButton = screen.getByRole('button', {
        name: /Enregistrer les modifications/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('user-1')
      })

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith(
          'Profil mis à jour',
          'Vos informations ont été enregistrées avec succès'
        )
      })
    })

    it('should disable form during submission', async () => {
      const user = userEvent.setup()
      let resolveUpdate: () => void
      const updatePromise = new Promise<{ data: null; error: null }>((resolve) => {
        resolveUpdate = () => resolve({ data: null, error: null })
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUserSettings,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(updatePromise),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('My Company')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', {
        name: /Enregistrer les modifications/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/i)).toBeDisabled()
        expect(screen.getByLabelText(/SIRET/i)).toBeDisabled()
      })

      resolveUpdate!()
    })

    it('should show error toast on submission failure', async () => {
      const user = userEvent.setup()
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUserSettings,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('My Company')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', {
        name: /Enregistrer les modifications/i,
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith(
          'Erreur',
          'Database error'
        )
      })
    })
  })

  describe('Field Updates', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUserSettings,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should update company name field', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('My Company')).toBeInTheDocument()
      })

      const input = screen.getByLabelText(/Nom de l'entreprise/i)
      await user.clear(input)
      await user.type(input, 'New Company')

      expect(screen.getByDisplayValue('New Company')).toBeInTheDocument()
    })

    it('should enforce SIRET maxLength of 14 characters', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('12345678901234')).toBeInTheDocument()
      })

      const siretInput = screen.getByLabelText(/SIRET/i)
      expect(siretInput).toHaveAttribute('maxLength', '14')
    })

    it('should enforce country code maxLength of 2 characters', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByDisplayValue('FR')).toBeInTheDocument()
      })

      const countryInput = screen.getByLabelText(/Pays/i)
      expect(countryInput).toHaveAttribute('maxLength', '2')
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch error gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Fetch error'),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/i)).toBeInTheDocument()
      })

      const companyInput = screen.getByLabelText(/Nom de l'entreprise/i)
      expect(companyInput).toHaveValue('')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUserSettings,
              error: null,
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should have proper labels for all form fields', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByLabelText(/Nom de l'entreprise/i)).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/SIRET/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Code postal/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Ville/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Pays/i)).toBeInTheDocument()
    })

    it('should have descriptive placeholders', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Mon Entreprise SARL')).toBeInTheDocument()
      })

      expect(screen.getByPlaceholderText('12345678901234')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('123 Rue de la Paix')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('75001')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Paris')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('FR')).toBeInTheDocument()
    })
  })
})
