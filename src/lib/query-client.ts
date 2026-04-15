import { QueryCache, QueryClient } from '@tanstack/react-query'

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
      },
    },
    queryCache: new QueryCache(),
  })

let clientQueryClientSingleton: QueryClient | undefined = undefined
export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient()

  return clientQueryClientSingleton
}
