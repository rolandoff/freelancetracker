import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useCreateTimeEntry, useUpdateTimeEntry } from '../hooks/useTimeEntries'
import { useToast } from '@/hooks/useToast'
import type { TimeEntry } from '@/types/database.types'

interface TimeEntryFormProps {
  activityId: string
  editingEntry?: TimeEntry | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function TimeEntryForm({ activityId, editingEntry, onSuccess, onCancel }: TimeEntryFormProps) {
  const { success, error: showError } = useToast()
  const createMutation = useCreateTimeEntry()
  const updateMutation = useUpdateTimeEntry()

  const [formData, setFormData] = useState({
    start_time: editingEntry?.start_time
      ? new Date(editingEntry.start_time).toISOString().slice(0, 16)
      : '',
    end_time: editingEntry?.end_time
      ? new Date(editingEntry.end_time).toISOString().slice(0, 16)
      : '',
    notes: editingEntry?.notes || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.start_time) {
      newErrors.start_time = 'L\'heure de début est requise'
    }

    if (formData.end_time && new Date(formData.end_time) <= new Date(formData.start_time)) {
      newErrors.end_time = 'L\'heure de fin doit être après l\'heure de début'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const entryData = {
      activity_id: activityId,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
      notes: formData.notes || null,
    }

    try {
      if (editingEntry) {
        await updateMutation.mutateAsync({
          id: editingEntry.id,
          updates: entryData,
        })
        success('Entrée modifiée', 'L\'entrée de temps a été mise à jour')
      } else {
        await createMutation.mutateAsync(entryData)
        success('Entrée créée', 'L\'entrée de temps a été ajoutée')
      }

      // Reset form
      setFormData({
        start_time: '',
        end_time: '',
        notes: '',
      })

      onSuccess?.()
    } catch (err) {
      showError('Erreur', err instanceof Error ? err.message : 'Impossible de sauvegarder l\'entrée')
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Start Time */}
        <div className="space-y-2">
          <Label htmlFor="start_time" required>
            Début
          </Label>
          <Input
            id="start_time"
            name="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={handleChange}
            error={errors.start_time}
            disabled={isLoading}
            required
          />
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <Label htmlFor="end_time">Fin</Label>
          <Input
            id="end_time"
            name="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={handleChange}
            error={errors.end_time}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Laisser vide si le temps est toujours en cours
          </p>
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
          placeholder="Notes sur cette période de travail..."
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {editingEntry ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
