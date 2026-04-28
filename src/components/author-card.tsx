import { formatDate } from 'date-fns'
import {
  BadgeCheckIcon,
  Building2Icon,
  CalendarIcon,
  MapPinIcon,
  School2Icon,
} from 'lucide-react'

import type { RouterOutputs } from '#/orpc/routers'
import { GeneratedBanner } from '#/components/generated-banner'
import { AspectRatio } from '#/components/ui/aspect-ratio'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { Skeleton } from '#/components/ui/skeleton'
import { UserAvatar } from '#/components/user-avatar'

interface AuthorCardProps {
  author: RouterOutputs['users']['getAuthorByUsername']
  onFollow?: () => void
  isFollowing?: boolean
}

interface AuthorCardFallbackProps {
  author: RouterOutputs['posts']['getMany']['items'][number]['author']
  onFollow?: () => void
  isFollowing?: boolean
}

export function AuthorCard({
  author,
  onFollow,
  isFollowing = false,
}: Readonly<AuthorCardProps>) {
  return (
    <Card className="relative overflow-hidden py-0">
      <AspectRatio ratio={17 / 6}>
        {author.banner ? (
          <img
            src={author.banner}
            alt={`${author.name}'s banner`}
            className="h-full w-full object-cover"
          />
        ) : (
          <GeneratedBanner seed={author.username} />
        )}
      </AspectRatio>

      <CardHeader className="relative">
        <div className="absolute -top-10 left-4 after:absolute after:inset-0 after:outline-6 after:outline-card after:content-['']">
          <UserAvatar
            name={author.name}
            image={author.image}
            className="size-12"
          />
        </div>

        <div className="mt-6 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="max-w-[20ch] truncate text-base font-semibold">
                {author.name}
              </span>
              {author.verified ? (
                <BadgeCheckIcon className="size-4 fill-blue-500 text-blue-500" />
              ) : null}
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>@{author.username}</span>
              {author.pronouns ? (
                <>
                  <Separator
                    orientation="vertical"
                    className="rounded-full data-vertical:h-1 data-vertical:w-1 data-vertical:self-center"
                  />
                  <span>{author.pronouns}</span>
                </>
              ) : null}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onFollow}>
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>

        {author.bio ? (
          <CardDescription className="mt-2 text-sm text-primary">
            {author.bio}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="mb-6 grid grid-cols-1 place-items-start gap-4">
        {author.location ? (
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-4" />
            <span className="text-xs text-muted-foreground">
              {author.location}
            </span>
          </div>
        ) : null}

        {author.education ? (
          <div className="flex items-center gap-2">
            <School2Icon className="size-4" />
            <span className="text-xs text-muted-foreground">
              {author.education}
            </span>
          </div>
        ) : null}

        {author.work ? (
          <div className="flex items-center gap-2">
            <Building2Icon className="size-4" />
            <span className="text-xs text-muted-foreground">{author.work}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          <span className="text-xs text-muted-foreground">
            Joined at {formatDate(new Date(author.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AuthorCardFallback({
  author,
  onFollow,
  isFollowing = false,
}: Readonly<AuthorCardFallbackProps>) {
  return (
    <Card className="relative overflow-hidden py-0">
      <AspectRatio ratio={17 / 6}>
        <GeneratedBanner seed={author.username} />
      </AspectRatio>

      <CardHeader className="relative">
        <div className="absolute -top-10 left-4 after:absolute after:inset-0 after:outline-6 after:outline-card">
          <UserAvatar
            name={author.name}
            image={author.image}
            className="size-12"
          />
        </div>

        <div className="mt-6 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <span className="max-w-[20ch] truncate text-base font-semibold">
              {author.name}
            </span>
            <div className="text-xs text-muted-foreground">
              @{author.username}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onFollow}>
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>

        <CardDescription className="mt-2 text-sm text-muted-foreground">
          Profile details are not available right now.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

export function AuthorCardSkeleton() {
  return (
    <Card className="relative overflow-hidden py-0">
      <Skeleton className="aspect-17/6 w-full" />

      <CardHeader className="relative">
        <Skeleton className="absolute -top-10 left-4 size-12 rounded-full" />
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>

        <Skeleton className="mt-4 h-16 w-full" />
      </CardHeader>

      <CardContent className="mb-6 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}
