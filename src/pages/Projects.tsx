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
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Archive, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Project, Client, Database } from '@/types/database.types'

interface ProjectFormData {
  client_id: string
  name: string
  description: string
  color: string
}

const emptyFormData: ProjectFormData = {
  client_id: '',
  name: '',
  description: '',
  color: '#3b82f6',
}

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Bleu' },
  { value: '#10b981', label: 'Vert' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ef4444', label: 'Rouge' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Rose' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
]

interface ProjectWithClient extends Project {
  client?: Client
}

export function Projects() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>(emptyFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showArchived, setShowArchived] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>('')

  // Fetch active clients for the dropdown
  const { data: clients } = useQuery({
    queryKey: ['clients', user?.id, 'active'],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as Client[]
    },
    enabled: !!user,
  })

  // Fetch projects with client data
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', user?.id, showArchived, selectedClient],
    queryFn: async () => {
      if (!user) return []

      let query = supabase
        .from('projects')
        .select('*, client:clients(*)')
        .eq('user_id', user.id)

      if (!showArchived) {
        query = query.eq('is_archived', false)
      }

      if (selectedClient) {
        query = query.eq('client_id', selectedClient)
      }

      query = query.order('name', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return data as ProjectWithClient[]
    },
    enabled: !!user,
  })

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (!user) throw new Error('User not authenticated')

      // @ts-expect-error - Supabase type issue with Database generic
      const { error } = await supabase.from('projects').insert({
        user_id: user.id,
        client_id: data.client_id,
        name: data.name,
        description: data.description || null,
        color: data.color,
        is_active: true,
        is_archived: false,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      success(t('projects.created'), t('projects.createdSuccess'))
      closeModal()
    },
    onError: (err: Error) => {
      error('Erreur', err.message || 'Impossible de créer le projet')
    },
  })

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectFormData }) => {
      const { error } = await supabase
        .from('projects')
        // @ts-expect-error - Supabase type inference issue
        .update({
          client_id: data.client_id,
          name: data.name,
          description: data.description || null,
          color: data.color,
        } as Database['public']['Tables']['projects']['Update'])
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      success(t('projects.updated'), t('projects.updatedSuccess'))
      closeModal()
    },
    onError: (err: Error) => {
      error(t('common.error'), err.message || t('projects.updateError'))
    },
  })

  // Toggle archive status mutation
  const toggleArchiveMutation = useMutation({
    mutationFn: async ({ id, is_archived }: { id: string; is_archived: boolean }) => {
      const { error } = await supabase
        .from('projects')
        // @ts-expect-error - Supabase type inference issue
        .update({ is_archived: !is_archived } as Database['public']['Tables']['projects']['Update'])
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      success(t('projects.statusUpdated'), t('projects.statusUpdatedSuccess'))
    },
    onError: (err: Error) => {
      error(t('common.error'), err.message || t('projects.statusUpdateError'))
    },
  })

  const openCreateModal = () => {
    setEditingProject(null)
    setFormData(emptyFormData)
    setErrors({})
    setIsModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setFormData({
      client_id: project.client_id,
      name: project.name,
      description: project.description || '',
      color: project.color || '#3b82f6',
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
    setFormData(emptyFormData)
    setErrors({})
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.client_id) {
      newErrors.client_id = t('projects.clientRequired')
    }

    if (!formData.name.trim()) {
      newErrors.name = t('projects.nameRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleToggleArchive = (project: Project) => {
    toggleArchiveMutation.mutate({ id: project.id, is_archived: project.is_archived })
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
          <div className="h-11 w-40 bg-muted rounded-lg animate-pulse" />
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
          <h1 className="text-3xl font-bold">{t('projects.title')}</h1>
          <p className="text-muted-foreground">{t('projects.subtitle')}</p>
        </div>
        <Button onClick={openCreateModal} disabled={!clients || clients.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          {t('projects.newProject')}
        </Button>
      </div>

      {/* No clients warning */}
      {(!clients || clients.length === 0) && (
        <div className="rounded-lg border border-amber-500 bg-amber-50 dark:bg-amber-950 p-4">
          <p className="text-amber-800 dark:text-amber-200">
            {t('projects.noClientsWarning')}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">{t('projects.client')}:</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
          >
            <option value="">{t('projects.allClients')}</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          {t('projects.showArchived')}
        </label>
      </div>

      {/* Table */}
      {!projects || projects.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {showArchived || selectedClient
              ? t('projects.noProjectsFound')
              : t('projects.noActiveProjects')}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableHead>{t('projects.name')}</TableHead>
              <TableHead>{t('projects.client')}</TableHead>
              <TableHead>{t('projects.description')}</TableHead>
              <TableHead>{t('projects.color')}</TableHead>
              <TableHead>{t('projects.status')}</TableHead>
              <TableHead className="text-right">{t('projects.actions')}</TableHead>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.client?.name || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {project.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-border"
                        style={{ backgroundColor: project.color || '#3b82f6' }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        project.is_archived
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      }`}
                    >
                      {project.is_archived ? t('projects.archived') : t('projects.active')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(project)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleArchive(project)}
                      >
                        <Archive className="h-4 w-4" />
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
        title={editingProject ? t('projects.editProject') : t('projects.newProject')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="client_id" required>
              {t('projects.client')}
            </Label>
            <select
              id="client_id"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-md border ${
                errors.client_id ? 'border-red-500' : 'border-border'
              } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500`}
              required
            >
              <option value="">{t('projects.selectClient')}</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.client_id}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>
              {t('projects.projectName')}
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Refonte site web"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t('projects.description')}
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder={t('projects.descriptionPlaceholder')}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">
              {t('projects.color')}
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, color: colorOption.value }))
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                    formData.color === colorOption.value
                      ? 'border-primary-500 ring-2 ring-primary-500'
                      : 'border-border'
                  } hover:border-primary-500 transition-colors`}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colorOption.value }}
                  />
                  <span className="text-sm">{colorOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingProject ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
