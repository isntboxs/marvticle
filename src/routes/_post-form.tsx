import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppWindowIcon, PencilIcon } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'

export const Route = createFileRoute('/_post-form')({
  beforeLoad: ({ context, location }) => {
    const { auth } = context

    if (!auth) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.pathname,
        },
      })
    }

    return { auth }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Tabs
      defaultValue="edit"
      className="flex min-h-svh items-center justify-center"
    >
      <header className="fixed top-0 right-0 left-0 z-50 h-14 border-b bg-background/85 backdrop-blur-sm supports-backdrop-filter:bg-background/65">
        <div className="container mx-auto flex h-full w-full max-w-348 items-center justify-between px-4 md:px-6">
          <Link to="/" viewTransition>
            <span className="text-xl font-bold tracking-tighter">
              Marvticle
            </span>
          </Link>

          <TabsList className="gap-2 bg-transparent">
            <TabsTrigger value="edit">
              <PencilIcon /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <AppWindowIcon /> Preview
            </TabsTrigger>
          </TabsList>
        </div>
      </header>

      <Outlet />
    </Tabs>
  )
}
