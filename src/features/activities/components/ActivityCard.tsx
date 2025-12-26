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
      style={{
        ...style,
        borderLeft: activity.project ? `4px solid ${activity.project.color}` : undefined,
      }}
      className="p-4 cursor-move hover:shadow-strong transition-all duration-200 hover:scale-[1.02] active:scale-100 bg-card"
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm line-clamp-2 flex-1">{activity.title}</h4>
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
              className="h-7 w-7 p-0 hover:bg-primary-100 hover:text-primary-600"
              title="Start timer"
            >
              <Play className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {activity.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {activity.project && (
              <div className="flex items-center gap-1.5 font-medium text-foreground/80 truncate">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: activity.project.color || '#gray' }}
                />
                <span className="truncate">{activity.project.name}</span>
              </div>
            )}
            {activity.client && (
              <span className="text-muted-foreground truncate">• {activity.client.name}</span>
            )}
          </div>

          {activity.estimated_hours && (
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono font-semibold">{activity.estimated_hours}h</span>
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
