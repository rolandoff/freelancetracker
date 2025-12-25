import { useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'

export function useToast() {
  const { addNotification, removeNotification } = useUIStore()

  const toast = useCallback(
    (options: {
      type: 'success' | 'error' | 'warning' | 'info'
      title: string
      message?: string
      duration?: number
    }) => {
      const id = addNotification(options)

      // Auto-remove after duration
      const duration = options.duration ?? 5000
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }

      return id
    },
    [addNotification, removeNotification]
  )

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      return toast({ type: 'success', title, message, duration })
    },
    [toast]
  )

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      return toast({ type: 'error', title, message, duration })
    },
    [toast]
  )

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return toast({ type: 'warning', title, message, duration })
    },
    [toast]
  )

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      return toast({ type: 'info', title, message, duration })
    },
    [toast]
  )

  return {
    toast,
    success,
    error,
    warning,
    info,
    remove: removeNotification,
  }
}
