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
  if (!image) {
    return (
      <GeneratedAvatar
        seed={name}
        style="notionistsNeutral"
        className={cn('size-8 rounded-none after:border-none', className)}
      />
    )
  }

  return (
    <Avatar className={cn('size-8 rounded-none after:border-none', className)}>
      <AvatarImage src={image} alt={name} className="rounded-none" />
      <AvatarFallback
        className={cn('size-8 rounded-none uppercase', className)}
      >
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}
