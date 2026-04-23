import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form-start'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { ArrowLeftIcon, NotePencilIcon } from '@phosphor-icons/react'
import { AlertTriangleIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Spinner } from '#/components/ui/spinner'
import { Textarea } from '#/components/ui/textarea'
import {
  DEFAULT_POSTS_LIMIT,
  postsInfiniteQueryOptions,
} from '#/hooks/use-posts'
import { orpc } from '#/orpc/client'
import { createPostFormSchema } from '#/schemas/posts.schema'
import { ImageDropzone } from '#/components/image-dropzone'

export const Route = createFileRoute('/_app/new')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.pathname,
        },
        viewTransition: true,
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: 'Create post | marvticle',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { auth } = Route.useRouteContext()
  const username = auth?.user.username

  const createPostMutation = useMutation(orpc.posts.create.mutationOptions())

  const form = useForm({
    defaultValues: {
      title: '',
      coverImageUrl: '',
      content: '',
    },
    validators: {
      onChange: createPostFormSchema,
      onSubmit: createPostFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const coverImageUrl = value.coverImageUrl.trim()

        const post = await createPostMutation.mutateAsync({
          title: value.title,
          coverImageUrl: coverImageUrl === '' ? undefined : coverImageUrl,
          content: value.content,
          status: 'PUBLISHED',
        })

        await queryClient.invalidateQueries({
          queryKey: postsInfiniteQueryOptions(DEFAULT_POSTS_LIMIT).queryKey,
        })

        toast.success('Post published', {
          description: 'Your article is now live on the feed.',
        })

        if (username) {
          await navigate({
            to: '/$username/$postSlug',
            params: {
              username,
              postSlug: post.slug,
            },
            viewTransition: true,
          })

          return
        }

        await navigate({ to: '/', viewTransition: true })
      } catch (error) {
        const description =
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.'

        toast.error('Failed to publish post', {
          description,
        })
      }
    },
  })

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/" viewTransition>
            <ArrowLeftIcon className="size-4" />
            Kembali ke feed
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <NotePencilIcon className="size-5" />
            <div className="space-y-1">
              <CardTitle>Create a new post</CardTitle>
              <CardDescription>
                Post dari halaman ini akan langsung dipublikasikan. Draft UI
                belum tersedia.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!username ? (
            <Alert variant="destructive">
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>Username is required</AlertTitle>
              <AlertDescription>
                Akun ini belum punya username, jadi URL post tidak bisa dibentuk
                dengan pola <code>/username/post-slug</code>.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <AlertTitle>Publish-only flow</AlertTitle>
                <AlertDescription>
                  Endpoint backend masih mendukung status draft, tapi route ini
                  sementara publish langsung supaya hasil submit punya halaman
                  tujuan yang jelas.
                </AlertDescription>
              </Alert>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  void form.handleSubmit()
                }}
              >
                <FieldGroup>
                  <form.Field
                    name="coverImageUrl"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Cover image
                          </FieldLabel>
                          <ImageDropzone />
                          {/* <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="https://example.com/cover.jpg"
                            autoComplete="off"
                            type="url"
                          /> */}
                          <FieldDescription>
                            Opsional. Kosongkan kalau belum punya cover.
                          </FieldDescription>
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name="title"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Masukkan judul post"
                            autoComplete="off"
                          />
                          <FieldDescription>
                            Judul ini dipakai untuk generate slug otomatis.
                          </FieldDescription>
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name="content"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Content</FieldLabel>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="Tulis isi post di sini..."
                            className="min-h-72"
                          />
                          <FieldDescription>
                            Plain text dulu. Rich markdown rendering belum
                            tersedia di detail post.
                          </FieldDescription>
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      )
                    }}
                  />
                </FieldGroup>

                <div className="flex items-center justify-end gap-3">
                  <Button asChild type="button" variant="outline" size="lg">
                    <Link to="/" viewTransition>
                      Cancel
                    </Link>
                  </Button>

                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => {
                      const canSubmitNow = canSubmit ?? false
                      const formIsSubmitting = isSubmitting ?? false
                      const isPending =
                        formIsSubmitting || createPostMutation.isPending

                      return (
                        <Button
                          type="submit"
                          size="lg"
                          disabled={!canSubmitNow || isPending}
                        >
                          {isPending ? (
                            <>
                              <Spinner />
                              Publishing...
                            </>
                          ) : (
                            'Publish post'
                          )}
                        </Button>
                      )
                    }}
                  />
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
