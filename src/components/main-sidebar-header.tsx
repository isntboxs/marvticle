import { Link } from '@tanstack/react-router'
import { PanelLeftCloseIcon, PanelLeftIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '#/components/ui/sidebar'
import { MarvIcon } from '#/components/marv-icon'

type MainSidebarHeaderProps = ComponentProps<typeof SidebarHeader>

export const MainSidebarHeader = ({ ...props }: MainSidebarHeaderProps) => {
  const { state, isMobile, toggleSidebar } = useSidebar()

  return (
    <SidebarHeader {...props}>
      <SidebarMenu className="flex-row justify-between">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="mx-auto w-fit data-[slot=sidebar-menu-button]:p-2!"
          >
            <Link to="." className="flex items-center gap-2" viewTransition>
              <MarvIcon className="size-5!" />
              <span className="font-heading text-xl font-bold">marvticle</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            className="mx-auto w-fit data-[slot=sidebar-menu-button]:p-2!"
            aria-label={
              state === 'collapsed' || isMobile
                ? 'Expand sidebar'
                : 'Collapse sidebar'
            }
            onClick={toggleSidebar}
          >
            {state === 'collapsed' || isMobile ? (
              <PanelLeftIcon />
            ) : (
              <PanelLeftCloseIcon />
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
