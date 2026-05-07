import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/$username/settings/account')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Account</h1>
      <p>Manage your account settings.</p>
    </div>
  )
}
