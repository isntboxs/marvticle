import { useForm } from '@tanstack/react-form-start'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { toast } from 'sonner'

import { MarkdownEditor } from '#/components/markdown-editor'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Field,
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
import { createPostBodySchema } from '#/schemas/posts.schema'

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

    return { auth: context.auth }
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
  const username = auth.user.username

  const createPostMutation = useMutation(orpc.posts.create.mutationOptions())

  const form = useForm({
    defaultValues: {
      title: '',
      coverImage: '',
      content: '',
      status: 'PUBLISHED',
    },
    validators: {
      onChange: createPostBodySchema,
      onSubmit: createPostBodySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const post = await createPostMutation.mutateAsync({
          title: value.title,
          coverImage: value.coverImage,
          content: value.content,
          status: 'PUBLISHED',
        })

        await queryClient.invalidateQueries({
          queryKey: postsInfiniteQueryOptions(DEFAULT_POSTS_LIMIT).queryKey,
        })

        toast.success('Post published', {
          description: 'Your article is now live on the feed.',
        })

        await navigate({
          to: '/$username/$postSlug',
          params: {
            username,
            postSlug: post.slug,
          },
          viewTransition: true,
        })
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
      <Card>
        <CardContent className="space-y-6">
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
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="New post title here..."
                        autoComplete="off"
                        maxLength={180}
                        className="resize-none border-none bg-transparent! px-0 text-4xl! font-semibold tracking-tight shadow-none ring-0!"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="coverImage"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Cover image URL
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="https://example.com/cover.jpg"
                        autoComplete="off"
                        type="url"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
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
                      <MarkdownEditor
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Write your content here..."
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
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
        </CardContent>
      </Card>
    </section>
  )
}
