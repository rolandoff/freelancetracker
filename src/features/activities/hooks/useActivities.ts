import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Activity, ActivityStatus, Database } from '@/types/database.types'

export interface ActivityWithRelations extends Activity {
  client?: { id: string; name: string }
  project?: { id: string; name: string; color: string | null }
}

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(
          `
          *,
          client:clients!activities_client_id_fkey (
            id,
            name
          ),
          project:projects!activities_project_id_fkey (
            id,
            name,
            color
          )
        `
        )
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data as ActivityWithRelations[]
    },
  })
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      activity: Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'user_id'>
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error} = await supabase
        .from('activities')
        // @ts-ignore - Supabase type inference issue
        .insert({
          ...activity,
          user_id: user.id,
        } as Database['public']['Tables']['activities']['Insert'])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

export const useUpdateActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Activity>
    }) => {
      const { data, error } = await supabase
        .from('activities')
        // @ts-ignore - Supabase type inference issue
        .update(updates as Database['public']['Tables']['activities']['Update'])
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

export const useUpdateActivityStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: ActivityStatus
    }) => {
      const updates: Partial<Activity> = { status }

      if (status === 'completada') {
        updates.completed_at = new Date().toISOString()
      }
      if (status === 'facturada') {
        updates.invoiced_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('activities')
        // @ts-ignore - Supabase type inference issue
        .update(updates as Database['public']['Tables']['activities']['Update'])
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}

export const useDeleteActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('activities').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
