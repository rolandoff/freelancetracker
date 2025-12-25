import { useMemo } from 'react'
import { ActivityCard } from './ActivityCard'
import type { ActivityWithRelations } from '../hooks/useActivities'
import type { ActivityStatus } from '@/types/database.types'

interface KanbanColumnProps {
  status: ActivityStatus
  title: string
  color: string
  activities: ActivityWithRelations[]
  onActivityClick?: (activity: ActivityWithRelations) => void
}

export function KanbanColumn({
  status,
  title,
  color,
  activities,
  onActivityClick,
}: KanbanColumnProps) {
  const columnActivities = useMemo(
    () => activities.filter((a) => a.status === status),
    [activities, status]
  )

  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px]">
      <div
        className="px-4 py-3 rounded-t-lg font-semibold text-sm text-white"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs opacity-90">{columnActivities.length}</span>
        </div>
      </div>

      <div className="flex-1 bg-muted/30 rounded-b-lg p-3 space-y-3 overflow-y-auto">
        {columnActivities.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No hay actividades
          </div>
        ) : (
          columnActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick?.(activity)}
            />
          ))
        )}
      </div>
    </div>
  )
}
