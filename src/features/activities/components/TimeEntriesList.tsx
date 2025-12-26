import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TimeEntryForm } from './TimeEntryForm'
import { useTimeEntries, useDeleteTimeEntry, useActivityTotalHours } from '../hooks/useTimeEntries'
import { useToast } from '@/hooks/useToast'
import { formatDuration, formatDateTime } from '@/utils/format'
import type { TimeEntry } from '@/types/database.types'

interface TimeEntriesListProps {
  activityId: string
}

export function TimeEntriesList({ activityId }: TimeEntriesListProps) {
  const { data: entries, isLoading } = useTimeEntries(activityId)
  const { data: totalHours } = useActivityTotalHours(activityId)
  const deleteMutation = useDeleteTimeEntry()
  const { success, error: showError } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setIsFormOpen(true)
  }

  const handleDelete = async (entry: TimeEntry) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) return

    try {
      await deleteMutation.mutateAsync({ id: entry.id, activityId })
      success('Entrée supprimée', 'L\'entrée de temps a été supprimée')
    } catch (err) {
      showError('Erreur', err instanceof Error ? err.message : 'Impossible de supprimer l\'entrée')
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingEntry(null)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingEntry(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Entrées de temps</h3>
          {totalHours !== undefined && (
            <p className="text-sm text-muted-foreground">
              Total: {totalHours.toFixed(2)} heures
            </p>
          )}
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          Ajouter une entrée
        </Button>
      </div>

      {/* Entries Table */}
      {!entries || entries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Aucune entrée de temps. Ajoutez votre première entrée pour commencer le suivi.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const duration = entry.duration_minutes
                  ? formatDuration(entry.duration_minutes)
                  : 'En cours...'

                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {formatDateTime(entry.start_time)}
                    </TableCell>
                    <TableCell>
                      {entry.end_time
                        ? formatDateTime(entry.end_time)
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{duration}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry)}
                          disabled={deleteMutation.isPending}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        title={editingEntry ? 'Modifier l\'entrée' : 'Nouvelle entrée de temps'}
      >
        <TimeEntryForm
          activityId={activityId}
          editingEntry={editingEntry}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  )
}
