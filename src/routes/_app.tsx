import { Outlet, createFileRoute } from '@tanstack/react-router'

import { AppNavbar } from '#/components/app-navbar'

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-svh w-full">
      <AppNavbar />

      <Outlet />
    </div>
  )
}
