import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/database.types'

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data as Project[]
    },
  })
}
