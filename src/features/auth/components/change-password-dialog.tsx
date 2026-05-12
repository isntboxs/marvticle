import { useForm } from '@tanstack/react-form-start'

import { useState, type Dispatch, type SetStateAction } from 'react'

import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { FieldGroup, Field, FieldError } from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Spinner } from '#/components/ui/spinner'
import { useChangePassword } from '#/features/auth/hooks/use-auth'
import { changePasswordSchema } from '#/features/auth/schemas/auth.schema'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  defaultOpen?: boolean
}

export const ChangePasswordDialog = ({ open, setOpen, defaultOpen }: Props) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const changePasswordMutation = useChangePassword()

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onChange: changePasswordSchema,
      onSubmit: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await changePasswordMutation.mutateAsync(value)
    },
  })

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword((prev) => !prev)
  }

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} defaultOpen={defaultOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Change password
          </DialogTitle>

          <DialogDescription className="text-sm">
            Make sure you have a strong password.
          </DialogDescription>
        </DialogHeader>

        <form
          id="change-password-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="currentPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <LockIcon className="text-muted-foreground" />
                      </InputGroupAddon>

                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-label="Current Password"
                        placeholder="Current Password"
                        autoComplete="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showCurrentPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                          aria-pressed={showCurrentPassword}
                          type="button"
                          size="icon-xs"
                          onClick={toggleCurrentPasswordVisibility}
                        >
                          {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="newPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <LockIcon className="text-muted-foreground" />
                      </InputGroupAddon>

                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-label="New Password"
                        placeholder="New Password"
                        autoComplete="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showNewPassword ? 'Hide password' : 'Show password'
                          }
                          aria-pressed={showNewPassword}
                          type="button"
                          size="icon-xs"
                          onClick={toggleNewPasswordVisibility}
                        >
                          {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <LockIcon className="text-muted-foreground" />
                      </InputGroupAddon>

                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        aria-label="Confirm Password"
                        placeholder="Confirm Password"
                        autoComplete="new-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showConfirmPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                          aria-pressed={showConfirmPassword}
                          type="button"
                          size="icon-xs"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                form="change-password-form"
                disabled={!canSubmit || isSubmitting}
              >
                {changePasswordMutation.isPending ? (
                  <Spinner />
                ) : (
                  'Save changes'
                )}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
