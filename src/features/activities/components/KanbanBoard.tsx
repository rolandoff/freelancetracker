import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { ActivityCard } from './ActivityCard'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { useActivities, useUpdateActivityStatus } from '../hooks/useActivities'
import { useActivitiesRealtime } from '../hooks/useActivitiesRealtime'
import { ACTIVITY_STATUSES } from '@/lib/constants'
import type { ActivityWithRelations } from '../hooks/useActivities'
import type { ActivityStatus } from '@/types/database.types'

export function KanbanBoard() {
  const { data: activities, isLoading } = useActivities()
  const updateStatus = useUpdateActivityStatus()
  
  // Enable realtime updates
  useActivitiesRealtime()
  const [_selectedActivity, setSelectedActivity] = useState<ActivityWithRelations | null>(null)
  const [activeActivity, setActiveActivity] = useState<ActivityWithRelations | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activity = activities?.find((a) => a.id === active.id)
    if (activity) {
      setActiveActivity(activity)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveActivity(null)

    if (!over || active.id === over.id) return

    const activityId = active.id as string
    const newStatus = over.id as ActivityStatus

    updateStatus.mutate({ id: activityId, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Cargando actividades...</div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Kanban</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Actividad
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {ACTIVITY_STATUSES.map((status) => (
            <KanbanColumn
              key={status.value}
              status={status.value}
              title={status.label}
              color={status.color}
              activities={activities || []}
              onActivityClick={setSelectedActivity}
            />
          ))}
        </div>

        {/* TODO: Add ActivityDetailModal when selectedActivity is set */}
      </div>

      <DragOverlay>
        {activeActivity ? <ActivityCard activity={activeActivity} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
