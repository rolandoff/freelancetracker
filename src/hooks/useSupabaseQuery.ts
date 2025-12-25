import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PostgrestError } from '@supabase/supabase-js'

interface UseSupabaseQueryOptions<T> {
  queryKey: unknown[]
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
  enabled?: boolean
}

interface UseSupabaseMutationOptions<T, V> {
  mutationFn: (variables: V) => Promise<{ data: T | null; error: PostgrestError | null }>
  onSuccess?: (data: T | null) => void
  onError?: (error: PostgrestError) => void
  invalidateQueries?: unknown[][]
}

/**
 * Wrapper around react-query's useQuery for Supabase queries
 */
export function useSupabaseQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
}: UseSupabaseQueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await queryFn()
      if (error) throw error
      return data
    },
    enabled,
  })
}

/**
 * Wrapper around react-query's useMutation for Supabase mutations
 */
export function useSupabaseMutation<T, V = void>({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
}: UseSupabaseMutationOptions<T, V>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: V) => {
      const { data, error } = await mutationFn(variables)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidate queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })

      onSuccess?.(data)
    },
    onError: (error: PostgrestError) => {
      onError?.(error)
    },
  })
}
