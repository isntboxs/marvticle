import { ChevronsUpDown, LogInIcon, LogOutIcon, UserIcon } from 'lucide-react'
import { DotsThreeVerticalIcon, GearIcon } from '@phosphor-icons/react'
import {
  Link,
  linkOptions,
  useMatchRoute,
  useRouter,
} from '@tanstack/react-router'

import type { auth } from '#/lib/auth/server'
import { UserAvatar } from '#/components/user-avatar'
import { Button } from '#/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '#/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '#/components/ui/sidebar'
import { cn } from '#/lib/utils'
import { authClient } from '#/lib/auth/client'
import { Separator } from '#/components/ui/separator'

type MainSidebarFooterProps = React.ComponentProps<typeof SidebarFooter> & {
  auth: typeof auth.$Infer.Session | null
}

export const MainSidebarFooter = ({
  className,
  auth,
  ...props
}: MainSidebarFooterProps) => {
  const router = useRouter()

  const { isMobile } = useSidebar()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          void router.invalidate()
        },
      },
    })
  }

  return (
    <SidebarFooter className={cn(className)} {...props}>
      <SidebarGroup>
        <SidebarGroupContent className="space-y-2">
          <SidebarMenu>
            {auth ? (
              <SidebarMenuItem>
                <AppSidebarUserButton
                  user={auth.user}
                  onSignOut={handleSignOut}
                  isMobile={isMobile}
                />
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <Button size="lg" className="w-full justify-start" asChild>
                  <Link to="/sign-in">
                    <LogInIcon className="size-4" />{' '}
                    <span className="font-heading text-sm font-medium">
                      Sign In
                    </span>
                  </Link>
                </Button>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarFooter>
  )
}

const getUserDropdownLinks = (username: string) => {
  return linkOptions([
    {
      to: '/$username',
      params: { username },
      icon: UserIcon,
      label: 'Profile',
    },
    {
      to: '/$username/settings',
      params: { username },
      icon: GearIcon,
      label: 'Settings',
    },
  ])
}

export const AppSidebarUserButton = ({
  user,
  onSignOut,
  isMobile,
}: {
  user: typeof auth.$Infer.Session.user
  onSignOut: () => void
  isMobile: boolean
}) => {
  const userDropdownLinks = getUserDropdownLinks(user.username)

  const matchRoute = useMatchRoute()

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <UserAvatar image={user.image} name={user.name} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">@{user.username}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="font-normal">
            <div className="flex items-center gap-2 text-left text-sm">
              <UserAvatar image={user.image} name={user.name} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <DrawerTitle className="truncate font-semibold">
                  {user.name}
                </DrawerTitle>
                <DrawerDescription className="truncate text-xs">
                  @{user.username}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <DrawerFooter>
            <div className="space-y-2">
              {userDropdownLinks.map((link) => {
                const isActive = matchRoute({
                  to: link.to,
                  params: link.params,
                })

                return (
                  <DrawerClose key={link.label} asChild>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      className="w-full"
                      asChild
                    >
                      <Link {...link} activeOptions={{ exact: true }}>
                        <link.icon />
                        {link.label}
                      </Link>
                    </Button>
                  </DrawerClose>
                )
              })}
            </div>

            <Separator className="my-1" />

            <DrawerClose asChild>
              <Button
                variant="destructive"
                onClick={onSignOut}
                className="w-full"
              >
                <LogOutIcon />
                Sign out
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <UserAvatar image={user.image} name={user.name} />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              @{user.username}
            </span>
          </div>
          <DotsThreeVerticalIcon className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-none"
        side={'right'}
        align="end"
        sideOffset={18}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar image={user.image} name={user.name} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                @{user.username}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userDropdownLinks.map((item) => {
            const isActive = matchRoute({ to: item.to, params: item.params })

            return (
              <DropdownMenuItem key={item.label} asChild>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className="items-start justify-start"
                  asChild
                >
                  <Link {...item} activeOptions={{ exact: true }}>
                    <item.icon />
                    {item.label}
                  </Link>
                </Button>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onSignOut}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
