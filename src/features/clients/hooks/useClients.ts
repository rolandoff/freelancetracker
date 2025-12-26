import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Client } from '@/types/database.types'

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data as Client[]
    },
  })
}
