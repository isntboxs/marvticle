import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form-start'

import type { UpdatePostBodyInput } from '#/schemas/posts.schema'
import {
  editablePostDetailQueryOptions,
  useEditablePostDetail,
} from '#/hooks/use-post-detail'
import { useUpdatePost } from '#/hooks/use-update-post'
import { updatePostBodySchema } from '#/schemas/posts.schema'
import { ImageDropzone } from '#/components/image-dropzone'
import { MarkdownEditor } from '#/components/markdown-editor'
import { MarkdownRenderer } from '#/components/markdown-renderer'
import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Spinner } from '#/components/ui/spinner'
import { TabsContent } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { getStorageUrl } from '#/utils/storage'

const postStatusOptions = ['PUBLISHED', 'DRAFT', 'ARCHIVED'] as const

type PostStatus = (typeof postStatusOptions)[number]

const isPostStatus = (value: string): value is PostStatus => {
  return postStatusOptions.some((status) => status === value)
}

export const Route = createFileRoute('/_post-form/$username/$postSlug/edit')({
  loader: async ({ context: { queryClient }, params }) => {
    await queryClient.ensureQueryData(
      editablePostDetailQueryOptions(params.username, params.postSlug)
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const { queryClient, orpc } = Route.useRouteContext()

  const { data: post } = useEditablePostDetail(
    params.username,
    params.postSlug
  )

  const updatePostMutation = useUpdatePost({
    queryClient,
    orpc,
    username: params.username,
  })

  const defaultValues: UpdatePostBodyInput = {
    title: post.title,
    coverImage: post.coverImage ?? '',
    content: post.content,
    status: post.status,
  }

  const form = useForm({
    defaultValues,
    validators: {
      onChange: updatePostBodySchema,
      onSubmit: updatePostBodySchema,
    },
    onSubmit: async ({ value }) => {
      await updatePostMutation.mutateAsync({
        id: post.id,
        ...value,
      })
    },
  })

  return (
    <>
      <main className="container mx-auto h-[calc(100vh-8rem)] w-full max-w-4xl overflow-y-auto bg-card px-12 py-8">
        <TabsContent value="edit">
          <form
            id="update-post-form"
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
                        value={field.state.value ?? undefined}
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
                        alt={title ?? ''}
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
          <form.Field
            name="status"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field
                  data-invalid={isInvalid}
                  orientation="horizontal"
                  className="w-auto items-center"
                >
                  <FieldLabel>Status</FieldLabel>
                  <ToggleGroup
                    type="single"
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (isPostStatus(value)) {
                        field.handleChange(value)
                      }
                    }}
                    size="sm"
                    variant="outline"
                    aria-invalid={isInvalid}
                  >
                    {postStatusOptions.map((status) => (
                      <ToggleGroupItem key={status} value={status}>
                        {status}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => {
              const canSubmitNow = canSubmit ?? false
              const formIsSubmitting = isSubmitting ?? false
              const isPending = formIsSubmitting || updatePostMutation.isPending

              return (
                <Button
                  form="update-post-form"
                  type="submit"
                  size="lg"
                  disabled={!canSubmitNow || isPending}
                >
                  {isPending ? (
                    <>
                      <Spinner />
                      Updating...
                    </>
                  ) : (
                    'Update post'
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
