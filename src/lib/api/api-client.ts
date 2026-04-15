import { z } from 'zod'

import { apiErrorSchema, createApiSuccessSchema } from './api-contract'
import {
  ApiClientError,
  INVALID_RESPONSE_SCHEMA,
  UNKNOWN_API_ERROR,
} from './api-error'
import { env } from '#/lib/env'

type PrimitiveQueryValue = string | number | boolean | null | undefined

export type ApiRequestOptions<TSchema extends z.ZodTypeAny> = {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  schema: TSchema
  query?: Record<string, PrimitiveQueryValue>
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

const isJsonBody = (value: unknown) =>
  value !== undefined &&
  value !== null &&
  !(typeof FormData !== 'undefined' && value instanceof FormData) &&
  !(typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams) &&
  !(typeof Blob !== 'undefined' && value instanceof Blob)

const buildUrl = (
  path: string,
  query?: Record<string, PrimitiveQueryValue>
) => {
  // `/api/*` shares the same backend origin as Better Auth, but keeps its own
  // response contract and request helper.
  const url = new URL(path, env.VITE_SERVER_URL)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url
}

const parseJsonSafely = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return undefined

  try {
    const payload: unknown = await response.json()
    return payload
  } catch {
    return undefined
  }
}

export const apiFetch = async <TSchema extends z.ZodTypeAny>({
  path,
  method = 'GET',
  schema,
  query,
  body,
  headers,
  signal,
}: ApiRequestOptions<TSchema>): Promise<{
  data: z.infer<TSchema>
  message: string
}> => {
  const url = buildUrl(path, query)
  const hasJsonBody = isJsonBody(body)

  const response = await fetch(url, {
    method,
    credentials: 'include',
    signal,
    headers: {
      ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : hasJsonBody
          ? JSON.stringify(body)
          : (body as BodyInit),
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(payload)

    if (parsedError.success) {
      throw new ApiClientError({
        status: response.status,
        code: parsedError.data.code,
        message: parsedError.data.message,
        fieldErrors: parsedError.data.errors,
        raw: payload,
      })
    }

    throw new ApiClientError({
      status: response.status,
      code: UNKNOWN_API_ERROR,
      message: response.statusText || 'Unknown API error',
      raw: payload,
    })
  }

  const successSchema = createApiSuccessSchema(schema)
  const parsedSuccess = successSchema.safeParse(payload)

  if (!parsedSuccess.success) {
    throw new ApiClientError({
      status: response.status,
      code: INVALID_RESPONSE_SCHEMA,
      message: 'Response success schema mismatch',
      raw: payload,
    })
  }

  const parsedEnvelope = createApiSuccessSchema(z.unknown()).parse(payload)

  return {
    data: schema.parse(parsedEnvelope.data),
    message: parsedEnvelope.message,
  }
}
