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

export const getCreatePostTimestampValues = ({
  status,
  now = new Date(),
}: CreatePostTimestampInput) => {
  return {
    publishedAt: status === 'PUBLISHED' ? now : null,
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
