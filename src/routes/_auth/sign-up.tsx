import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form-start'
import { LockIcon, MailboxIcon, UserIcon } from '@phosphor-icons/react'
import { AtSignIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { toast } from 'sonner'

import { signUpSchema } from '#/schemas/auth.schema'
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

export const Route = createFileRoute('/_auth/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onChange: signUpSchema,
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await authClient.signUp.email({
        name: value.name,
        username: value.username,
        email: value.email,
        password: value.password,
      })

      if (result.error) {
        switch (result.error.code) {
          case 'USERNAME_IS_ALREADY_TAKEN':
            formApi.setFieldMeta('username', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: ['Username is already taken. Please try another.'],
              errorMap: {
                ...meta.errorMap,
                onSubmit: 'Username is already taken. Please try another.',
              },
            }))

            toast.error('Failed to sign up', {
              description: result.error.message,
            })
            break
          case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
            formApi.setFieldMeta('email', (meta) => ({
              ...meta,
              isTouched: true,
              isValid: false,
              errors: ['User already exists. Use another email.'],
              errorMap: {
                ...meta.errorMap,
                onSubmit: 'User already exists. Use another email.',
              },
            }))

            toast.error('Failed to sign up', {
              description: result.error.message,
            })
            break
          default:
            toast.error('Failed to sign up', {
              description: 'Something went wrong. Please try again.',
            })
            break
        }
      }

      if (result.data) {
        toast.success('Sign up successfully', {
          description: 'Please sign in to continue.',
        })

        void navigate({ to: '/sign-in', viewTransition: true })
      }
    },
  })

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev)
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
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <UserIcon className="text-muted-foreground" />
                  </InputGroupAddon>

                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    aria-label="Full name"
                    placeholder="Full name"
                    autoComplete="name"
                    type="text"
                  />
                </InputGroup>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />

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
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <MailboxIcon className="text-muted-foreground" />
                  </InputGroupAddon>

                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    aria-label="Email"
                    placeholder="Email"
                    autoComplete="email"
                    type="email"
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
                      onClick={toggleShowConfirmPassword}
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
            {isSubmitting ? <Spinner /> : 'Sign Up'}
          </Button>
        )}
      />
    </form>
  )
}
