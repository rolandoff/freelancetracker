import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Download, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { useInvoices, useUpdateInvoiceStatus, useDeleteInvoice } from '../hooks/useInvoices'
import { formatCurrency } from '@/utils/format'
import { format } from 'date-fns'

const STATUS_LABELS = {
  borrador: { label: 'Brouillon', variant: 'secondary' as const },
  en_espera_pago: { label: 'En attente', variant: 'default' as const },
  pagada: { label: 'Payée', variant: 'default' as const },
  anulada: { label: 'Annulée', variant: 'secondary' as const },
}

export function InvoicesPage() {
  const navigate = useNavigate()
  const { data: invoices, isLoading } = useInvoices()
  const updateStatus = useUpdateInvoiceStatus()
  const deleteInvoice = useDeleteInvoice()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredInvoices = statusFilter === 'all' 
    ? invoices 
    : invoices?.filter((inv) => inv.status === statusFilter)

  const handleMarkAsPaid = async (id: string) => {
    if (confirm('Marquer cette facture comme payée ?')) {
      await updateStatus.mutateAsync({ id, status: 'pagada' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette facture ? Cette action est irréversible.')) {
      await deleteInvoice.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Factures</h1>
          <p className="text-muted-foreground">Gérez vos factures clients</p>
        </div>
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          Toutes
        </Button>
        <Button
          variant={statusFilter === 'borrador' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setStatusFilter('borrador')}
        >
          Brouillons
        </Button>
        <Button
          variant={statusFilter === 'en_espera_pago' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setStatusFilter('en_espera_pago')}
        >
          En attente
        </Button>
        <Button
          variant={statusFilter === 'pagada' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setStatusFilter('pagada')}
        >
          Payées
        </Button>
      </div>

      {/* Table */}
      {!filteredInvoices || filteredInvoices.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Aucune facture trouvée. Créez votre première facture pour commencer.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableHead>N° Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const status = STATUS_LABELS[invoice.status as keyof typeof STATUS_LABELS]
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    {/* @ts-expect-error - Supabase join type */}
                    <TableCell>{invoice.client?.name || '-'}</TableCell>
                    <TableCell>
                      {invoice.invoice_date ? format(new Date(invoice.invoice_date), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    {/* @ts-expect-error - Supabase type */}
                    <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {invoice.status !== 'pagada' && invoice.status !== 'anulada' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsPaid(invoice.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {/* @ts-expect-error - Supabase type */}
                        {invoice.pdf_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // @ts-expect-error - Supabase type
                              window.open(invoice.pdf_url!, '_blank')
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {invoice.status === 'borrador' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
