import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { apiFetch } from '#/lib/api/api-client'
import {
  ApiClientError,
  INVALID_RESPONSE_SCHEMA,
  UNKNOWN_API_ERROR,
} from '#/lib/api/api-error'

const createJsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })

const setFetchMock = (fetchMock: typeof fetch) => {
  Object.defineProperty(globalThis, 'fetch', {
    value: fetchMock,
    writable: true,
    configurable: true,
  })
}

describe('apiFetch', () => {
  it('parses a valid success envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        message: 'Posts fetched successfully',
        data: {
          items: [],
          nextCursor: null,
          hasMore: false,
        },
      })
    )

    setFetchMock(fetchMock as typeof fetch)

    const result = await apiFetch({
      path: '/api/posts',
      schema: z.object({
        items: z.array(z.unknown()),
        nextCursor: z.string().nullable(),
        hasMore: z.boolean(),
      }),
      query: {
        limit: 10,
        cursor: undefined,
        published: true,
      },
    })

    expect(result).toEqual({
      data: {
        items: [],
        nextCursor: null,
        hasMore: false,
      },
      message: 'Posts fetched successfully',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe('/api/posts')
    expect(new URL(String(fetchMock.mock.calls[0][0])).search).toBe(
      '?limit=10&published=true'
    )
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'GET',
      credentials: 'include',
    })
  })

  it('throws ApiClientError for a valid backend error envelope', async () => {
    setFetchMock(
      vi.fn().mockResolvedValue(
        createJsonResponse(
          {
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            errors: {
              postId: 'Invalid uuid',
            },
          },
          422
        )
      )
    )

    const promise = apiFetch({
      path: '/api/engagement/comments',
      schema: z.object({ id: z.string() }),
    })

    await expect(promise).rejects.toBeInstanceOf(ApiClientError)
    await expect(promise).rejects.toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      fieldErrors: {
        postId: 'Invalid uuid',
      },
    })
  })

  it('throws INVALID_RESPONSE_SCHEMA when a success payload does not match the schema', async () => {
    setFetchMock(
      vi.fn().mockResolvedValue(
        createJsonResponse({
          success: true,
          message: 'ok',
          data: {
            count: 'three',
          },
        })
      )
    )

    const promise = apiFetch({
      path: '/api/engagement/views/count',
      schema: z.object({
        count: z.number(),
      }),
    })

    await expect(promise).rejects.toMatchObject({
      code: INVALID_RESPONSE_SCHEMA,
    })
  })

  it('throws UNKNOWN_API_ERROR for non-json error responses', async () => {
    setFetchMock(
      vi.fn().mockResolvedValue(
        new Response('upstream failure', {
          status: 502,
          statusText: 'Bad Gateway',
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      )
    )

    const promise = apiFetch({
      path: '/api/posts',
      schema: z.object({
        items: z.array(z.unknown()),
      }),
    })

    await expect(promise).rejects.toMatchObject({
      code: UNKNOWN_API_ERROR,
      message: 'Bad Gateway',
    })
  })

  it('sends credentials include and json-serializes plain object bodies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        success: true,
        message: 'created',
        data: {
          id: '4e74b8bf-6295-4af5-9964-a7ff3b7a30b4',
        },
      })
    )

    setFetchMock(fetchMock as typeof fetch)

    await apiFetch({
      path: '/api/posts',
      method: 'POST',
      schema: z.object({
        id: z.string().uuid(),
      }),
      body: {
        title: 'Hello',
      },
    })

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Hello',
      }),
    })
  })
})
