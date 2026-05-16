import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/$username/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { username } = Route.useParams()
  return (
    <div>
      <h1>Username: {username}</h1>
    </div>
  )
}
