import { useRouteContext } from '@tanstack/react-router'

import { type ComponentProps } from 'react'

import { MainSidebarContent } from '#/components/main-sidebar-content'
import { MainSidebarFooter } from '#/components/main-sidebar-footer'
import { MainSidebarHeader } from '#/components/main-sidebar-header'
import { Sidebar } from '#/components/ui/sidebar'

type MainSidebarProps = ComponentProps<typeof Sidebar>

export const MainSidebar = ({ ...props }: MainSidebarProps) => {
  const { auth } = useRouteContext({ from: '/_main' })
  return (
    <Sidebar {...props}>
      <MainSidebarHeader />

      <MainSidebarContent />

      <MainSidebarFooter auth={auth} />
    </Sidebar>
  )
}
