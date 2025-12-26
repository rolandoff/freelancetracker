import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to realtime updates for activities table
 * Automatically invalidates the activities query when changes occur
 */
export const useActivitiesRealtime = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Subscribe to changes in activities table for current user
      channel = supabase
        .channel('activities_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Activity change received:', payload)
            // Invalidate activities query to refetch data
            queryClient.invalidateQueries({ queryKey: ['activities'] })
          }
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [queryClient])
}
