import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { ActivityCard } from './ActivityCard'
import { ActivityForm } from './ActivityForm'
import { ActivityDetailModal } from './ActivityDetailModal'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { useActivities, useUpdateActivityStatus } from '../hooks/useActivities'
import { useActivitiesRealtime } from '../hooks/useActivitiesRealtime'
import { ACTIVITY_STATUSES } from '@/lib/constants'
import { useTranslation } from 'react-i18next'
import type { ActivityWithRelations } from '../hooks/useActivities'
import type { ActivityStatus } from '@/types/database.types'

export function KanbanBoard() {
  const { t } = useTranslation()
  const { data: activities, isLoading } = useActivities()
  const updateStatus = useUpdateActivityStatus()
  
  // Enable realtime updates
  useActivitiesRealtime()
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithRelations | null>(null)
  const [editingActivity, setEditingActivity] = useState<ActivityWithRelations | null>(null)
  const [activeActivity, setActiveActivity] = useState<ActivityWithRelations | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
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
        <div className="text-muted-foreground">{t('kanban.loading')}</div>
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
          <h1 className="text-3xl font-bold">{t('kanban.title')}</h1>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('kanban.newActivity')}
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

      </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeActivity ? (
          <div className="rotate-[-3deg]">
            <ActivityCard activity={activeActivity} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>

      {/* Create Activity Form */}
      {isCreating && <ActivityForm onClose={() => setIsCreating(false)} />}

      {/* Edit Activity Form */}
      {editingActivity && (
        <ActivityForm
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onEdit={() => {
            setEditingActivity(selectedActivity)
            setSelectedActivity(null)
          }}
        />
      )}
    </DndContext>
  )
}
