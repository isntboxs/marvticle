export type PostStatus = 'ARCHIVED' | 'DRAFT' | 'PUBLISHED'

type CreatePostTimestampInput = {
  status: PostStatus
  now?: Date
}

type UpdatePostTimestampInput = {
  currentStatus: PostStatus
  currentPublishedAt: Date | null
  hasContentChanges: boolean
  nextStatus?: PostStatus
  now?: Date
}

export type PostTimestampUpdateValues = {
  publishedAt?: Date | null
  updatedAt?: Date
}

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
  currentPublishedAt,
  hasContentChanges,
  nextStatus,
  now = new Date(),
}: UpdatePostTimestampInput): PostTimestampUpdateValues => {
  const resolvedStatus = nextStatus ?? currentStatus
  const statusChanged = nextStatus !== undefined && nextStatus !== currentStatus

  if (!statusChanged && !hasContentChanges) {
    return {}
  }

  if (resolvedStatus !== 'PUBLISHED') {
    return {
      publishedAt: null,
      updatedAt: now,
    }
  }

  return {
    publishedAt:
      currentStatus === 'PUBLISHED' ? (currentPublishedAt ?? now) : now,
    updatedAt: now,
  }
}
