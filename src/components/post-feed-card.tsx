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

type Props = RouterOutputs['posts']['getMany']['items'][number]

export const PostFeedCard = (post: Props) => {
  return (
    <Card className="gap-4 py-0">
      {post.coverImageUrl && (
        <AspectRatio ratio={21 / 9}>
          <img
            src={post.coverImageUrl}
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
            <p className="text-sm font-medium">{post.author.username}</p>
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
          to="."
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
              <span>{post.likesCount} likes</span>
            </Button>

            <Button variant="ghost" size="sm">
              <ChatCircleIcon className="size-4" />
              <span>{post.commentsCount} comments</span>
            </Button>

            <Button variant="ghost" size="sm">
              <EyeIcon className="mr-1 size-4" />
              <span>{post.viewsCount} views</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span>{getReadTime(post.content)} min read</span>

            <Button variant="ghost" size="icon">
              <BookmarkIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

const getReadTime = (content: string) => {
  const wordsPerMinute = 200
  const words = content.split(' ').length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}
