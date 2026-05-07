import type { ComponentProps } from 'react'

import { Sidebar, SidebarContent, SidebarFooter } from '#/components/ui/sidebar'
import { MainSidebarHeader } from '#/components/main-sidebar-header'

type MainSidebarProps = ComponentProps<typeof Sidebar>

export const MainSidebar = ({ ...props }: MainSidebarProps) => {
  return (
    <Sidebar {...props}>
      <MainSidebarHeader />

      <SidebarContent></SidebarContent>

      <SidebarFooter></SidebarFooter>
    </Sidebar>
  )
}
