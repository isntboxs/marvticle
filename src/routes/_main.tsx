import { Outlet, createFileRoute } from '@tanstack/react-router'

import { Loader } from '#/components/loader'
import { MainBreadcrumb } from '#/components/main-breadcrumb'
import { MainSidebar } from '#/components/main-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from '#/components/ui/sidebar'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
  pendingComponent: () => {
    return (
      <SidebarProvider>
        <MainSidebar variant="floating" />

        <SidebarInset>
          <Wrapper>
            <div className="flex h-[calc(100svh-5rem)] items-center justify-center">
              <Loader.Inline />
            </div>
          </Wrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  },
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
      <div className="sticky top-0 z-50 h-12 w-full bg-sidebar/90 backdrop-blur supports-backdrop-filter:bg-sidebar/60">
        <div className="flex h-full items-center justify-between px-4 py-2">
          <MainBreadcrumb />
        </div>
      </div>

      {children}
    </div>
  )
}
