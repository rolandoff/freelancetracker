import { useState } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { useActivities } from '../hooks/useActivities'
import { ACTIVITY_STATUSES } from '@/lib/constants'
import type { ActivityWithRelations } from '../hooks/useActivities'

export function KanbanBoard() {
  const { data: activities, isLoading } = useActivities()
  const [_selectedActivity, setSelectedActivity] = useState<ActivityWithRelations | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Cargando actividades...</div>
      </div>
    )
  }

  return (
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
  )
}
