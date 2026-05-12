import { Outlet, createFileRoute } from '@tanstack/react-router'

import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '#/components/ui/sidebar'
import { MainSidebar } from '#/components/main-sidebar'
import { cn } from '#/lib/utils'
import { MainBreadcrumb } from '#/components/main-breadcrumb'

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <MainSidebar variant="floating" auth={auth} />

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
      <div className="sticky top-0 z-50 h-12 w-full bg-sidebar/90 backdrop-blur supports-backdrop-filter:bg-sidebar/60">
        <div className="flex h-full items-center justify-between px-4 py-2">
          <MainBreadcrumb />
        </div>
      </div>

      {children}
    </div>
  )
}
