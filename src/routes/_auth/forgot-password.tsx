import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form-start'
import { ArrowLeftIcon, CheckCircle, MailIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useState } from 'react'
import { forgotPasswordSchema } from '#/schemas/auth.schema'
import { Field, FieldError, FieldGroup } from '#/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Spinner } from '#/components/ui/spinner'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth/client'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [sentEmail, setSentEmail] = useState<string>('')

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onChange: forgotPasswordSchema,
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: '/reset-password',
        fetchOptions: {
          onSuccess: () => {
            toast.success('Password reset email sent')
            setSentEmail(value.email)
            setIsDialogOpen(true)
          },

          onError: (ctx) => {
            toast.error('Request Password Reset Failed', {
              description: ctx.error.message,
            })
            setIsDialogOpen(false)
          },
        },
      })
    },
  })

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultOpen={false}
      >
        <DialogContent>
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-12 items-center justify-center border border-border bg-background">
              <MailIcon />
            </div>

            <DialogTitle className="text-base">Check your email</DialogTitle>

            <DialogDescription className="text-sm">
              We've sent a password reset link to {sentEmail}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 border border-border bg-background p-2">
            <CheckCircle className="size-3" />
            <p className="text-sm">
              If you don't see the email, check your spam folder.
            </p>
          </div>

          <DialogFooter>
            <div className="flex w-full flex-col gap-2">
              <DialogClose asChild>
                <Button variant="default" className="w-full" asChild>
                  <Link to="/sign-in" viewTransition>
                    <ArrowLeftIcon /> Back to Sign In
                  </Link>
                </Button>
              </DialogClose>

              <DialogClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <form
        id="forgot-password-form"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <MailIcon className="text-muted-foreground" />
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
        </FieldGroup>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="mt-4 w-full"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? <Spinner /> : 'Send Reset Link'}
            </Button>
          )}
        />
      </form>
    </>
  )
}
