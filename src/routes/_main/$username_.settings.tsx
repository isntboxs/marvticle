import {
  Link,
  Outlet,
  createFileRoute,
  linkOptions,
  redirect,
  useMatchRoute,
} from '@tanstack/react-router'

import { BuildingIcon, UserIcon } from 'lucide-react'
import { Fragment } from 'react'
import { MainBreadcrumb } from '#/components/main-breadcrumb.tsx'
import { Button } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '#/components/ui/button-group.tsx'
import { userProfileQueryOptions } from '#/hooks/use-user-profile'

export const Route = createFileRoute('/_main/$username_/settings')({
  staticData: { breadcrumb: 'Settings' },
  beforeLoad: ({ context, location }) => {
    const { auth } = context

    if (!auth) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
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
  component: RouteComponent,
})

const getSettingsLinks = (username: string) => {
  return linkOptions([
    {
      to: '/$username/settings',
      params: { username },
      icon: BuildingIcon,
      label: 'General',
    },
    {
      to: '/$username/settings/account',
      params: { username },
      icon: UserIcon,
      label: 'Account',
    },
  ])
}

function RouteComponent() {
  const { username } = Route.useParams()
  const settingsLinks = getSettingsLinks(username)
  const matchRoute = useMatchRoute()

  return (
    <>
      <div className="sticky top-0 z-50 h-12 w-full bg-sidebar/90 backdrop-blur supports-backdrop-filter:bg-sidebar/60">
        <div className="flex h-full items-center justify-between px-4 py-2">
          <MainBreadcrumb />
        </div>
      </div>

      <div className="w-full space-y-8 px-4 pt-4 pb-8">
        <div className="flex flex-col">
          <h1 className="font-heading text-2xl font-bold">Settings</h1>
          <p className="text-base text-muted-foreground">
            Manage your settings, and other preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-8">
          <ButtonGroup className="gap-2 lg:hidden">
            {settingsLinks.map((link, i) => {
              const Icon = link.icon
              const isActive = matchRoute({ to: link.to, params: link.params })
              const isLast = i === settingsLinks.length - 1

              return (
                <Fragment key={link.to}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="lg"
                    className={cn('justify-start')}
                    asChild
                  >
                    <Link
                      {...link}
                      activeOptions={{
                        exact: link.to === '/$username/settings',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>

                  {!isLast && <ButtonGroupSeparator />}
                </Fragment>
              )
            })}
          </ButtonGroup>

          <div className="hidden flex-col gap-1 lg:flex">
            {settingsLinks.map((link) => {
              const Icon = link.icon
              const isActive = matchRoute({ to: link.to, params: link.params })

              return (
                <Button
                  key={link.to}
                  variant={isActive ? 'default' : 'ghost'}
                  size="lg"
                  className={cn('justify-start')}
                  asChild
                >
                  <Link
                    {...link}
                    activeOptions={{ exact: link.to === '/$username/settings' }}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              )
            })}
          </div>

          <Outlet />
        </div>
      </div>
    </>
  )
}
