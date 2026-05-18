import { useForm } from '@tanstack/react-form'
import { ClientOnly, getRouteApi, useLocation } from '@tanstack/react-router'

import BlockNoteEditor from '#/components/block-note/editor'
import { Button } from '#/components/ui/button'
import { Field, FieldGroup } from '#/components/ui/field'
import { Spinner } from '#/components/ui/spinner'
import { CommentsThreadTree } from '#/features/comments/components/comments-thread-tree'
import {
  useCreateCommentMutation,
  useThreadCommentsInfiniteQuery,
} from '#/features/comments/hooks/use-comments'
import { commentCreateRootSchema } from '#/features/comments/schemas/comment.schema'

interface CommentsThreadProps {
  threadAuthorId: string
}

const routeApi = getRouteApi('/_main/$username_/threads/$threadSlug')

export const CommentsThread = ({ threadAuthorId }: CommentsThreadProps) => {
  const { auth } = routeApi.useRouteContext()
  const { threadSlug } = routeApi.useParams()
  const location = useLocation()
  const navigate = routeApi.useNavigate()

  const { comments, totalCount } = useThreadCommentsInfiniteQuery({
    threadSlug,
  })
  const createCommentMutation = useCreateCommentMutation()

  const form = useForm({
    defaultValues: {
      threadSlug,
      content: '',
    },
    validators: {
      onChange: commentCreateRootSchema,
      onSubmit: commentCreateRootSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createCommentMutation.mutateAsync(value)
      formApi.reset()
    },
  })

  const handleNavigateToSignIn = () => {
    void navigate({
      to: '/sign-in',
      search: {
        redirect_to: location.pathname,
      },
    })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">
          Comments{' '}
          <span className="text-sm text-muted-foreground">({totalCount})</span>
        </h2>
      </div>

      <form
        id="comment-thread-form"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="mb-8"
      >
        <FieldGroup>
          <form.Field
            name="content"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <ClientOnly>
                    <BlockNoteEditor
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e)}
                      className="[&_.bn-editor]:min-h-24 [&_.bn-editor]:border! [&_.bn-editor]:border-border! [&_.bn-editor]:px-2!"
                    />
                  </ClientOnly>
                </Field>
              )
            }}
          />
        </FieldGroup>

        {auth ? (
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                form="comment-thread-form"
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? <Spinner /> : 'Post Comment'}
              </Button>
            )}
          />
        ) : (
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="button"
                onClick={handleNavigateToSignIn}
                disabled={!canSubmit || isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? <Spinner /> : 'Post Comment'}
              </Button>
            )}
          />
        )}
      </form>

      <CommentsThreadTree comments={comments} threadAuthorId={threadAuthorId} />
    </>
  )
}
