import { useForm } from '@tanstack/react-form-start'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { useState } from 'react'

import { LockIcon } from '@phosphor-icons/react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldGroup } from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Spinner } from '#/components/ui/spinner'
import { authClient } from '#/lib/auth/client'
import { resetPasswordSchema } from '#/schemas/auth.schema'

const resetPasswordSearchSchema = z.object({
  token: z.string(),
})

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({
        to: '/sign-in',
        replace: true,
        viewTransition: true,
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },

    validators: {
      onChange: resetPasswordSchema,
      onSubmit: resetPasswordSchema,
    },

    onSubmit: async ({ value }) => {
      await authClient.resetPassword({
        newPassword: value.password,
        token: search.token,
        fetchOptions: {
          onSuccess: () => {
            void navigate({
              to: '/sign-in',
              replace: true,
              viewTransition: true,
            })

            toast.success('Password reset successfully')
          },
          onError: (ctx) => {
            toast.error('Failed to reset password', {
              description: ctx.error.message,
            })
          },
        },
      })
    },
  })

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev)
  }

  return (
    <form
      id="reset-password-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="password"
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
                    aria-label="Password"
                    placeholder="Password"
                    autoComplete="new-password"
                    type={showPassword ? 'text' : 'password'}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      aria-pressed={showPassword}
                      type="button"
                      size="icon-xs"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                        showConfirmPassword ? 'Hide password' : 'Show password'
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

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? <Spinner /> : 'Reset Password'}
          </Button>
        )}
      />
    </form>
  )
}
