import { createFileRoute } from '@tanstack/react-router'

import { HomeApiProbe } from '#/features/probe/demo-home-api-probe'

export const Route = createFileRoute('/demo')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()

  return <HomeApiProbe auth={auth} />
}
