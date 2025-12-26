import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Clients } from './Clients'
import { supabase } from '@/lib/supabase'
import * as useAuthModule from '@/hooks/useAuth'
import * as useToastModule from '@/hooks/useToast'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}))

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/useToast')

const mockClients = [
  {
    id: '1',
    user_id: 'user-1',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+33123456789',
    siret: '12345678901234',
    tva_intracommunautaire: 'FR12345678901',
    address: '123 Rue de la Paix',
    city: 'Paris',
    postal_code: '75001',
    country: 'FR',
    notes: 'Good client',
    is_active: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Tech Solutions',
    email: 'hello@tech.com',
    phone: null,
    siret: null,
    tva_intracommunautaire: null,
    address: null,
    city: 'Lyon',
    postal_code: null,
    country: 'FR',
    notes: null,
    is_active: true,
    created_at: '2025-01-02',
    updated_at: '2025-01-02',
  },
  {
    id: '3',
    user_id: 'user-1',
    name: 'Inactive Client',
    email: 'old@client.com',
    phone: null,
    siret: null,
    tva_intracommunautaire: null,
    address: null,
    city: null,
    postal_code: null,
    country: 'FR',
    notes: null,
    is_active: false,
    created_at: '2025-01-03',
    updated_at: '2025-01-03',
  },
]

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

