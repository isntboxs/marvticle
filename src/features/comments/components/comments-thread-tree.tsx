import { useForm } from '@tanstack/react-form'
import { ClientOnly, getRouteApi, useLocation } from '@tanstack/react-router'

import type { FC } from 'react'
import { useState } from 'react'

import { ArrowBendLeftUpIcon } from '@phosphor-icons/react'
import { formatDistanceToNowStrict } from 'date-fns'
import { MinusIcon, PlusIcon } from 'lucide-react'

import BlockNoteEditor from '#/components/block-note/editor'
import { MarkdownRenderer } from '#/components/markdown-renderer'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Field, FieldGroup } from '#/components/ui/field'
import { Separator } from '#/components/ui/separator'
import { Spinner } from '#/components/ui/spinner'
import { UserAvatar } from '#/components/user-avatar'
import {
  useCommentRepliesInfiniteQuery,
  useCreateReplyMutation,
} from '#/features/comments/hooks/use-comments'
import { commentCreateReplySchema } from '#/features/comments/schemas/comment.schema'
import { cn } from '#/lib/utils'
import type { RouterOutputs } from '#/orpc/routers'

type CommentOutput = RouterOutputs['comments']['list']['items'][number]

interface CommentsThreadTreeProps {
  comments: CommentOutput[]
  threadAuthorId: string
}

interface CommentsThreadTreeNodeProps {
  comment: CommentOutput
  depth: number
  threadAuthorId: string
}

interface CommentReplyFormProps {
  parentId: string
  onCloseForm: () => void
}

const routeApi = getRouteApi('/_main/$username_/threads/$threadSlug')

const CommentsThreadTreeNode: FC<CommentsThreadTreeNodeProps> = ({
  comment,
  depth,
  threadAuthorId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [showReplyForm, setShowReplyForm] = useState<boolean>(false)

  const { replies, totalCount } = useCommentRepliesInfiniteQuery({
    parentId: comment.id,
    enabled: !!isExpanded,
  })

  const isAuthor = comment.author.id === threadAuthorId
  const repliesCount = isExpanded ? totalCount : comment.commentsCount
  const relativeTime = (date: Date) => formatDistanceToNowStrict(date)

  const handleReply = () => {
    setShowReplyForm((value) => !value)
  }

  const toggleExpand = () => {
    setIsExpanded((value) => !value)
  }

  return (
    <div
      className={cn(
        'space-y-4 transition-all duration-500 ease-in-out',
        depth > 0
          ? 'ml-4 border-l-2 border-muted pl-6'
          : 'border-l-0 border-transparent'
      )}
    >
      <div className="flex items-center gap-2">
        <UserAvatar
          image={comment.author.image}
          name={comment.author.username}
        />

        <div className="flex-1">
          <div
            className={cn(
              '-mt-1 flex items-center -space-y-1 font-heading text-sm font-semibold'
            )}
          >
            <span className="max-w-[15ch] truncate">{comment.author.name}</span>

            <Separator className="mx-1 mt-0.5 rounded-full data-horizontal:size-1" />

            <span
              className={cn(
                'mt-1.5 text-xs font-normal text-muted-foreground',
                isAuthor && 'mt-0.5'
              )}
            >
              {relativeTime(new Date(comment.createdAt))}
            </span>

            {!!isAuthor && (
              <>
                <Separator className="mx-1 mt-0.5 rounded-full data-horizontal:size-1" />

                <Badge
                  variant="secondary"
                  className="mt-1.5 px-1 py-0.5 text-[11px]"
                >
                  Author
                </Badge>
              </>
            )}
          </div>

          <p className="max-w-[15ch] truncate text-xs font-medium tracking-wide text-muted-foreground">
            @{comment.author.username}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <MarkdownRenderer content={comment.content} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!comment.isDeleted && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReply}
            >
              <ArrowBendLeftUpIcon />
              <span>Reply</span>
            </Button>
          )}
        </div>

        {repliesCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="px-1.5"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <>
                <MinusIcon />
                <span>Hide replies</span>
              </>
            ) : (
              <>
                <PlusIcon />
                <span>{repliesCount} replies</span>
              </>
            )}
          </Button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-4 ml-4 border-l-2 border-muted pl-6">
          <CommentReplyForm
            parentId={comment.id}
            onCloseForm={() => setShowReplyForm((value) => !value)}
          />
        </div>
      )}

      {isExpanded &&
        replies.map((reply) => (
          <div key={reply.id} className="">
            <CommentsThreadTreeNode
              comment={reply}
              depth={reply.depth}
              threadAuthorId={threadAuthorId}
            />
          </div>
        ))}
    </div>
  )
}

export const CommentsThreadTree: React.FC<CommentsThreadTreeProps> = ({
  comments,
  threadAuthorId,
}) => {
  return (
    <div className="relative space-y-8">
      {comments.map((comment) => (
        <CommentsThreadTreeNode
          key={comment.id}
          comment={comment}
          depth={comment.depth}
          threadAuthorId={threadAuthorId}
        />
      ))}
    </div>
  )
}

const CommentReplyForm: FC<CommentReplyFormProps> = ({
  parentId,
  onCloseForm,
}) => {
  const { auth } = routeApi.useRouteContext()
  const { threadSlug } = routeApi.useParams()
  const location = useLocation()
  const navigate = routeApi.useNavigate()

  const createReplyMutation = useCreateReplyMutation({ threadSlug })

  const form = useForm({
    defaultValues: {
      parentId,
      content: '',
    },
    validators: {
      onChange: commentCreateReplySchema,
      onSubmit: commentCreateReplySchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createReplyMutation.mutateAsync(value)
      formApi.reset()
      onCloseForm()
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
    <form
      id="comment-reply-form"
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
              form="comment-reply-form"
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
  )
}
