import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { AppWindowIcon, PencilIcon } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form-start'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { orpc } from '#/orpc/client'
import { createPostBodySchema } from '#/schemas/posts.schema'
import {
  DEFAULT_POSTS_LIMIT,
  postsInfiniteQueryOptions,
} from '#/hooks/use-posts'
import { Field, FieldError, FieldGroup } from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'
import { MarkdownEditor } from '#/components/markdown-editor'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { MarkdownRenderer } from '#/components/markdown-renderer'
import { AspectRatio } from '#/components/ui/aspect-ratio'
import { ImageDropzone } from '#/components/image-dropzone'
import { getStorageUrl } from '#/utils/storage'

export const Route = createFileRoute('/new')({
  beforeLoad: ({ context, location }) => {
    const { auth } = context
    if (!auth) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.pathname,
        },
      })
    }

    return { auth }
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
    <Tabs
      defaultValue="edit"
      className="flex min-h-svh items-center justify-center"
    >
      <header className="fixed top-0 right-0 left-0 z-50 h-14 border-b bg-background/85 backdrop-blur-sm supports-backdrop-filter:bg-background/65">
        <div className="container mx-auto flex h-full w-full max-w-348 items-center justify-between px-4 md:px-6">
          <Link to="/" viewTransition>
            <span className="text-xl font-bold tracking-tighter">
              Marvticle
            </span>
          </Link>

          <TabsList className="gap-2 bg-transparent">
            <TabsTrigger value="edit">
              <PencilIcon /> Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <AppWindowIcon /> Preview
            </TabsTrigger>
          </TabsList>
        </div>
      </header>

      <main className="container mx-auto h-[calc(100vh-8rem)] w-full max-w-4xl overflow-y-auto bg-card px-12 py-8">
        <TabsContent value="edit">
          <form
            id="create-post-form"
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="coverImage"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <ImageDropzone
                        value={field.state.value}
                        onChange={field.handleChange}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
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
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.preventDefault()
                        }}
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
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <form.Subscribe
            selector={(state) => [
              state.values.coverImage,
              state.values.title,
              state.values.content,
            ]}
            children={([coverImage, title, content]) => {
              return (
                <div className="space-y-6">
                  {coverImage && (
                    <AspectRatio
                      ratio={2.38 / 1}
                      className="overflow-hidden border"
                    >
                      <img
                        src={getStorageUrl(coverImage)}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    </AspectRatio>
                  )}

                  {title && (
                    <h1 className="text-3xl leading-tight font-bold tracking-tight">
                      {title}
                    </h1>
                  )}

                  {content && (
                    <MarkdownRenderer
                      content={content}
                      className="max-w-none"
                    />
                  )}
                </div>
              )
            }}
          />
        </TabsContent>
      </main>

      <footer className="fixed right-0 bottom-0 left-0 z-50 h-14">
        <div className="container mx-auto flex h-full w-full max-w-4xl items-center justify-start gap-3">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => {
              const canSubmitNow = canSubmit ?? false
              const formIsSubmitting = isSubmitting ?? false
              const isPending = formIsSubmitting || createPostMutation.isPending

              return (
                <Button
                  form="create-post-form"
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

          <Button asChild type="button" variant="outline" size="lg">
            <Link to="/" viewTransition>
              Cancel
            </Link>
          </Button>
        </div>
      </footer>
    </Tabs>
  )
}
