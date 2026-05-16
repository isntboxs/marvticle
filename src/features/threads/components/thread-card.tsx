import { DotsThreeIcon } from '@phosphor-icons/react'
import { formatDistanceToNowStrict } from 'date-fns'
import {
  ArrowBigDownIcon,
  ArrowBigUpIcon,
  MessagesSquareIcon,
  VerifiedIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { UserAvatar } from '#/components/user-avatar'
import type { VoteDirectionType } from '#/db/schemas'
import { useToggleVoteMutation } from '#/features/votes/hooks/use-votes'
import { parseMarkdownToWords } from '#/lib/parse-markdown'
import { cn } from '#/lib/utils'
import type { RouterOutputs } from '#/orpc/routers'

type ThreadCardProps = RouterOutputs['threads']['getMany']['items'][number]

export const ThreadCard = (thread: ThreadCardProps) => {
  const voteMutation = useToggleVoteMutation()

  const handleVote = (direction: VoteDirectionType) => {
    voteMutation.mutate({ slug: thread.slug, direction })
  }

  return (
    <Card className="gap-0 p-0 ring-0">
      <CardHeader className="gap-2 p-0! [.border-b]:pb-0!">
        <div className="flex items-center justify-between gap-2">
          <UserAvatar
            name={thread.author.username}
            image={thread.author.image}
          />

          <div className="flex-1">
            <div className="flex items-center -space-y-0.5 font-heading text-sm font-semibold">
              <span className="max-w-[15ch] truncate">
                {thread.author.name}
              </span>

              {!!thread.author.verified && (
                <VerifiedIcon className="ml-1 size-4 fill-sky-500 text-sidebar" />
              )}

              <Separator className="mx-1 mt-0.5 rounded-full data-horizontal:size-1" />

              <span className="mt-1 text-xs font-normal text-muted-foreground">
                {formatDistanceToNowStrict(new Date(thread.createdAt))}
              </span>
            </div>

            <p className="max-w-[15ch] truncate text-xs font-medium tracking-wide text-muted-foreground">
              @{thread.author.username}
            </p>
          </div>

          <Button size="icon" variant="ghost">
            <DotsThreeIcon className="size-4" />
          </Button>
        </div>

        <CardTitle className="line-clamp-2 text-lg font-semibold text-balance">
          {thread.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="mb-4 line-clamp-2 p-0! text-base font-normal text-muted-foreground">
        {parseMarkdownToWords(thread.content)}
      </CardContent>

      <CardFooter className="w-full gap-4 border-0 p-0!">
        <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-1 items-center gap-2">
          <Button
            type="button"
            aria-label="Upvote thread"
            aria-pressed={thread.userVote === 'UPVOTE'}
            onClick={() => handleVote('UPVOTE')}
            size="icon-sm"
            variant="ghost"
          >
            <motion.span
              animate={
                thread.userVote === 'UPVOTE'
                  ? { scale: [1, 1.5, 0.9, 1.1, 1], rotate: [0, -10, 8, -4, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ArrowBigUpIcon
                className={cn(
                  'size-4 transition-colors duration-300',
                  thread.userVote === 'UPVOTE'
                    ? 'fill-primary text-primary'
                    : 'fill-none'
                )}
              />
            </motion.span>
          </Button>

          <div className="relative flex h-5 w-6 items-center justify-center overflow-hidden tabular-nums">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={thread.voteScore}
                initial={{
                  y: thread.userVote === 'UPVOTE' ? 10 : -10,
                  opacity: 0,
                }}
                animate={{ y: 0, opacity: 1 }}
                exit={{
                  y: thread.userVote === 'UPVOTE' ? -10 : 10,
                  opacity: 0,
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute text-sm"
              >
                {thread.voteScore}
              </motion.span>
            </AnimatePresence>
          </div>

          <Button
            type="button"
            aria-label="Downvote thread"
            aria-pressed={thread.userVote === 'DOWNVOTE'}
            onClick={() => handleVote('DOWNVOTE')}
            size="icon-sm"
            variant="ghost"
          >
            <motion.span
              animate={
                thread.userVote === 'DOWNVOTE'
                  ? { scale: [1, 1.5, 0.9, 1.1, 1], rotate: [0, 10, -8, 4, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ArrowBigDownIcon
                className={cn(
                  'size-4 transition-colors duration-300',
                  thread.userVote === 'DOWNVOTE'
                    ? 'fill-primary text-primary'
                    : 'fill-none'
                )}
              />
            </motion.span>
          </Button>
        </div>

        <Button variant="ghost" size="sm">
          <MessagesSquareIcon />

          <span>0</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
