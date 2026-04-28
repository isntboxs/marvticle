import { Link, useRouteContext, useRouter } from '@tanstack/react-router'

import { LogOutIcon, Settings2Icon, UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { auth } from '#/lib/auth/server'
import { UserAvatar } from '#/components/user-avatar'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { authClient } from '#/lib/auth/client'

export const AppNavbar = () => {
  const { auth } = useRouteContext({ from: '__root__' })
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await router.invalidate()
          await router.navigate({ to: '/', viewTransition: true })
        },

        onError: (ctx) => {
          toast.error('Failed to sign out', { description: ctx.error.message })
        },
      },
    })
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-14 border-b bg-background/85 backdrop-blur-sm supports-backdrop-filter:bg-background/65">
      <div className="container mx-auto flex h-full w-full max-w-348 items-center justify-between px-4 md:px-6">
        <Link to="/" viewTransition>
          <span className="text-xl font-bold tracking-tighter">Marvticle</span>
        </Link>

        <nav className="flex items-center gap-4">
          {!auth && (
            <>
              <Button asChild variant="outline" size="lg">
                <Link to="/sign-in" viewTransition>
                  Sign in
                </Link>
              </Button>

              <Button asChild variant="default" size="lg">
                <Link to="/sign-up" viewTransition>
                  Create account
                </Link>
              </Button>
            </>
          )}

          {!!auth && (
            <>
              <Button asChild variant="default" size="lg">
                <Link to="/new" viewTransition>
                  Create post
                </Link>
              </Button>

              <UserMenu user={auth.user} onSignOut={handleSignOut} />
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

const UserMenu = ({
  user,
  onSignOut,
}: {
  user: typeof auth.$Infer.Session.user
  onSignOut: () => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-lg">
          <UserAvatar image={user.image} name={user.name} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56"
        side="bottom"
        align="end"
        sideOffset={16}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1.5 py-1.5 text-left text-sm">
            <UserAvatar image={user.image} name={user.name} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings2Icon />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
