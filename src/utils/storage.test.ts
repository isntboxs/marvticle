import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  generateFileKey,
  getFileKeyFromPublicUrl,
  getManagedFileKey,
  getPublicUrl,
  getStorageUrl,
  isManagedFileKey,
} from '#/utils/storage'

describe('storage utilities', () => {
  const originalBucketPublicUrl = process.env.VITE_BUCKET_PUBLIC_URL

  beforeEach(() => {
    process.env.VITE_BUCKET_PUBLIC_URL = 'https://cdn.example.com/uploads/'
  })

  afterEach(() => {
    process.env.VITE_BUCKET_PUBLIC_URL = originalBucketPublicUrl
    vi.restoreAllMocks()
  })

  it('generates a managed file key with a stable extension', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_714_170_000_000)

    const fileKey = generateFileKey({
      contentType: 'image/jpeg',
      fileName: 'cover image',
      folder: 'posts/cover',
    })

    expect(fileKey).toMatch(
      /^posts\/cover\/[0-9a-f-]+_1714170000000\.jpg$/
    )
  })

  it('builds and parses the public URL for managed uploads', () => {
    const fileKey = 'posts/cover/example-file.jpg'

    expect(getPublicUrl(fileKey)).toBe(
      'https://cdn.example.com/uploads/posts/cover/example-file.jpg'
    )
    expect(
      getFileKeyFromPublicUrl(
        'https://cdn.example.com/uploads/posts/cover/example-file.jpg'
      )
    ).toBe(fileKey)
  })

  it('resolves storage values from both keys and legacy absolute URLs', () => {
    const fileKey = 'posts/cover/example-file.jpg'
    const legacyUrl = 'https://cdn.example.com/uploads/posts/cover/legacy.jpg'

    expect(getManagedFileKey(fileKey)).toBe(fileKey)
    expect(getManagedFileKey(legacyUrl)).toBe('posts/cover/legacy.jpg')
    expect(getStorageUrl(fileKey)).toBe(
      'https://cdn.example.com/uploads/posts/cover/example-file.jpg'
    )
    expect(getStorageUrl(legacyUrl)).toBe(legacyUrl)
  })

  it('rejects non-managed public URLs and invalid keys', () => {
    expect(
      getFileKeyFromPublicUrl('https://example.com/posts/cover/example-file.jpg')
    ).toBeNull()

    expect(isManagedFileKey('posts/cover/example-file.jpg')).toBe(true)
    expect(isManagedFileKey('../posts/cover/example-file.jpg')).toBe(false)
    expect(isManagedFileKey('unknown-folder/example-file.jpg')).toBe(false)
  })
})
