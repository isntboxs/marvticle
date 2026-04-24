import { formatDate, formatDistanceToNowStrict } from 'date-fns'

import { Link } from '@tanstack/react-router'
import {
  BookmarkIcon,
  ChatCircleIcon,
  ThumbsUpIcon,
} from '@phosphor-icons/react'
import { EyeIcon } from 'lucide-react'
import type { RouterOutputs } from '#/orpc/routers'
import { Button } from '#/components/ui/button'
import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import { UserAvatar } from '#/components/user-avatar'
import { getPostReadTime } from '#/lib/posts'
import { cn } from '#/lib/utils'

type Props = RouterOutputs['posts']['getMany']['items'][number]

export const PostFeedCard = (post: Props) => {
  const authorUsername = post.author.username
  const postDetailParams = {
    username: post.author.username,
    postSlug: post.slug,
  }

  return (
    <Card className={cn('gap-4 py-0', !post.coverImage && 'pt-4')}>
      {post.coverImage && (
        <AspectRatio ratio={2.38 / 1}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </AspectRatio>
      )}

      <CardHeader>
        <div className="flex h-10 items-center gap-2">
          <UserAvatar
            image={post.author.image}
            name={post.author.name}
            className="size-10"
          />

          <div className="flex h-full flex-1 flex-col justify-between">
            <p className="text-sm font-medium">@{authorUsername}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{formatDate(new Date(post.createdAt), 'MMM d')}</span>
              <span>
                (
                {formatDistanceToNowStrict(new Date(post.createdAt), {
                  addSuffix: true,
                })}
                )
              </span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pr-4 pl-16">
        <Link
          to="/$username/$postSlug"
          params={postDetailParams}
          viewTransition
          className="transition-all ease-in-out hover:text-muted-foreground"
        >
          <span className="line-clamp-2 text-2xl leading-relaxed font-bold">
            {post.title}
          </span>
        </Link>
      </CardContent>

      <CardFooter className="border-t-0 px-0 pr-4 pl-14">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ThumbsUpIcon className="size-4" />
              <span>
                {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
              </span>
            </Button>

            <Button variant="ghost" size="sm">
              <ChatCircleIcon className="size-4" />
              <span>
                {post.commentsCount}{' '}
                {post.commentsCount === 1 ? 'comment' : 'comments'}
              </span>
            </Button>

            <Button variant="ghost" size="sm">
              <EyeIcon className="size-4" />
              <span>
                {post.viewsCount} {post.viewsCount === 1 ? 'view' : 'views'}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span>{getPostReadTime(post.content)} min read</span>

            <Button variant="ghost" size="icon">
              <BookmarkIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
