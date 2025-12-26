import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface UserSettings {
  company_name?: string
  siret?: string
  address?: string
  postal_code?: string
  city?: string
  country?: string
  email?: string
  phone?: string
  tva_number?: string
  is_tva_applicable?: boolean
  cotisations_rate?: number
  urssaf_plafond?: number
}

export const useUserSettings = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data as UserSettings
    },
    enabled: !!user,
  })
}

export const useUpdateUserSettings = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', user?.id] })
    },
  })
}
