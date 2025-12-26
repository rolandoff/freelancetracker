import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { TimeEntriesList } from './TimeEntriesList'
import { formatCurrency, formatHours } from '@/utils/format'
import { ACTIVITY_STATUSES, SERVICE_TYPES } from '@/lib/constants'
import { useActivityTotalHours } from '../hooks/useTimeEntries'
import type { ActivityWithRelations } from '../hooks/useActivities'
import { Clock, DollarSign, Calendar, User, Briefcase, FileText } from 'lucide-react'

interface ActivityDetailModalProps {
  activity: ActivityWithRelations | null
  onClose: () => void
  onEdit?: () => void
}

export function ActivityDetailModal({ activity, onClose, onEdit }: ActivityDetailModalProps) {
  const { data: totalHours } = useActivityTotalHours(activity?.id || null)

  if (!activity) return null

  const statusInfo = ACTIVITY_STATUSES.find((s) => s.value === activity.status)
  const serviceType = SERVICE_TYPES.find((st) => st.value === activity.service_type)

  const estimatedCost = activity.estimated_hours && activity.hourly_rate
    ? activity.estimated_hours * activity.hourly_rate
    : null

  const actualCost = totalHours && activity.hourly_rate
    ? totalHours * activity.hourly_rate
    : null

  return (
    <Modal
      isOpen={!!activity}
      onClose={onClose}
      title={activity.title}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {activity.description && (
              <p className="text-muted-foreground">{activity.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {statusInfo && (
                <Badge
                  style={{ backgroundColor: statusInfo.color }}
                  className="text-white"
                >
                  {statusInfo.label}
                </Badge>
              )}
              {serviceType && (
                <Badge variant="secondary">
                  {serviceType.label}
                </Badge>
              )}
            </div>
          </div>

          {onEdit && (
            <Button variant="secondary" onClick={onEdit} size="sm">
              Modifier
            </Button>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Client */}
          {activity.client && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Client</span>
              </div>
              <p className="font-medium">{activity.client.name}</p>
            </div>
          )}

          {/* Project */}
          {activity.project && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span>Projet</span>
              </div>
              <div className="flex items-center gap-2">
                {activity.project.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activity.project.color }}
                  />
                )}
                <p className="font-medium">{activity.project.name}</p>
              </div>
            </div>
          )}

          {/* Hourly Rate */}
          {activity.hourly_rate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Tarif horaire</span>
              </div>
              <p className="font-medium">{formatCurrency(activity.hourly_rate)}/h</p>
            </div>
          )}

          {/* Estimated Hours */}
          {activity.estimated_hours && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Temps estimé</span>
              </div>
              <p className="font-medium">{formatHours(activity.estimated_hours * 60)}</p>
            </div>
          )}

          {/* Actual Hours */}
          {totalHours !== undefined && totalHours > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Temps réel</span>
              </div>
              <p className="font-medium">{formatHours(totalHours * 60)}</p>
            </div>
          )}

          {/* Estimated Cost */}
          {estimatedCost && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Coût estimé</span>
              </div>
              <p className="font-medium">{formatCurrency(estimatedCost)}</p>
            </div>
          )}

          {/* Actual Cost */}
          {actualCost && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Coût réel</span>
              </div>
              <p className="font-medium">{formatCurrency(actualCost)}</p>
            </div>
          )}

          {/* Dates */}
          {activity.completed_at && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Complétée le</span>
              </div>
              <p className="font-medium">
                {new Date(activity.completed_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}

          {activity.invoiced_at && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Facturée le</span>
              </div>
              <p className="font-medium">
                {new Date(activity.invoiced_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        {/* Observations */}
        {activity.observations && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Observations</h4>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {activity.observations}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Time Entries */}
        <TimeEntriesList activityId={activity.id} />
      </div>
    </Modal>
  )
}
