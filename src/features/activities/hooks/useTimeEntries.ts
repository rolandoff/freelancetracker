import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TimeEntry, Database } from '@/types/database.types'

export const useTimeEntries = (activityId: string | null) => {
  return useQuery({
    queryKey: ['time_entries', activityId],
    queryFn: async () => {
      if (!activityId) return []

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('activity_id', activityId)
        .order('start_time', { ascending: false })

      if (error) throw error
      return data as TimeEntry[]
    },
    enabled: !!activityId,
  })
}

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'duration_minutes'>
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('time_entries')
        // @ts-expect-error - Supabase type inference issue
        .insert({
          ...entry,
          user_id: user.id,
        } as Database['public']['Tables']['time_entries']['Insert'])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time_entries', variables.activity_id] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<TimeEntry>
    }) => {
      const { data, error } = await supabase
        .from('time_entries')
        // @ts-expect-error - Supabase type inference issue
        .update(updates as Database['public']['Tables']['time_entries']['Update'])
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['time_entries', (data as TimeEntry).activity_id] })
        queryClient.invalidateQueries({ queryKey: ['activities'] })
      }
    },
  })
}

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, activityId }: { id: string; activityId: string }) => {
      const { error } = await supabase.from('time_entries').delete().eq('id', id)

      if (error) throw error
      return { activityId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['time_entries', result.activityId] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

/**
 * Calculate total hours for an activity
 */
export const useActivityTotalHours = (activityId: string | null) => {
  return useQuery({
    queryKey: ['time_entries', 'total', activityId],
    queryFn: async () => {
      if (!activityId) return 0

      const { data, error } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .eq('activity_id', activityId)

      if (error) throw error

      const totalMinutes = (data as TimeEntry[]).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)
      return totalMinutes / 60 // Convert to hours
    },
    enabled: !!activityId,
  })
}
