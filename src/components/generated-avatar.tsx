import { useMemo } from 'react'

import {
  botttsNeutral,
  initials,
  notionistsNeutral,
} from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { cn } from '#/lib/utils'

interface Props {
  seed: string
  className?: string
  style: 'botttsNeutral' | 'initials' | 'notionistsNeutral'
}

export const GeneratedAvatar = ({ seed, style, className }: Props) => {
  const avatar = useMemo(() => {
    const avatarVariants = {
      botttsNeutral: () => createAvatar(botttsNeutral, { seed }),
      initials: () => createAvatar(initials, { seed }),
      notionistsNeutral: () => createAvatar(notionistsNeutral, { seed }),
    }

    return avatarVariants[style]()
  }, [seed, style])

  const avatarUri = useMemo(() => avatar.toDataUri(), [avatar])

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatarUri} alt={seed} className={cn(className)} />
      <AvatarFallback className={cn('uppercase', className)}>
        {Array.from(seed)[0] ?? '?'}
      </AvatarFallback>
    </Avatar>
  )
}
