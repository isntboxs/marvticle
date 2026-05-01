import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form-start'
import { useState } from 'react'

import type { CreatePostBodyInput } from '#/schemas/posts.schema'
import { ImageDropzone } from '#/components/image-dropzone'
import { MarkdownEditor } from '#/components/markdown-editor'
import { MarkdownRenderer } from '#/components/markdown-renderer'
import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldGroup } from '#/components/ui/field'
import { Spinner } from '#/components/ui/spinner'
import { TabsContent } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { useNewPost } from '#/hooks/use-new-post'
import { createPostBodySchema } from '#/schemas/posts.schema'
import { getStorageUrl } from '#/utils/storage'

export const Route = createFileRoute('/_post-form/new')({
  head: () => {
    const title = `New Post | ${import.meta.env.VITE_APP_NAME} — Write Anything That Matters`
    const description = `Start with a thought. See where it goes.`
    const appUrl = import.meta.env.VITE_APP_URL

    return {
      meta: [
        { title: title },
        { name: 'description', content: description },

        // open graph
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: appUrl },
        {
          property: 'og:image',
          content: `${appUrl}/api/og-static?type=post&title=${encodeURIComponent('What’s on your mind?')}&description=${encodeURIComponent(description)}&label=${encodeURIComponent('New Post')}&pathname=${encodeURIComponent('new')}`,
        },
        { property: 'og:site_name', content: import.meta.env.VITE_APP_NAME },

        // twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:url', content: appUrl },
        {
          name: 'twitter:image',
          content: `${appUrl}/api/og-static?type=post&title=${encodeURIComponent('What’s on your mind?')}&description=${encodeURIComponent(description)}&label=${encodeURIComponent('New Post')}&pathname=${encodeURIComponent('new')}`,
        },
      ],
    }
  },
  component: RouteComponent,
})

type FormMeta = {
  submitAction: 'publish' | 'save'
}

const onSubmitMeta: FormMeta = {
  submitAction: 'publish',
}

const defaultValues: CreatePostBodyInput = {
  title: '',
  coverImage: '',
  content: '',
  status: 'PUBLISHED',
}

function RouteComponent() {
  const { auth, queryClient, orpc } = Route.useRouteContext()
  const [activeSubmitAction, setActiveSubmitAction] = useState<
    FormMeta['submitAction'] | null
  >(null)

  const createPostMutation = useNewPost({
    queryClient,
    orpc,
    username: auth.user.username,
  })

  const form = useForm({
    defaultValues,
    onSubmitMeta,
    validators: {
      onChange: createPostBodySchema,
      onSubmit: createPostBodySchema,
    },
    onSubmit: async ({ value, meta }) => {
      if (meta.submitAction === 'save') {
        await createPostMutation.mutateAsync({ ...value, status: 'DRAFT' })
      } else {
        await createPostMutation.mutateAsync(value)
      }
    },
  })

  const handleSubmitAction = async (submitAction: FormMeta['submitAction']) => {
    setActiveSubmitAction(submitAction)

    try {
      await form.handleSubmit({ submitAction })
    } finally {
      setActiveSubmitAction(null)
    }
  }

  const handlePublish = () => {
    void handleSubmitAction('publish')
  }

  const handleSave = () => {
    void handleSubmitAction('save')
  }

  return (
    <>
      <main className="container mx-auto h-[calc(100vh-8rem)] w-full max-w-4xl overflow-y-auto bg-card px-12 py-8">
        <TabsContent value="edit">
          <form
            id="create-post-form"
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
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
                          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                            e.preventDefault()
                          }
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
              const canSubmitNow = !!canSubmit
              const formIsSubmitting = !!isSubmitting
              const isPending = formIsSubmitting || createPostMutation.isPending
              const isPublishing = isPending && activeSubmitAction === 'publish'

              return (
                <Button
                  form="create-post-form"
                  type="submit"
                  size="lg"
                  onClick={handlePublish}
                  disabled={!canSubmitNow || isPending}
                >
                  {isPublishing ? (
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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => {
              const canSubmitNow = !!canSubmit
              const formIsSubmitting = !!isSubmitting
              const isPending = formIsSubmitting || createPostMutation.isPending
              const isSaving = isPending && activeSubmitAction === 'save'

              return (
                <Button
                  form="create-post-form"
                  type="submit"
                  size="lg"
                  onClick={handleSave}
                  disabled={!canSubmitNow || isPending}
                >
                  {isSaving ? (
                    <>
                      <Spinner />
                      Saving...
                    </>
                  ) : (
                    'Save as draft'
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
    </>
  )
}
