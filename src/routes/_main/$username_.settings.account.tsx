import { createFileRoute } from '@tanstack/react-router'

import { ActiveSessionsCard } from '#/features/auth/components/active-sessions-card'
import { LinkedAccountsCard } from '#/features/auth/components/linked-accounts-card'
import {
  listSessionsFn,
  listUserAccountsFn,
} from '#/features/auth/functions/auth'

export const Route = createFileRoute('/_main/$username_/settings/account')({
  beforeLoad: () => ({
    breadcrumb: 'Account',
  }),
  loader: () => ({
    listUserAccounts: listUserAccountsFn(),
    listUserSessions: listSessionsFn(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="lg:h-[calc(100svh-13rem)] lg:overflow-y-auto">
      <div className="grid grid-cols-1 gap-y-6 max-md:max-w-full lg:max-w-3xl">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold">Account</h1>
          <p className="text-base text-muted-foreground">
            Manage your email, password, connected accounts and more.
          </p>
        </div>
        <LinkedAccountsCard />
        <ActiveSessionsCard />
      </div>
    </div>
  )
}
