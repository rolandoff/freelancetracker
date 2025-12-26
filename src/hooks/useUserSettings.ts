// @ts-nocheck - Supabase type system has issues with never types
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { UserSettings } from '@/types/database.types'

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
        .maybeSingle()

      // If no settings exist, create default ones
      if (!data && !error) {
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            country: 'FR',
            tva_applicable: false,
            taux_cotisations: 24.6,
            plafond_ca_annuel: 77700,
            theme: 'light',
            language: 'fr',
          })
          .select()
          .single()
        
        if (insertError) throw insertError
        return newData as UserSettings
      }

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

      // @ts-ignore - Supabase type system limitation
      const { data, error } = await supabase
        .from('user_settings')
        .update(settings as any)
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
