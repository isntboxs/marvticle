import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { SettingsLayout } from '#/features/settings/components/settings-layout'
import { userProfileQueryOptions } from '#/hooks/use-user-profile'

export const Route = createFileRoute('/_main/$username_/settings')({
  staticData: { breadcrumb: 'Settings' },
  beforeLoad: ({ context, location }) => {
    const { auth } = context

    if (!auth) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect_to: location.href,
        },
        replace: true,
        viewTransition: true,
      })
    }

    return { auth }
  },
  loader: async ({ context, params }) => {
    const { auth, queryClient } = context
    const user = await queryClient.ensureQueryData(
      userProfileQueryOptions(params.username)
    )

    if (auth.user.id !== user.id) {
      throw redirect({
        to: '/',
        replace: true,
        viewTransition: true,
      })
    }

    return { auth, user }
  },
  component: () => (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  ),
})
