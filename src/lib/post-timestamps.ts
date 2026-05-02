export type PostStatus = 'ARCHIVED' | 'DRAFT' | 'PUBLISHED'

type CreatePostTimestampInput = {
  status: PostStatus
  now?: Date
}

type UpdatePostTimestampInput = {
  currentStatus: PostStatus
  nextStatus?: PostStatus
  now?: Date
}

export type PostTimestampUpdateValues = {
  publishedAt?: Date | null
}

type ShouldShowPostUpdatedAtInput = {
  publishedAt: Date | null
  updatedAt: Date
}

const MIN_VISIBLE_UPDATE_DELAY_MS = 1_000

export const getCreatePostTimestampValues = ({
  status,
  now = new Date(),
}: CreatePostTimestampInput) => {
  return {
    publishedAt: status === 'PUBLISHED' ? now : null,
    updatedAt: now,
  }
}

export const getUpdatePostTimestampValues = ({
  currentStatus,
  nextStatus,
  now = new Date(),
}: UpdatePostTimestampInput): PostTimestampUpdateValues => {
  const statusChanged = nextStatus !== undefined && nextStatus !== currentStatus

  if (!statusChanged) {
    return {}
  }

  if (nextStatus !== 'PUBLISHED') {
    return {
      publishedAt: null,
    }
  }

  return {
    publishedAt: now,
  }
}

export const shouldShowPostUpdatedAt = ({
  publishedAt,
  updatedAt,
}: ShouldShowPostUpdatedAtInput) => {
  if (!publishedAt) {
    return false
  }

  return (
    updatedAt.getTime() - publishedAt.getTime() >= MIN_VISIBLE_UPDATE_DELAY_MS
  )
}
