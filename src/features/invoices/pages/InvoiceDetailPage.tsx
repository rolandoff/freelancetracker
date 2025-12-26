import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Edit, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { useInvoice, useUpdateInvoiceStatus, useDeleteInvoice } from '../hooks/useInvoices'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/utils/format'
import { format } from 'date-fns'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  borrador: { label: 'Brouillon', variant: 'default' },
  en_espera_pago: { label: 'En attente', variant: 'secondary' },
  pagada: { label: 'Payée', variant: 'default' },
  anulada: { label: 'Annulée', variant: 'destructive' },
}

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: invoice, isLoading } = useInvoice(id!)
  const updateStatus = useUpdateInvoiceStatus()
  const deleteInvoice = useDeleteInvoice()

  const handleMarkAsPaid = async () => {
    if (!invoice) return

    try {
      await updateStatus.mutateAsync({
        id: invoice.id,
        status: 'pagada',
      })
      toast({ type: 'success', title: 'Facture marquée comme payée' })
    } catch (error) {
      toast({ type: 'error', title: 'Erreur' })
    }
  }

  const handleDelete = async () => {
    if (!invoice) return

    try {
      await deleteInvoice.mutateAsync(invoice.id)
      toast({ type: 'success', title: 'Facture supprimée' })
      navigate('/invoices')
    } catch (error) {
      toast({ type: 'error', title: 'Erreur lors de la suppression' })
    }
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    toast({ type: 'info', title: 'Génération PDF - À venir' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Facture introuvable</h2>
          <Button onClick={() => navigate('/invoices')} variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux factures
          </Button>
        </div>
      </div>
    )
  }

  const status = STATUS_LABELS[invoice.status] || STATUS_LABELS.borrador

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/invoices')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Facture {invoice.invoice_number}
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleDownloadPDF}
          variant="primary"
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>

        {invoice.status === 'borrador' && (
          <Button
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
            variant="secondary"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        )}

        {invoice.status === 'en_espera_pago' && (
          <Button
            onClick={handleMarkAsPaid}
            variant="primary"
            disabled={updateStatus.isPending}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marquer comme payée
          </Button>
        )}

        {invoice.status !== 'pagada' && (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="destructive"
            disabled={deleteInvoice.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        )}
      </div>

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Nom</div>
              {/* @ts-expect-error - Supabase type inference issue with joins */}
              <div className="font-medium">{invoice.client?.name}</div>
            </div>
            {/* @ts-expect-error - Supabase type inference issue with joins */}
            {invoice.client?.email && (
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{invoice.client.email}</div>
              </div>
            )}
            {invoice.client?.siret && (
              <div>
                <div className="text-sm text-muted-foreground">SIRET</div>
                <div className="font-medium">{invoice.client.siret}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la Facture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Activities */}
            <div>
              <h3 className="font-medium mb-4">Activités facturées</h3>
              <div className="space-y-2">
                {/* @ts-expect-error - Supabase type inference issue with joins */}
                {invoice.activities?.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{activity.description}</div>
                      {activity.project && (
                        <div className="text-sm text-muted-foreground">
                          {activity.project.name}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(activity.total_amount || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.total_hours || 0}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Sous-total</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>

              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    Remise
                    {/* @ts-expect-error - Supabase type inference issue */}
                    {invoice.discount_type === 'percentage' && 
                      ` (${invoice.discount_percentage}%)`
                    }
                  </span>
                  <span>-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total</span>
                {/* @ts-expect-error - Supabase type inference issue */}
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Notes</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirmer la suppression</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est
                irréversible.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  disabled={deleteInvoice.isPending}
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
