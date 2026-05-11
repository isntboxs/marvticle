import { type ReactNode } from 'react'

import { SettingsNav } from '#/features/settings/components/settings-nav'

export const SettingsLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full space-y-8 px-4 pt-4 pb-8">
      <div className="flex flex-col">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-base text-muted-foreground">
          Manage your settings, and other preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-8">
        <SettingsNav />
        {children}
      </div>
    </div>
  )
}
