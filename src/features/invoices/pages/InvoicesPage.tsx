import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Download, Trash2, CheckCircle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
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
          <h1 className="text-3xl font-bold">Factures</h1>
          <p className="text-muted-foreground">Gérez vos factures clients</p>
        </div>
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <label className="text-sm font-medium">Statut:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
        >
          <option value="all">Toutes</option>
          <option value="borrador">Brouillons</option>
          <option value="en_espera_pago">En attente</option>
          <option value="pagada">Payées</option>
        </select>
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
        <EmptyState
          icon={FileText}
          title={statusFilter === 'all' ? 'Aucune facture' : 'Aucune facture avec ce statut'}
          description={statusFilter === 'all' ? 'Créez votre première facture pour commencer à facturer vos clients.' : 'Essayez un autre filtre ou créez une nouvelle facture.'}
          actionLabel={statusFilter === 'all' ? 'Nouvelle Facture' : undefined}
          onAction={statusFilter === 'all' ? () => navigate('/invoices/new') : undefined}
        />
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
    </motion.div>
  )
}
