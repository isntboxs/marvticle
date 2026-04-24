import { describe, expect, it } from 'vitest'

import {
  createPostBodySchema,
  createPostFormSchema,
} from '#/schemas/posts.schema'

describe('posts.schema', () => {
  it('accepts Tigris object keys for cover images', () => {
    expect(
      createPostFormSchema.safeParse({
        title: 'Test title',
        coverImageUrl: 'posts-cover/abc-cover.png',
        content: 'Test content',
      }).success
    ).toBe(true)

    expect(
      createPostBodySchema.safeParse({
        title: 'Test title',
        coverImageUrl: 'posts-cover/abc-cover.png',
        content: 'Test content',
        status: 'PUBLISHED',
      }).success
    ).toBe(true)
  })

  it('still accepts absolute URLs for cover images', () => {
    expect(
      createPostFormSchema.safeParse({
        title: 'Test title',
        coverImageUrl: 'https://cdn.example.com/cover.png',
        content: 'Test content',
      }).success
    ).toBe(true)
  })
})
