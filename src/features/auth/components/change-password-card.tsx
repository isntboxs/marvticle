import { useState } from 'react'

import { KeyRoundIcon, LockIcon } from 'lucide-react'

import { SettingsCustomCard } from '#/components/custom-card'
import { Button } from '#/components/ui/button'
import { ChangePasswordDialog } from '#/features/auth/components/change-password-dialog'

export const ChangePasswordCard = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const onOpenDialog = () => {
    setOpenDialog((prev) => !prev)
  }

  return (
    <>
      <ChangePasswordDialog open={openDialog} setOpen={setOpenDialog} />
      <SettingsCustomCard
        title="Password"
        description="Change your password to keep your account secure."
        icon={<LockIcon className="size-4" />}
      >
        <Button variant="outline" onClick={onOpenDialog}>
          <KeyRoundIcon className="size-4" />
          <span>Change password</span>
        </Button>
      </SettingsCustomCard>
    </>
  )
}
