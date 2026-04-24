import { describe, expect, it } from 'vitest'

import {
  POSTS_COVER_FOLDER,
  createStorageObjectKey,
  getStorageObjectUrl,
  sanitizeStorageFileName,
} from '#/lib/storage'

describe('storage helpers', () => {
  it('creates object keys under the requested folder', () => {
    expect(
      createStorageObjectKey({
        folder: POSTS_COVER_FOLDER,
        fileName: 'hero cover?.png',
        id: '123',
      })
    ).toBe('posts-cover/123-hero-cover.png')
  })

  it('sanitizes file names before they are used as keys', () => {
    expect(sanitizeStorageFileName('../my photo!!.webp')).toBe('my-photo.webp')
  })

  it('resolves storage keys through the local image endpoint', () => {
    expect(getStorageObjectUrl('posts-cover/123-cover.png')).toBe(
      'https://cdn.marvagency.net/posts-cover/123-cover.png'
    )
  })

  it('keeps absolute URLs unchanged', () => {
    expect(getStorageObjectUrl('https://cdn.example.com/cover.png')).toBe(
      'https://cdn.example.com/cover.png'
    )
  })
})
