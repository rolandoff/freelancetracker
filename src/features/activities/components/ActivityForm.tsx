import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Modal } from '@/components/ui/Modal'
import { SERVICE_TYPES, ACTIVITY_STATUSES } from '@/lib/constants'
import { useCreateActivity, useUpdateActivity } from '../hooks/useActivities'
import { useClients } from '@/features/clients/hooks/useClients'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useApplicableRate } from '@/features/rates/hooks/useRates'
import type { Activity, ServiceType, ActivityStatus } from '@/types/database.types'
import { useEffect } from 'react'

interface ActivityFormProps {
  activity?: Activity
  onClose: () => void
}

interface ActivityFormData {
  title: string
  description: string
  client_id: string
  project_id: string
  service_type: ServiceType
  status: ActivityStatus
  estimated_hours: number
  hourly_rate: number
  observations: string
}

export function ActivityForm({ activity, onClose }: ActivityFormProps) {
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()
  const { data: clients } = useClients()
  const { data: projects } = useProjects()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    defaultValues: activity
      ? {
          title: activity.title,
          description: activity.description || '',
          client_id: activity.client_id,
          project_id: activity.project_id,
          service_type: activity.service_type,
          status: activity.status,
          estimated_hours: activity.estimated_hours || 0,
          hourly_rate: activity.hourly_rate || 0,
          observations: activity.observations || '',
        }
      : {
          title: '',
          description: '',
          client_id: '',
          project_id: '',
          service_type: 'programacion',
          status: 'por_validar',
          estimated_hours: 0,
          hourly_rate: 0,
          observations: '',
        },
  })

  const selectedClientId = watch('client_id')
  const selectedServiceType = watch('service_type')

  // Fetch applicable rate when client or service type changes
  const { data: applicableRate } = useApplicableRate(
    selectedServiceType,
    selectedClientId || null
  )

  // Auto-fill hourly rate when applicable rate is found
  useEffect(() => {
    if (applicableRate && !activity) {
      setValue('hourly_rate', applicableRate.hourly_rate)
    }
  }, [applicableRate, activity, setValue])

  // Filter projects by selected client
  const filteredProjects = selectedClientId
    ? projects?.filter((p: any) => p.client_id === selectedClientId)
    : []

  const onSubmit = async (data: ActivityFormData) => {
    try {
      if (activity) {
        await updateActivity.mutateAsync({
          id: activity.id,
          updates: {
            ...data,
            estimated_hours: data.estimated_hours || null,
            hourly_rate: data.hourly_rate || null,
            description: data.description || null,
            observations: data.observations || null,
          },
        })
      } else {
        await createActivity.mutateAsync({
          ...data,
          sort_order: 0,
          completed_at: null,
          invoiced_at: null,
          estimated_hours: data.estimated_hours || null,
          hourly_rate: data.hourly_rate || null,
          description: data.description || null,
          observations: data.observations || null,
        })
      }
      onClose()
    } catch (error) {
      console.error('Error saving activity:', error)
      alert('Error al guardar la actividad')
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={activity ? 'Editar Actividad' : 'Nueva Actividad'}
      size="lg"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title', { required: 'El título es requerido' })}
              placeholder="Nombre de la actividad"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full px-3 py-2 border rounded-md min-h-[80px]"
              placeholder="Descripción detallada de la actividad"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <select
                id="client_id"
                {...register('client_id', { required: 'El cliente es requerido' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Seleccionar cliente</option>
                {clients?.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="text-sm text-destructive">{errors.client_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Proyecto *</Label>
              <select
                id="project_id"
                {...register('project_id', { required: 'El proyecto es requerido' })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!selectedClientId}
              >
                <option value="">Seleccionar proyecto</option>
                {filteredProjects?.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="text-sm text-destructive">{errors.project_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">Tipo de Servicio *</Label>
              <select
                id="service_type"
                {...register('service_type', { required: 'Required' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border rounded-md"
              >
                {ACTIVITY_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Horas Estimadas</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                {...register('estimated_hours', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">
                Tarifa Horaria (€)
                {applicableRate && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (auto-rellenado)
                  </span>
                )}
              </Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                {...register('hourly_rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <textarea
              id="observations"
              {...register('observations')}
              className="w-full px-3 py-2 border rounded-md min-h-[60px]"
              placeholder="Notas adicionales"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
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
