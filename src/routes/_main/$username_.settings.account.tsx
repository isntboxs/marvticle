import { createFileRoute, useLocation, useRouter } from '@tanstack/react-router'
import { Link2Icon } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useServerFn } from '@tanstack/react-start'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { LaptopIcon } from '@phosphor-icons/react'
import { formatDate } from 'date-fns'
import type { ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth/client'
import { Spinner } from '#/components/ui/spinner'
import { listUserAccountsFn } from '#/functions/list-accounts.fn'
import { listUserSessionsFn } from '#/functions/list-sessions'
import { parseUserAgent } from '#/utils/parse-user-agent'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/_main/$username_/settings/account')({
  beforeLoad: () => ({
    breadcrumb: 'Account',
  }),
  loader: () => ({
    listUserAccounts: listUserAccountsFn(),
    listUserSessions: listUserSessionsFn(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="lg:h-[calc(100svh-13rem)] lg:overflow-y-auto">
      <div className="grid grid-cols-1 gap-y-6 max-md:max-w-full lg:max-w-3xl">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold">Account</h1>
          <p className="text-base text-muted-foreground">
            Manage your email, password, connected accounts and more.
          </p>
        </div>

        <LinkAcccountsCard />

        <ActiveSessionsCard />
      </div>
    </div>
  )
}

const CustomCard = ({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
  className?: string
}) => {
  return (
    <Card
      className={cn('border border-dashed border-border ring-0', className)}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>

        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  )
}

const linkAccountItems = [
  {
    provider: 'github',
    icon: FaGithub,
    name: 'GitHub',
  },
  {
    provider: 'google',
    icon: FcGoogle,
    name: 'Google',
  },
]

const LinkAcccountsCard = () => {
  const [isPending, startTransition] = useTransition()
  const [pendingProvider, setPendingProvider] = useState<
    (typeof linkAccountItems)[number]['provider'] | null
  >(null)

  const queryClient = useQueryClient()
  const location = useLocation()
  const router = useRouter()

  const { data: accounts } = useSuspenseQuery({
    queryKey: ['list-user-accounts'],
    queryFn: useServerFn(listUserAccountsFn),
  })

  const onLinkAccount = (
    provider: (typeof linkAccountItems)[number]['provider']
  ) => {
    setPendingProvider(provider)
    startTransition(async () => {
      await authClient.linkSocial({
        provider,
        callbackURL: location.pathname,
        fetchOptions: {
          onSuccess: () => {
            setPendingProvider(null)
            toast.success(`${provider} account linked successfully`)
          },
          onError: (ctx) => {
            setPendingProvider(null)
            toast.error(`${provider} account linking failed`, {
              description: ctx.error.message,
            })
          },
        },
      })
    })
  }

  const onUnlinkAccount = (
    providerId: (typeof linkAccountItems)[number]['provider'],
    accountId: string
  ) => {
    setPendingProvider(providerId)
    startTransition(async () => {
      await authClient.unlinkAccount({
        providerId,
        accountId,
        fetchOptions: {
          onSuccess: () => {
            setPendingProvider(null)
            toast.success(`${providerId} account unlinked successfully`)
            void queryClient.invalidateQueries({
              queryKey: ['list-user-accounts'],
            })
            void router.invalidate()
          },
          onError: (ctx) => {
            setPendingProvider(null)
            toast.error(`${providerId} account unlinking failed`, {
              description: ctx.error.message,
            })
          },
        },
      })
    })
  }

  return (
    <CustomCard
      icon={<Link2Icon className="size-4" />}
      title="Linked Accounts"
      description="Connect your account with external providers for easier sign-in."
    >
      <div className="grid grid-cols-1 gap-y-4">
        {linkAccountItems.map((item) => {
          const linked = accounts.find(
            (acc) => acc.providerId === item.provider
          )

          return (
            <div
              key={item.provider}
              className="flex items-center gap-4 border border-border p-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background">
                  <item.icon className="size-4" />
                </div>

                <div className="space-y-0.5">
                  <p className="font-heading text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sign in with {item.name}
                  </p>
                </div>
              </div>

              {linked ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="ml-auto"
                  onClick={() =>
                    onUnlinkAccount(item.provider, linked.accountId)
                  }
                  disabled={isPending && pendingProvider === item.provider}
                >
                  {isPending && pendingProvider === item.provider ? (
                    <Spinner />
                  ) : (
                    'Unlink'
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => onLinkAccount(item.provider)}
                  disabled={isPending && pendingProvider === item.provider}
                >
                  {isPending && pendingProvider === item.provider ? (
                    <Spinner />
                  ) : (
                    'Link'
                  )}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </CustomCard>
  )
}

function ActiveSessionsCard() {
  const [isPending, startTransition] = useTransition()

  const { auth, queryClient } = Route.useRouteContext()
  const router = useRouter()

  const { data: sessions } = useSuspenseQuery({
    queryKey: ['list-user-sessions'],
    queryFn: useServerFn(listUserSessionsFn),
  })

  const onRevokeSession = async (token: string) => {
    startTransition(async () => {
      await authClient.revokeSession({
        token,
        fetchOptions: {
          onSuccess: () => {
            void router.invalidate()
            void queryClient.invalidateQueries({
              queryKey: ['list-user-sessions'],
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
    <CustomCard
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
    </CustomCard>
  )
}
