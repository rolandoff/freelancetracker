import { QueryClient } from '@tanstack/react-query'

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retryOnMount: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
