import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { ActivityCard } from './ActivityCard'
import { motion } from 'framer-motion'
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
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const columnActivities = useMemo(
    () => activities.filter((a) => a.status === status),
    [activities, status]
  )

  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px]">
      <div
        className="px-4 py-3 rounded-t-xl font-bold text-sm text-white shadow-md"
        style={{ 
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="uppercase tracking-wide">{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold">
            {columnActivities.length}
          </span>
        </div>
      </div>

      <motion.div
        ref={setNodeRef}
        animate={{
          backgroundColor: isOver ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.02)',
          scale: isOver ? 1.02 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
        className={`flex-1 rounded-b-xl p-3 space-y-3 overflow-y-auto transition-all ${
          isOver ? 'ring-2 ring-primary-400 shadow-lg' : ''
        }`}
      >
        {columnActivities.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12 space-y-2">
            <div className="text-3xl opacity-50">📋</div>
            <p className="font-medium">Aucune activité</p>
          </div>
        ) : (
          columnActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ActivityCard
                activity={activity}
                onClick={() => onActivityClick?.(activity)}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
