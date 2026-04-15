import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form-start'
import { LockIcon } from '@phosphor-icons/react'
import { AtSignIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { toast } from 'sonner'

import { signInSchema } from '#/schemas/auth.schema'
import { Field, FieldError, FieldGroup } from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/_auth/sign-in')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onChange: signInSchema,
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await authClient.signIn.username({
        username: value.username,
        password: value.password,
      })

      if (result.error) {
        switch (result.error.code) {
          case 'INVALID_USERNAME_OR_PASSWORD':
            formApi.setFieldMeta('username', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: ['Invalid username or password.'],
              errorMap: {
                ...meta.errorMap,
                onSubmit: 'Invalid username or password.',
              },
            }))

            formApi.setFieldMeta('password', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: ['Invalid username or password.'],
              errorMap: {
                ...meta.errorMap,
                onSubmit: 'Invalid username or password.',
              },
            }))

            toast.error('Failed to sign in', {
              description: result.error.message,
            })
            break
          default:
            toast.error('Failed to sign in', {
              description: 'Something went wrong. Please try again.',
            })
            break
        }
      }

      if (result.data) {
        toast.success('Sign in successfully', {
          description: 'Welcome back!',
        })

        void navigate({ to: '/', viewTransition: true })
      }
    },
  })

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="username"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <AtSignIcon className="text-muted-foreground" />
                  </InputGroupAddon>

                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    aria-label="Username"
                    placeholder="Username"
                    autoComplete="username"
                    type="text"
                  />
                </InputGroup>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

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
                    autoComplete="current-password"
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
                      onClick={toggleShowPassword}
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
      </FieldGroup>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? <Spinner /> : 'Sign In'}
          </Button>
        )}
      />
    </form>
  )
}
