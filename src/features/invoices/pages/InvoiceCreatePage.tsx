import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useCreateInvoice, useInvoiceableActivities } from '../hooks/useInvoices'
import { useClients } from '@/features/clients/hooks/useClients'
import { formatCurrency } from '@/utils/format'
import { useToast } from '@/hooks/useToast'

interface SelectedActivity {
  id: string
  description: string
  hours: number
  rate: number
  total: number
}

interface InvoiceableActivity {
  id: string
  description: string | null
  estimated_hours: number | null
  hourly_rate: number | null
  project: { name: string } | null
}

export function InvoiceCreatePage() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const { data: clients } = useClients()
  const createInvoice = useCreateInvoice()

  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const { data: availableActivities, isLoading: isLoadingActivities } = useInvoiceableActivities(selectedClientId || null)
  
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([])
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [notes, setNotes] = useState('')

  // Calculate totals
  const selectedActivities: SelectedActivity[] = (availableActivities as InvoiceableActivity[] | undefined)
    ?.filter((act) => selectedActivityIds.includes(act.id))
    .map((act) => ({
      id: act.id,
      description: act.description || '',
      hours: act.estimated_hours || 0,
      rate: act.hourly_rate || 0,
      total: (act.estimated_hours || 0) * (act.hourly_rate || 0),
    })) || []

  const subtotal = selectedActivities.reduce((sum, act) => sum + act.total, 0)
  const discountValue =
    discountType === 'percentage' ? subtotal * (discountAmount / 100) : discountAmount
  const total = subtotal - discountValue

  const toggleActivity = (activityId: string) => {
    setSelectedActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      showError('Erreur', 'Veuillez sélectionner un client')
      return
    }

    if (selectedActivityIds.length === 0) {
      showError('Erreur', 'Veuillez sélectionner au moins une activité')
      return
    }

    try {
      await createInvoice.mutateAsync({
        client_id: selectedClientId,
        activity_ids: selectedActivityIds,
        discount_amount: discountAmount > 0 ? discountAmount : undefined,
        discount_type: discountAmount > 0 ? discountType : undefined,
        notes: notes || undefined,
      })

      success('Facture créée', 'La facture a été créée avec succès')
      navigate('/invoices')
    } catch (err) {
      showError('Erreur', err instanceof Error ? err.message : 'Impossible de créer la facture')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Facture</h1>
          <p className="text-muted-foreground">Créez une facture pour un client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="client">Sélectionner un client</Label>
              <select
                id="client"
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value)
                  setSelectedActivityIds([]) // Reset activities when client changes
                }}
                className="w-full px-3 py-2 border rounded-md border-border bg-background"
                required
              >
                <option value="">-- Choisir un client --</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Selection */}
        {selectedClientId && (
          <Card>
            <CardHeader>
              <CardTitle>Activités à facturer</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <p className="text-muted-foreground text-sm">Chargement des activités...</p>
              ) : !availableActivities || availableActivities.length === 0 ? (
                <div className="text-sm space-y-2">
                  <p className="text-muted-foreground">
                    Aucune activité complétée disponible pour ce client
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assurez-vous que:
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    <li>Le client a des projets assignés</li>
                    <li>Les activités sont marquées comme "Complétée"</li>
                    <li>Les activités ont des heures estimées et un taux horaire</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  {(availableActivities as InvoiceableActivity[] | undefined)?.map((activity) => {
                    const hours = activity.estimated_hours || 0
                    const rate = activity.hourly_rate || 0
                    const activityTotal = hours * rate

                    return (
                      <label
                        key={activity.id}
                        className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={selectedActivityIds.includes(activity.id)}
                          onChange={() => toggleActivity(activity.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{activity.description || 'Sin descripción'}</div>
                          <div className="text-sm text-muted-foreground">
                            Projet: {activity.project?.name || '-'}
                          </div>
                          <div className="text-sm mt-1">
                            {hours}h × {formatCurrency(rate)}/h = {formatCurrency(activityTotal)}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Totals & Discount */}
        {selectedActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Activities Summary */}
              <div className="space-y-2">
                {selectedActivities.map((act) => (
                  <div key={act.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {act.description} ({act.hours}h)
                    </span>
                    <span>{formatCurrency(act.total)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between font-medium">
                  <span>Sous-total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                  <Label>Remise (optionnelle)</Label>
                  <div className="flex gap-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="px-3 py-2 border rounded-md border-border bg-background"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">€</option>
                    </select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  {discountValue > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Remise appliquée: -{formatCurrency(discountValue)}
                    </p>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnelles)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-border bg-background"
                  rows={3}
                  placeholder="Notes additionnelles pour la facture..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/invoices')}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={!selectedClientId || selectedActivityIds.length === 0}
            isLoading={createInvoice.isPending}
          >
            Créer la facture
          </Button>
        </div>
      </form>
    </div>
  )
}
