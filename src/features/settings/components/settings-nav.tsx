import {
  useMatchRoute,
  useParams,
  linkOptions,
  Link,
} from '@tanstack/react-router'

import { BuildingIcon, UserIcon } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'

import { Button } from '#/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '#/components/ui/button-group'
import { cn } from '#/lib/utils'

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

export const SettingsNav = () => {
  const { username } = useParams({ from: '/_main/$username_/settings' })
  const settingsLinks = getSettingsLinks(username)
  const matchRoute = useMatchRoute()

  return (
    <>
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
    </>
  )
}
