import { useRouteContext, useRouter } from '@tanstack/react-router'

import { useTransition } from 'react'

import { LaptopIcon } from '@phosphor-icons/react'
import { formatDate } from 'date-fns'
import { toast } from 'sonner'

import { SettingsCustomCard } from '#/components/custom-card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useListSessions } from '#/features/auth/hooks/use-auth'
import { authClient } from '#/lib/auth/client'
import { parseUserAgent } from '#/lib/parse-user-agent'
import { queryKeys } from '#/lib/query-keys'

export const ActiveSessionsCard = () => {
  const [isPending, startTransition] = useTransition()

  const { auth, queryClient } = useRouteContext({
    from: '/_main/$username_/settings/account',
  })
  const router = useRouter()

  const { data: sessions } = useListSessions()

  const onRevokeSession = async (token: string) => {
    startTransition(async () => {
      await authClient.revokeSession({
        token,
        fetchOptions: {
          onSuccess: () => {
            void router.invalidate()
            void queryClient.invalidateQueries({
              queryKey: queryKeys.auth.listSessions,
            })
            toast.success('Session revoked successfully')
          },

          onError: (ctx) => {
            toast.error('Failed to revoke session', {
              description: ctx.error.message,
            })
          },
        },
      })
    })
  }

  return (
    <SettingsCustomCard
      icon={<LaptopIcon className="size-4" />}
      title="Active Sessions"
      description="Manage your active sessions across devices"
    >
      <div className="grid grid-cols-1 gap-y-4">
        {sessions.map((session) => {
          const isCurrentSession = session.id === auth.session.id

          return (
            <div
              key={session.id}
              className="flex items-center gap-4 border border-border p-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background">
                  <LaptopIcon className="size-4" />
                </div>

                <div className="space-y-0.5">
                  <p className="font-heading text-sm font-medium">
                    {parseUserAgent(session.userAgent)?.getOS.name},{' '}
                    {parseUserAgent(session.userAgent)?.getBrowser.name}
                    {isCurrentSession && (
                      <Badge variant="secondary" className="ml-2">
                        Current device
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active:{' '}
                    {formatDate(session.updatedAt, 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              {!isCurrentSession && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                  onClick={() => onRevokeSession(session.token)}
                  disabled={isPending}
                >
                  Revoke
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </SettingsCustomCard>
  )
}
