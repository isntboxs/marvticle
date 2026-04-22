import { Outlet, createFileRoute } from '@tanstack/react-router'

import { AppNavbar } from '#/components/app-navbar'

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full flex-col">
      <AppNavbar />

      <main className="container mx-auto flex w-full max-w-3xl flex-col px-4 py-20">
        <Outlet />
      </main>
    </div>
  )
}
