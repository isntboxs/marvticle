import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { GeneratedAvatar } from '#/components/generated-avatar'
import { cn } from '#/lib/utils'

export const UserAvatar = ({
  image,
  name,
  className,
}: {
  image?: string | null
  name: string
  className?: string
}) => {
  const displayName = name?.trim() || 'User'

  if (!image) {
    return (
      <GeneratedAvatar
        seed={displayName}
        style="notionistsNeutral"
        className={cn('size-8 rounded-none after:border-none', className)}
      />
    )
  }

  return (
    <Avatar className={cn('size-8 rounded-none after:border-none', className)}>
      <AvatarImage src={image} alt={displayName} className="rounded-none" />
      <AvatarFallback
        className={cn('size-8 rounded-none uppercase', className)}
      >
        {displayName.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}
