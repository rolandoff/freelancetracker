import { Clock, FileText, Play } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { useTimerStore } from '@/stores/timerStore'
import type { ActivityWithRelations } from '../hooks/useActivities'
import { SERVICE_TYPES } from '@/lib/constants'

interface ActivityCardProps {
  activity: ActivityWithRelations
  onClick?: () => void
  isDragOverlay?: boolean
}

export function ActivityCard({ activity, onClick, isDragOverlay = false }: ActivityCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    disabled: isDragOverlay,
  })
  const startTimer = useTimerStore((state) => state.startTimer)

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const serviceType = SERVICE_TYPES.find((st) => st.value === activity.service_type)

  const handleStartTimer = (e: React.MouseEvent) => {
    e.stopPropagation()
    startTimer(activity.id)
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card"
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2">{activity.title}</h4>
          <div className="flex items-center gap-1 shrink-0">
            {serviceType && (
              <Badge variant="secondary" className="text-xs">
                {serviceType.label}
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStartTimer}
              className="h-6 w-6 p-0"
              title="Start timer"
            >
              <Play className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {activity.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {activity.project && (
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activity.project.color || '#gray' }}
                />
                <span>{activity.project.name}</span>
              </div>
            )}
            {activity.client && <span>• {activity.client.name}</span>}
          </div>

          {activity.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{activity.estimated_hours}h</span>
            </div>
          )}
        </div>

        {activity.observations && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span className="line-clamp-1">{activity.observations}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
