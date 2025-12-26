import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Rate, ServiceType, Database } from '@/types/database.types'

export const useRates = () => {
  return useQuery({
    queryKey: ['rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rates')
        .select('*')
        .order('service_type', { ascending: true })

      if (error) throw error
      return data as Rate[]
    },
  })
}

export const useBaseRates = () => {
  return useQuery({
    queryKey: ['rates', 'base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rates')
        .select('*')
        .is('client_id', null)
        .order('service_type', { ascending: true })

      if (error) throw error
      return data as Rate[]
    },
  })
}

export const useClientRates = (clientId: string | null) => {
  return useQuery({
    queryKey: ['rates', 'client', clientId],
    queryFn: async () => {
      if (!clientId) return []

      const { data, error } = await supabase
        .from('rates')
        .select('*')
        .eq('client_id', clientId)
        .order('service_type', { ascending: true })

      if (error) throw error
      return data as Rate[]
    },
    enabled: !!clientId,
  })
}

export const useCreateRate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      rate: Omit<Rate, 'id' | 'created_at' | 'updated_at' | 'user_id'>
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('rates')
        // @ts-ignore - Supabase type inference issue
        .insert({
          ...rate,
          user_id: user.id,
        } as Database['public']['Tables']['rates']['Insert'])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] })
    },
  })
}

export const useUpdateRate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Rate> }) => {
      const { data, error } = await supabase
        .from('rates')
        // @ts-ignore - Supabase type inference issue
        .update(updates as Database['public']['Tables']['rates']['Update'])
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] })
    },
  })
}

export const useDeleteRate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rates').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] })
    },
  })
}

/**
 * Get the applicable rate for a given service type and optional client
 * Priority: 1. Client-specific rate, 2. Base rate, 3. null
 */
export const useApplicableRate = (serviceType: ServiceType, clientId: string | null) => {
  return useQuery({
    queryKey: ['rates', 'applicable', serviceType, clientId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Try client-specific rate first
      if (clientId) {
        const { data: clientRate } = await supabase
          .from('rates')
          .select('*')
          .eq('user_id', user.id)
          .eq('service_type', serviceType)
          .eq('client_id', clientId)
          .eq('is_active', true)
          .maybeSingle()

        if (clientRate) return clientRate as Rate
      }

      // Fall back to base rate
      const { data: baseRate } = await supabase
        .from('rates')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', serviceType)
        .is('client_id', null)
        .eq('is_active', true)
        .maybeSingle()

      return baseRate ? (baseRate as Rate) : null
    },
  })
}
