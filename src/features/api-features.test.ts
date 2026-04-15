import { describe, expect, it, vi } from 'vitest'

import { createComment, trackView } from '#/features/engagement/engagement.api'
import { createPost } from '#/features/posts/posts.api'
import { queryKeys } from '#/lib/api/query-keys'

const setFetchMock = (fetchMock: typeof fetch) => {
  Object.defineProperty(globalThis, 'fetch', {
    value: fetchMock,
    writable: true,
    configurable: true,
  })
}

describe('feature api modules', () => {
  it('validates createPost payloads before sending a request', async () => {
    const fetchMock = vi.fn()
    setFetchMock(fetchMock as typeof fetch)

    await expect(
      createPost({
        title: '',
        slug: '',
        content: '',
        coverImage: null,
        published: true,
      })
    ).rejects.toThrow()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('validates engagement mutation payloads before sending a request', async () => {
    const fetchMock = vi.fn()
    setFetchMock(fetchMock as typeof fetch)

    await expect(
      createComment({
        postId: 'not-a-uuid',
        content: '',
      })
    ).rejects.toThrow()

    await expect(
      trackView({
        postId: 'still-not-a-uuid',
      })
    ).rejects.toThrow()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps posts infinite query keys stable and cursor-free', () => {
    expect(queryKeys.posts.list({ limit: 10 })).toEqual([
      'posts',
      'list',
      { limit: 10 },
    ])
    expect(queryKeys.posts.detail('post-1')).toEqual(['posts', 'detail', 'post-1'])
    expect(queryKeys.engagement.commentsCount('post-1')).toEqual([
      'engagement',
      'comments-count',
      'post-1',
    ])
  })
})