describe('Clients Page', () => {
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

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <Clients />
      </QueryClientProvider>
    )

  describe('Loading State', () => {
    it('should show loading spinner while fetching clients', () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue(new Promise(() => {})),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderPage()

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no clients exist', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderPage()

      await waitFor(() => {
        expect(
          screen.getByText(/Aucun client actif. Créez votre premier client pour commencer./i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Client List Rendering', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: mockClients.filter((c) => c.is_active),
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should display list of active clients by default', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
        expect(screen.getByText('Tech Solutions')).toBeInTheDocument()
        expect(screen.queryByText('Inactive Client')).not.toBeInTheDocument()
      })
    })

    it('should display client details in table', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('contact@acme.com')).toBeInTheDocument()
        expect(screen.getByText('+33123456789')).toBeInTheDocument()
        expect(screen.getByText('12 345 678 901 234')).toBeInTheDocument() // Formatted SIRET
        expect(screen.getByText('Paris')).toBeInTheDocument()
      })
    })

    it('should display dash for missing optional fields', async () => {
      renderPage()

      await waitFor(() => {
        const row = screen.getByText('Tech Solutions').closest('tr')
        expect(row).toBeInTheDocument()
        const cells = within(row!).getAllByRole('cell')
        expect(cells[2]).toHaveTextContent('-') // Phone
        expect(cells[3]).toHaveTextContent('-') // SIRET
      })
    })

    it('should show active status badges correctly', async () => {
      renderPage()

      await waitFor(() => {
        const badges = screen.getAllByText('Actif')
        expect(badges).toHaveLength(2)
      })
    })
  })

  describe('Filter Functionality', () => {
    it('should show inactive clients when checkbox is checked', async () => {
      const user = userEvent.setup()
      let isShowInactive = false

      const mockFrom = vi.fn().mockImplementation(() => {
        const filteredClients = isShowInactive
          ? mockClients
          : mockClients.filter((c) => c.is_active)

        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: filteredClients,
                  error: null,
                }),
              }),
            }),
          }),
        }
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderPage()

      await waitFor(() => {
        expect(screen.queryByText('Inactive Client')).not.toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText(/Afficher les clients inactifs/i)
      await user.click(checkbox)

      isShowInactive = true

      await waitFor(() => {
        expect(screen.getByText('Inactive Client')).toBeInTheDocument()
      })
    })
  })

  describe('Create Client Flow', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should open create modal when clicking Nouveau client button', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByText(/Aucun client actif/i)).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', { name: /Nouveau client/i })
      await user.click(createButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText(/Nom du client/i)).toBeInTheDocument()
    })

    it('should validate required fields on submit', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nouveau client/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))

      const submitButton = screen.getByRole('button', { name: /Créer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Le nom est requis')).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nouveau client/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))

      const nameInput = screen.getByLabelText(/Nom du client/i)
      const emailInput = screen.getByLabelText(/Email/i)

      await user.type(nameInput, 'Test Client')
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /Créer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Format d'email invalide/i)).toBeInTheDocument()
      })
    })

    it('should validate SIRET format', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nouveau client/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))

      const nameInput = screen.getByLabelText(/Nom du client/i)
      const siretInput = screen.getByLabelText(/SIRET/i)

      await user.type(nameInput, 'Test Client')
      await user.type(siretInput, '123') // Invalid SIRET

      const submitButton = screen.getByRole('button', { name: /Créer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Le SIRET doit contenir exactement 14 chiffres/i)).toBeInTheDocument()
      })
    })

    it('should create client with valid data', async () => {
      const user = userEvent.setup()
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
        insert: mockInsert,
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nouveau client/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))

      await user.type(screen.getByLabelText(/Nom du client/i), 'New Client')
      await user.type(screen.getByLabelText(/Email/i), 'new@client.com')
      await user.type(screen.getByLabelText(/SIRET/i), '12345678901234')

      const submitButton = screen.getByRole('button', { name: /Créer/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Client',
            email: 'new@client.com',
            siret: '12345678901234',
            is_active: true,
          })
        )
      })

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith(
          'Client créé',
          'Le client a été ajouté avec succès'
        )
      })
    })

    it('should close modal after successful creation', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nouveau client/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))
      await user.type(screen.getByLabelText(/Nom du client/i), 'New Client')
      await user.click(screen.getByRole('button', { name: /Créer/i }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edit Client Flow', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [mockClients[0]],
                error: null,
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should open edit modal with pre-filled data', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const editButton = screen.getByRole('button', { name: /Modifier/i })
      await user.click(editButton)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()
      expect(screen.getByDisplayValue('contact@acme.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('12345678901234')).toBeInTheDocument()
    })

    it('should update client with modified data', async () => {
      const user = userEvent.setup()
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [mockClients[0]],
                error: null,
              }),
            }),
          }),
        }),
        update: mockUpdate,
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Modifier/i }))

      const nameInput = screen.getByDisplayValue('Acme Corp')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Corp')

      await user.click(screen.getByRole('button', { name: /Enregistrer/i }))

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Corp',
          })
        )
      })

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith(
          'Client modifié',
          'Les modifications ont été enregistrées'
        )
      })
    })
  })

  describe('Toggle Active Status', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [mockClients[0]],
                error: null,
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should toggle client status when clicking Désactiver button', async () => {
      const user = userEvent.setup()
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [mockClients[0]],
                error: null,
              }),
            }),
          }),
        }),
        update: mockUpdate,
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      })

      const deactivateButton = screen.getByRole('button', { name: /Désactiver/i })
      await user.click(deactivateButton)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({ is_active: false })
      })

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith(
          'Statut modifié',
          'Le statut du client a été mis à jour'
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error toast when create fails', async () => {
      const user = userEvent.setup()
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom)

      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nouveau client/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))
      await user.type(screen.getByLabelText(/Nom du client/i), 'Test Client')
      await user.click(screen.getByRole('button', { name: /Créer/i }))

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Erreur', 'Database error')
      })
    })
  })

  describe('Modal Management', () => {
    beforeEach(() => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      })
      vi.mocked(supabase.from).mockImplementation(mockFrom)
    })

    it('should close modal when clicking Cancel button', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nouveau client/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /Annuler/i }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should reset form when closing modal', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nouveau client/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))
      await user.type(screen.getByLabelText(/Nom du client/i), 'Test')
      await user.click(screen.getByRole('button', { name: /Annuler/i }))

      await user.click(screen.getByRole('button', { name: /Nouveau client/i }))
      expect(screen.getByLabelText(/Nom du client/i)).toHaveValue('')
    })
  })
})
