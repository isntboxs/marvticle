import { QueryClient } from '@tanstack/react-query'

export function getRouterContext() {
  const queryClient = new QueryClient()

  return {
    queryClient,
  }
}
