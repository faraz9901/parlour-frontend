import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes, won't refetch on focus within this
      gcTime: 1000 * 60 * 10 // data stays in cache for 10 min
    },
  },
})
