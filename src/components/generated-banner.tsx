import { useMemo } from 'react'

import { glass } from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'

import { cn } from '#/lib/utils'

interface Props {
  seed: string
  className?: string
}

export const GeneratedBanner = ({ seed, className }: Props) => {
  const banner = useMemo(() => {
    const bannerVariants = {
      glass: () => createAvatar(glass, { seed }),
    }

    return bannerVariants.glass()
  }, [seed])

  const bannerUri = useMemo(() => banner.toDataUri(), [banner])

  return (
    <img
      src={bannerUri}
      alt={`Banner for ${seed}`}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
