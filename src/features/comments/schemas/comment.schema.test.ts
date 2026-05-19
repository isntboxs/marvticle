import { describe, expect, it } from 'vitest'

import { COMMENT_CONTENT_MAX_LENGTH } from '#/configs'
import {
  commentCreateReplySchema,
  commentCreateRootSchema,
  commentContentSchema,
} from '#/features/comments/schemas/comment.schema'

const threadSlug = 'root-thread'
const parentId = '22222222-2222-4222-8222-222222222222'

describe('comment schemas', () => {
  it('rejects empty comment content', () => {
    expect(commentContentSchema.safeParse('   ').success).toBe(false)
  })

  it('rejects content above the maximum length', () => {
    expect(
      commentContentSchema.safeParse('a'.repeat(COMMENT_CONTENT_MAX_LENGTH + 1))
        .success
    ).toBe(false)
  })

  it('accepts create input without a parent comment', () => {
    expect(
      commentCreateRootSchema.safeParse({
        threadSlug,
        content: 'Root comment',
      }).success
    ).toBe(true)
  })

  it('accepts create input with a parent comment', () => {
    expect(
      commentCreateReplySchema.safeParse({
        parentId,
        content: 'Reply comment',
      }).success
    ).toBe(true)
  })
})
