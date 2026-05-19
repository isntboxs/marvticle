import { describe, expect, it } from 'vitest'

import { DEFAULT_COMMENTS_LIMIT } from '#/configs'
import {
  commentRepliesInfiniteQueryOptions,
  threadCommentsInfiniteQueryOptions,
} from '#/features/comments/query-options'

describe('comment query options', () => {
  it('uses stable oRPC key for thread comments', () => {
    expect(
      threadCommentsInfiniteQueryOptions({ threadSlug: 'hello-world' }).queryKey
    ).toEqual([
      ['comments', 'list'],
      {
        type: 'infinite',
        input: {
          threadSlug: 'hello-world',
          limit: DEFAULT_COMMENTS_LIMIT,
        },
      },
    ])
  })

  it('uses stable oRPC key for comment replies', () => {
    expect(
      commentRepliesInfiniteQueryOptions({
        parentId: '22222222-2222-4222-8222-222222222222',
      }).queryKey
    ).toEqual([
      ['comments', 'listReplies'],
      {
        type: 'infinite',
        input: {
          parentId: '22222222-2222-4222-8222-222222222222',
          limit: DEFAULT_COMMENTS_LIMIT,
        },
      },
    ])
  })
})
