import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { GithubLogoIcon, GoogleLogoIcon } from '@phosphor-icons/react'

import { authClient } from '#/lib/auth/client'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'

const routeApi = getRouteApi('/_auth')

export const SocialSignInButtons = () => {
  const [isPendingGithub, startTransitionGithub] = useTransition()
  const [isPendingGoogle, startTransitionGoogle] = useTransition()

  const router = useRouter()
  const { redirect_to } = routeApi.useSearch()

  const handleSocialLoginGithub = async () => {
    startTransitionGithub(async () => {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: redirect_to ?? '/',
        fetchOptions: {
          onSuccess: () => {
            void router.invalidate()
          },

          onError: (ctx) => {
            toast.error('Sign in with GitHub failed', {
              description: ctx.error.message,
            })
          },
        },
      })
    })
  }

  const handleSocialLoginGoogle = async () => {
    startTransitionGoogle(async () => {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: redirect_to ?? '/',
        fetchOptions: {
          onSuccess: () => {
            void router.invalidate()
          },

          onError: (ctx) => {
            toast.error('Sign in with Google failed', {
              description: ctx.error.message,
            })
          },
        },
      })
    })
  }

  return (
    <div className="grid gap-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleSocialLoginGithub}
        disabled={isPendingGithub}
      >
        {isPendingGithub ? <Spinner /> : <GithubLogoIcon />} Continue with
        GitHub
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleSocialLoginGoogle}
        disabled={isPendingGoogle}
      >
        {isPendingGoogle ? <Spinner /> : <GoogleLogoIcon />} Continue with
        Google
      </Button>
    </div>
  )
}
