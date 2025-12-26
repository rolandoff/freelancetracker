import { useState } from 'react'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useTimerStore } from '@/stores/timerStore'
import { useCreateTimeEntry } from '../hooks/useTimeEntries'
import { useActivities } from '../hooks/useActivities'

export function TimeTracker() {
  const { activityId, startTime, elapsedSeconds, isRunning, pauseTimer, resumeTimer, stopTimer } =
    useTimerStore()
  const createTimeEntry = useCreateTimeEntry()
  const { data: activities } = useActivities()
  const [isSaving, setIsSaving] = useState(false)

  const activity = activities?.find((a) => a.id === activityId)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStop = async () => {
    if (!activityId || !startTime) return

    setIsSaving(true)
    try {
      await createTimeEntry.mutateAsync({
        activity_id: activityId,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        notes: null,
      })
      stopTimer()
    } catch (error) {
      console.error('Error saving time entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!activityId) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>No hay temporizador activo</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-card">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Temporizador</span>
          </div>
          {isRunning && (
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>

        {activity && (
          <div className="text-sm text-muted-foreground truncate">
            {activity.title}
          </div>
        )}

        <div className="text-2xl font-mono font-bold">
          {formatTime(elapsedSeconds)}
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              size="sm"
              onClick={resumeTimer}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              Reanudar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={pauseTimer}
              variant="secondary"
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pausar
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleStop}
            variant="destructive"
            disabled={isSaving}
          >
            <Square className="w-4 h-4 mr-1" />
            {isSaving ? 'Guardando...' : 'Detener'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
