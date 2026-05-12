import type { ComponentProps } from 'react'

import type { auth } from '#/lib/auth/server'
import { MainSidebarContent } from '#/components/main-sidebar-content'
import { MainSidebarFooter } from '#/components/main-sidebar-footer'
import { MainSidebarHeader } from '#/components/main-sidebar-header'
import { Sidebar } from '#/components/ui/sidebar'

type MainSidebarProps = ComponentProps<typeof Sidebar> & {
  auth: typeof auth.$Infer.Session | null
}

export const MainSidebar = ({ auth, ...props }: MainSidebarProps) => {
  return (
    <Sidebar {...props}>
      <MainSidebarHeader />

      <MainSidebarContent />

      <MainSidebarFooter auth={auth} />
    </Sidebar>
  )
}
