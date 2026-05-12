import { Link, linkOptions } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'
import { cn } from '#/lib/utils'

type MainSidebarContentProps = React.ComponentProps<typeof SidebarContent>

const navLinks = linkOptions([
  {
    to: '/',
    icon: HomeIcon,
    label: 'Home',
  },
])

export const MainSidebarContent = ({
  className,
  ...props
}: MainSidebarContentProps) => {
  return (
    <SidebarContent className={cn(className)} {...props}>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.to}>
                <SidebarMenuButton tooltip={link.label} asChild>
                  <Link
                    {...link}
                    activeOptions={{ exact: true }}
                    viewTransition
                  >
                    <link.icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
