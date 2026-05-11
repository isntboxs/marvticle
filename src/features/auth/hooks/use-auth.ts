import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import { toast } from 'sonner'

import {
  changePasswordFn,
  listSessionsFn,
  listUserAccountsFn,
} from '#/features/auth/functions/auth'
import { type ChangePasswordSchema } from '#/features/auth/schemas/auth.schema'
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

export const useChangePassword = () => {
  const changePassword = useServerFn(changePasswordFn)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: ChangePasswordSchema) => changePassword({ data }),
    onSuccess: () => {
      void router.invalidate()
      toast.success('Password changed successfully')
    },
    onError: (error) => {
      toast.error('Change password failed', {
        description: error.message,
      })
    },
  })
}
