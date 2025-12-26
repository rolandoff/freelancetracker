import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { validateEmail, validateSIRET } from '@/utils/validation'
import { formatSIRET } from '@/utils/format'
import { useTranslation } from 'react-i18next'
import type { Client } from '@/types/database.types'

interface ClientFormData {
  name: string
  email: string
  phone: string
  siret: string
  tva_intracommunautaire: string
  address: string
  city: string
  postal_code: string
  country: string
  notes: string
}

const emptyFormData: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  siret: '',
  tva_intracommunautaire: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'FR',
  notes: '',
}

export function Clients() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<ClientFormData>(emptyFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showInactive, setShowInactive] = useState(false)

  // Fetch clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', user?.id, showInactive],
    queryFn: async () => {
      if (!user) return []

      let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (!showInactive) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Client[]
    },
    enabled: !!user,
  })

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      if (!user) throw new Error('User not authenticated')

      // @ts-expect-error - Supabase type issue with Database generic
      const { error } = await supabase.from('clients').insert({
        user_id: user.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        siret: data.siret || null,
        tva_intracommunautaire: data.tva_intracommunautaire || null,
        address: data.address || null,
        city: data.city || null,
        postal_code: data.postal_code || null,
        country: data.country,
        notes: data.notes || null,
        is_active: true,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      success(t('clients.created'), t('clients.createdSuccess'))
      closeModal()
    },
    onError: (err: Error) => {
      error('Erreur', err.message || 'Impossible de créer le client')
    },
  })

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientFormData }) => {
      const { error } = await supabase
        .from('clients')
        // @ts-expect-error - Supabase type issue with Database generic
        .update({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          siret: data.siret || null,
          tva_intracommunautaire: data.tva_intracommunautaire || null,
          address: data.address || null,
          city: data.city || null,
          postal_code: data.postal_code || null,
          country: data.country,
          notes: data.notes || null,
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      success(t('clients.updated'), t('clients.updatedSuccess'))
      closeModal()
    },
    onError: (err: Error) => {
      error(t('common.error'), err.message || t('clients.updateError'))
    },
  })

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('clients')
        // @ts-expect-error - Supabase type issue with Database generic
        .update({ is_active: !is_active })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      success(t('clients.statusUpdated'), t('clients.statusUpdatedSuccess'))
    },
    onError: (err: Error) => {
      error(t('common.error'), err.message || t('clients.statusUpdateError'))
    },
  })

  const openCreateModal = () => {
    setEditingClient(null)
    setFormData(emptyFormData)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      siret: client.siret || '',
      tva_intracommunautaire: client.tva_intracommunautaire || '',
      address: client.address || '',
      city: client.city || '',
      postal_code: client.postal_code || '',
      country: client.country,
      notes: client.notes || '',
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
    setFormData(emptyFormData)
    setErrors({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    if (formData.email && !validateEmail(formData.email).valid) {
      newErrors.email = validateEmail(formData.email).error || ''
    }

    if (formData.siret) {
      const siretValidation = validateSIRET(formData.siret)
      if (!siretValidation.valid) {
        newErrors.siret = siretValidation.error || ''
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleToggleActive = (client: Client) => {
    toggleActiveMutation.mutate({ id: client.id, is_active: client.is_active })
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-11 w-32 bg-muted rounded-lg animate-pulse" />
        </div>
        <TableSkeleton rows={8} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('clients.title')}</h1>
          <p className="text-muted-foreground">{t('clients.subtitle')}</p>
        </div>
        <Button onClick={openCreateModal}>{t('clients.newClient')}</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          {t('clients.showInactive')}
        </label>
      </div>

      {/* Table */}
      {!clients || clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={showInactive ? t('clients.noClientsFound') : t('clients.noActiveClients')}
          description={showInactive ? t('clients.tryDifferentFilters') : t('clients.createFirstClient')}
          actionLabel={!showInactive ? t('clients.newClient') : undefined}
          onAction={!showInactive ? openCreateModal : undefined}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>SIRET</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>{client.siret ? formatSIRET(client.siret) : '-'}</TableCell>
                  <TableCell>{client.city || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {client.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(client)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(client)}
                      >
                        {client.is_active ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingClient ? t('clients.editClient') : t('clients.newClient')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>
              Nom du client
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="ACME Corp"
              required
            />
          </div>

          {/* Email & Phone */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="contact@acme.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>

          {/* SIRET & TVA */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                name="siret"
                value={formData.siret}
                onChange={handleChange}
                error={errors.siret}
                placeholder="12345678901234"
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tva_intracommunautaire">TVA Intracommunautaire</Label>
              <Input
                id="tva_intracommunautaire"
                name="tva_intracommunautaire"
                value={formData.tva_intracommunautaire}
                onChange={handleChange}
                placeholder="FR12345678901"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Rue de la Paix"
            />
          </div>

          {/* City, Postal Code, Country */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="75001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="FR"
                maxLength={2}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingClient ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
