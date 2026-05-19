import React, { useState } from 'react'

import { formatDistanceToNowStrict } from 'date-fns'
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Reply,
  Share,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { Textarea } from '#/components/ui/textarea'
import type { RouterOutputs } from '#/orpc/routers'

// Derive type directly from the API so it never drifts
type ApiComment = RouterOutputs['comments']['list']['items'][number]

// Props for the internal Comment component
interface CommentProps {
  comment: ApiComment
  depth?: number
  onReply: (parentId: string, content: string) => void
  isOp?: boolean
}

const getInitials = (name: string | null) =>
  (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

// Internal recursive component to render each comment and its replies
const Comment: React.FC<CommentProps> = ({
  comment,
  depth = 0,
  onReply,
  isOp = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [replyText, setReplyText] = useState('')

  const handleVote = (voteType: 'up' | 'down') => {
    setUserVote(userVote === voteType ? null : voteType)
  }

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText)
      setReplyText('')
      setShowReplyBox(false)
    }
  }

  const displayName = comment.isDeleted ? '[deleted]' : comment.author.name

  const relativeTime = formatDistanceToNowStrict(new Date(comment.createdAt), {
    addSuffix: true,
  })

  const replies = comment.childComments ?? []

  return (
    <div
      className={`${depth > 0 ? 'ml-4 border-muted pl-4 md:ml-6 md:pl-6' : 'border-transparent'} border-l-2`}
    >
      <Card className="mb-4 transition-colors hover:bg-muted/30">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.image ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-xs">
                {getInitials(comment.author.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {relativeTime}
                </span>
                {isOp && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    OP
                  </span>
                )}
              </div>

              <div className="mb-3 text-sm leading-relaxed">
                {comment.isDeleted ? (
                  <span className="text-muted-foreground italic">
                    [deleted]
                  </span>
                ) : (
                  comment.content
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {/* Vote buttons (optimistic, local-only for now) */}
                <div className="flex items-center rounded-full bg-muted p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 rounded-full p-0 ${userVote === 'up' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}`}
                    onClick={() => handleVote('up')}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <span
                    className={`min-w-[24px] px-2 text-center text-xs font-medium ${userVote === 'up' ? 'text-orange-600 dark:text-orange-400' : userVote === 'down' ? 'text-blue-600 dark:text-blue-400' : ''}`}
                  >
                    {userVote === 'up' ? 1 : userVote === 'down' ? -1 : 0}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 rounded-full p-0 ${userVote === 'down' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}`}
                    onClick={() => handleVote('down')}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Action buttons */}
                {!comment.isDeleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setShowReplyBox(!showReplyBox)}
                  >
                    <Reply className="mr-1 h-3 w-3" /> Reply
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Share className="mr-1 h-3 w-3" /> Share
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>

                {/* Collapse toggle */}
                {replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs md:ml-auto"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Collapse' : `Expand (${replies.length})`}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {showReplyBox && (
          <CardContent className="pt-0">
            <div className="flex gap-3">
              <Avatar className="mt-1 h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-xs">
                  YU
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="What are your thoughts?"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[80px] resize-none text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyText.trim()}
                  >
                    Comment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReplyBox(false)
                      setReplyText('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Nested replies (childComments from API) */}
      {isExpanded && replies.length > 0 && (
        <div className="space-y-0">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              // childComments items don't have their own childComments yet,
              // so we cast with an empty array to satisfy the recursive type
              comment={{ ...reply, childComments: [] }}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main exported component — accepts the real API shape
export const CommentThread: React.FC<{ initialComments: ApiComment[] }> = ({
  initialComments,
}) => {
  const [newComment, setNewComment] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReply = (_parentId: string, _content: string) => {
    // TODO: wire up useCreateCommentMutation
  }

  const handleNewComment = () => {
    if (newComment.trim()) {
      // TODO: wire up useCreateCommentMutation
      setNewComment('')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* New comment input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs">
                YU
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Start a discussion..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleNewComment}
                  disabled={!newComment.trim()}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Post Comment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNewComment('')}
                  disabled={!newComment}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div className="space-y-0">
        {initialComments.map((comment, index) => (
          <Comment
            key={comment.id}
            comment={comment}
            depth={0}
            onReply={handleReply}
            isOp={index === 0}
          />
        ))}
      </div>

      {initialComments.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>No comments yet. Be the first to start the discussion!</p>
        </div>
      )}
    </div>
  )
}
