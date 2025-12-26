import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Modal } from '@/components/ui/Modal'
import { SERVICE_TYPES } from '@/lib/constants'
import { useCreateRate, useUpdateRate } from '../hooks/useRates'
import type { Rate, ServiceType } from '@/types/database.types'

interface RateFormProps {
  rate?: Rate
  clientId?: string | null
  clientName?: string
  onClose: () => void
}

interface RateFormData {
  service_type: ServiceType
  hourly_rate: number
  description: string
  is_active: boolean
}

export function RateForm({ rate, clientId, clientName, onClose }: RateFormProps) {
  const createRate = useCreateRate()
  const updateRate = useUpdateRate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RateFormData>({
    defaultValues: rate
      ? {
          service_type: rate.service_type,
          hourly_rate: rate.hourly_rate,
          description: rate.description || '',
          is_active: rate.is_active,
        }
      : {
          service_type: 'programacion',
          hourly_rate: 0,
          description: '',
          is_active: true,
        },
  })

  const onSubmit = async (data: RateFormData) => {
    setIsSubmitting(true)
    try {
      if (rate) {
        await updateRate.mutateAsync({
          id: rate.id,
          updates: data,
        })
      } else {
        await createRate.mutateAsync({
          ...data,
          client_id: clientId || null,
        })
      }
      onClose()
    } catch (error) {
      console.error('Error saving rate:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={rate ? 'Editar Tarifa' : clientName ? `Nueva Tarifa para ${clientName}` : 'Nueva Tarifa Base'}
      size="lg"
    >
      <div className="space-y-4">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_type">Tipo de Servicio</Label>
            <select
              id="service_type"
              {...register('service_type', { required: 'Required' })}
              className="w-full px-3 py-2 border rounded-md"
              disabled={!!rate}
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.service_type && (
              <p className="text-sm text-destructive">{errors.service_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Tarifa Horaria (€)</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              {...register('hourly_rate', {
                required: 'Required',
                min: { value: 0, message: 'Must be positive' },
                valueAsNumber: true,
              })}
            />
            {errors.hourly_rate && (
              <p className="text-sm text-destructive">{errors.hourly_rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input id="description" {...register('description')} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" {...register('is_active')} />
            <Label htmlFor="is_active">Activa</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
