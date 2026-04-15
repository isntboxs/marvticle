import { createFileRoute } from '@tanstack/react-router'

import { DemoHomeApiProbe } from '#/features/probe/demo-home-api-probe'

export const Route = createFileRoute('/demo')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()

  return <DemoHomeApiProbe auth={auth} />
}
