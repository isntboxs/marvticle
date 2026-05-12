import { useForm } from '@tanstack/react-form-start'
import { createFileRoute } from '@tanstack/react-router'

import { useEffect, useRef, useState } from 'react'

import { CheckIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button.tsx'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '#/components/ui/input-group'
import { Input } from '#/components/ui/input.tsx'
import { Spinner } from '#/components/ui/spinner.tsx'
import { Textarea } from '#/components/ui/textarea'
import { UploadDropzone } from '#/components/upload-dropzone.tsx'
import {
  useUserProfile,
  userProfileQueryOptions,
} from '#/hooks/use-user-profile.ts'
import { authClient } from '#/lib/auth/client'
import { cn } from '#/lib/utils'
import { generalSettingsSchema } from '#/schemas/users.schema.ts'

export const Route = createFileRoute('/_main/$username_/settings/')({
  beforeLoad: () => ({
    breadcrumb: 'Settings',
  }),
  loader: async ({ context, params }) => {
    const user = await context.queryClient.ensureQueryData(
      userProfileQueryOptions(params.username)
    )

    return { user }
  },
  component: RouteComponent,
})

type FormMeta = {
  submitAction: 'update-banner' | 'update-avatar' | 'check-username' | null
}

const onSubmitMeta: FormMeta = {
  submitAction: null,
}

function RouteComponent() {
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null)
  const usernameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { username } = Route.useParams()
  const { data: user } = useUserProfile(username)

  const form = useForm({
    defaultValues: {
      image: user.image ?? '',
      banner: user.banner ?? '',
      name: user.name,
      username: user.username,
      bio: user.bio ?? '',
      pronouns: user.pronouns ?? '',
      location: user.location ?? '',
      education: user.education ?? '',
      work: user.work ?? '',
    },
    onSubmitMeta,
    validators: {
      onChange: generalSettingsSchema,
      onSubmit: generalSettingsSchema,
    },
    onSubmit: async ({ value, meta }) => {
      switch (meta.submitAction) {
        case 'check-username': {
          await authClient.isUsernameAvailable({
            username: value.username,
            fetchOptions: {
              onSuccess: (ctx) => {
                if (ctx.data) {
                  // oxlint-disable-next-line typescript/no-unsafe-member-access
                  setIsUsernameAvailable(ctx.data.available as boolean)
                } else {
                  setIsUsernameAvailable(false)
                }
              },
              onError: () => {
                setIsUsernameAvailable(null)
                toast.error('Failed to check username availability')
              },
            },
          })
          break
        }
        case 'update-avatar':
          await authClient.updateUser({
            image: value.image,
            fetchOptions: {
              onSuccess: () => {
                toast.success('User updated', {
                  description: 'Profile updated successfully',
                })
              },
              onError: (ctx) => {
                toast.error('Failed update', {
                  description: ctx.error.message,
                })
              },
            },
          })
          break
        case 'update-banner':
          await authClient.updateUser({
            banner: value.banner,
            fetchOptions: {
              onSuccess: () => {
                toast.success('User updated', {
                  description: 'Profile updated successfully',
                })
              },
              onError: (ctx) => {
                toast.error('Failed update', {
                  description: ctx.error.message,
                })
              },
            },
          })
          break
        default:
          await authClient.updateUser({
            banner: value.banner,
            image: value.image,
            name: value.name,
            username: value.username,
            bio: value.bio,
            pronouns: value.pronouns,
            location: value.location,
            work: value.work,
            education: value.education,
            fetchOptions: {
              onSuccess: () => {
                toast.success('User updated', {
                  description: 'Profile updated successfully',
                })
              },

              onError: (ctx) => {
                toast.error('Failed update', {
                  description: ctx.error.message,
                })
              },
            },
          })
          break
      }
    },
  })

  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) clearTimeout(usernameTimeoutRef.current)
    }
  }, [])

  return (
    <div className="lg:h-[calc(100svh-13rem)] lg:overflow-y-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="grid grid-cols-1 gap-y-6 max-md:max-w-full lg:max-w-3xl"
      >
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold">General</h1>
          <p className="text-base text-muted-foreground">
            Configure your profile settings.
          </p>
        </div>

        {/* Profile Images */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-base">Profile Images</h2>
            <p className="text-sm text-muted-foreground">
              Your banner and profile photo are visible across your public
              profile.
            </p>
          </div>

          <div className="relative">
            <form.Field
              name="banner"
              children={(field) => (
                <UploadDropzone
                  variant="banner"
                  value={field.state.value}
                  onChange={(value) => {
                    field.handleChange(value)
                    if (!form.store.state.isSubmitting) {
                      void form.handleSubmit({ submitAction: 'update-banner' })
                    }
                  }}
                  label="Profile banner"
                  className="w-full"
                />
              )}
            />

            <div className="absolute -bottom-10 left-6">
              <form.Field
                name="image"
                children={(field) => (
                  <UploadDropzone
                    variant="avatar"
                    value={field.state.value}
                    onChange={(value) => {
                      field.handleChange(value)
                      if (!form.store.state.isSubmitting) {
                        void form.handleSubmit({
                          submitAction: 'update-avatar',
                        })
                      }
                    }}
                    label="Profile photo"
                    className={cn(
                      'size-20 border border-background ring-1 ring-border md:size-24',
                      !field.state.value && 'bg-sidebar'
                    )}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Spacer for avatar overlap */}
        <div className="h-4" />

        <div className="space-y-6">
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-base">
                      Full Name
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="John Doe"
                      autoComplete="name"
                      className="text-sm!"
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription className="text-sm">
                      Your display name shown across the platform
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                    <FieldLabel htmlFor={field.name} className="text-base">
                      Username
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText className="text-sm">
                          {import.meta.env.VITE_APP_URL}/
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value)

                          if (usernameTimeoutRef.current)
                            clearTimeout(usernameTimeoutRef.current)
                          usernameTimeoutRef.current = setTimeout(() => {
                            void form.handleSubmit({
                              submitAction: 'check-username',
                            })
                          }, 500)
                        }}
                        placeholder="e.g. johnDoe"
                        autoComplete="username"
                        className="pl-0.5! text-sm!"
                        aria-invalid={isInvalid}
                      />
                      {isUsernameAvailable !== null && (
                        <InputGroupAddon align="inline-end">
                          {isUsernameAvailable ? (
                            <CheckIcon className="text-green-500" />
                          ) : (
                            <XIcon className="text-destructive" />
                          )}
                        </InputGroupAddon>
                      )}
                    </InputGroup>
                    <FieldDescription className="text-sm">
                      Your unique handle — shown in your profile url (e.g.
                      /johnDoe)
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="bio"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-base">
                      Bio
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Tell the world a little bit about yourself..."
                      className="text-sm!"
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription className="text-sm">
                      A short description about yourself, shown on your public
                      profile
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="pronouns"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-base">
                      Pronouns
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. he/him"
                      className="text-sm!"
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription className="text-sm">
                      Shown on your profile (e.g. he/him, she/her, they/them)
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="location"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-base">
                      Location
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. New York, USA"
                      className="text-sm!"
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription className="text-sm">
                      Where you're based (e.g. New York, USA)
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="work"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-base">
                      Work
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Software Engineer at Tech Corp"
                      className="text-sm!"
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription className="text-sm">
                      Your current company or role
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="education"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="text-base">
                      Education
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Bachelor's in Computer Science"
                      className="text-sm!"
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription className="text-sm">
                      Your educational background
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? <Spinner /> : 'Save Changes'}
              </Button>
            )}
          />
        </div>
      </form>
    </div>
  )
}
