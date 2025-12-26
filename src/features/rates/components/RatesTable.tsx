import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { RateForm } from './RateForm'
import { useRates, useDeleteRate } from '../hooks/useRates'
import { SERVICE_TYPES } from '@/lib/constants'
import type { Rate } from '@/types/database.types'

interface RatesTableProps {
  clientId?: string | null
  clientName?: string
}

export function RatesTable({ clientId, clientName }: RatesTableProps) {
  const { data: rates, isLoading } = useRates()
  const deleteRate = useDeleteRate()
  const [editingRate, setEditingRate] = useState<Rate | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const filteredRates = clientId
    ? rates?.filter((r) => r.client_id === clientId)
    : rates?.filter((r) => r.client_id === null)

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta tarifa?')) {
      await deleteRate.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando tarifas...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {clientName ? `Tarifas para ${clientName}` : 'Tarifas Base'}
        </h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarifa
        </Button>
      </div>

      {filteredRates && filteredRates.length > 0 ? (
        <div className="grid gap-3">
          {filteredRates.map((rate) => {
            const serviceType = SERVICE_TYPES.find((s) => s.value === rate.service_type)
            return (
              <Card key={rate.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{serviceType?.label || rate.service_type}</h4>
                      <Badge variant={rate.is_active ? 'default' : 'secondary'}>
                        {rate.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {rate.hourly_rate.toFixed(2)} €/h
                      </span>
                      {rate.description && <span>{rate.description}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRate(rate)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rate.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          No hay tarifas configuradas
        </Card>
      )}

      {isCreating && (
        <RateForm
          clientId={clientId}
          clientName={clientName}
          onClose={() => setIsCreating(false)}
        />
      )}

      {editingRate && (
        <RateForm
          rate={editingRate}
          clientId={clientId}
          clientName={clientName}
          onClose={() => setEditingRate(null)}
        />
      )}
    </div>
  )
}
