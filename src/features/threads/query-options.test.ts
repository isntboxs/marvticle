import { describe, expect, it } from 'vitest'

import { DEFAULT_THREADS_LIMIT } from '#/configs'
import {
  threadDetailQueryOptions,
  threadsListInfiniteQueryOptions,
} from '#/features/threads/query-options'

describe('thread query options', () => {
  it('uses stable oRPC key for thread lists', () => {
    expect(threadsListInfiniteQueryOptions().queryKey).toEqual([
      ['threads', 'list'],
      {
        type: 'infinite',
        input: {
          limit: DEFAULT_THREADS_LIMIT,
        },
      },
    ])
  })

  it('uses stable oRPC key for thread detail', () => {
    expect(threadDetailQueryOptions({ slug: 'hello-world' }).queryKey).toEqual([
      ['threads', 'getOne'],
      {
        type: 'query',
        input: {
          slug: 'hello-world',
        },
      },
    ])
  })
})
