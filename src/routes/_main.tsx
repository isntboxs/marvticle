import { Outlet, createFileRoute } from '@tanstack/react-router'

import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '#/components/ui/sidebar'
import { MainSidebar } from '#/components/main-sidebar'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <MainSidebar variant="floating" />

      <SidebarInset>
        <Wrapper>
          <Outlet />
        </Wrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const { state, isMobile } = useSidebar()

  return (
    <div
      className={cn(
        'relative h-svh overflow-auto bg-sidebar transition-all duration-300 ease-in-out md:h-[calc(100svh-1rem)]',
        !isMobile && state === 'expanded'
          ? 'm-2 ml-0 border border-sidebar-border'
          : 'm-2 border border-sidebar-border',
        isMobile && 'm-0'
      )}
    >
      {children}
    </div>
  )
}
