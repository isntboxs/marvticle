import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

const getAppStatus = createServerFn({ method: 'GET' }).handler(async () => {
  return {
    generatedAt: new Date().toISOString(),
  }
})

export function appStatusQueryOptions() {
  return queryOptions({
    queryKey: ['app-status'],
    queryFn: () => getAppStatus(),
    staleTime: 30_000,
  })
}
