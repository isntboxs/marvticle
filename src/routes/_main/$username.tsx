import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/$username')({
  beforeLoad: ({ params }) => ({
    breadcrumb: params.username,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { username } = Route.useParams()

  return <div>Hello "/_main/{username}"!</div>
}
