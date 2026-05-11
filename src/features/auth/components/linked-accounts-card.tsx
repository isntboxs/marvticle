import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useRouter } from '@tanstack/react-router'

import { useState, useTransition } from 'react'

import { Link2Icon } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'sonner'

import { SettingsCustomCard } from '#/components/custom-card'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { useListUserAccounts } from '#/features/auth/hooks/use-auth'
import { authClient } from '#/lib/auth/client'
import { queryKeys } from '#/lib/query-keys'

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

type ProviderType = (typeof linkAccountItems)[number]['provider']

export const LinkedAccountsCard = () => {
  const [isPending, startTransition] = useTransition()
  const [pendingProvider, setPendingProvider] = useState<ProviderType | null>(
    null
  )

  const queryClient = useQueryClient()
  const router = useRouter()
  const location = useLocation()

  const { data: accounts } = useListUserAccounts()

  const onLinkAccount = (provider: ProviderType) => {
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

  const onUnlinkAccount = (providerId: ProviderType, accountId: string) => {
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
              queryKey: queryKeys.auth.listUserAccounts,
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
    <SettingsCustomCard
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
    </SettingsCustomCard>
  )
}
