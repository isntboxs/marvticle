import { useSuspenseQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'

import {
  listSessionsFn,
  listUserAccountsFn,
} from '#/features/auth/functions/auth'
import { queryKeys } from '#/lib/query-keys'

export const useListUserAccounts = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.auth.listUserAccounts,
    queryFn: useServerFn(listUserAccountsFn),
  })
}

export const useListSessions = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.auth.listSessions,
    queryFn: useServerFn(listSessionsFn),
  })
}
