import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  extractUserIdFromFileKey,
  generateFileKey,
  getFileKeyFromPublicUrl,
  getManagedFileKey,
  getPublicUrl,
  getStorageUrl,
  isManagedFileKey,
} from '#/utils/storage'

vi.mock('#/lib/env/server', () => ({
  env: {
    VITE_BUCKET_PUBLIC_URL: 'https://cdn.example.com/uploads/',
  },
}))

describe('storage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates a managed file key with userId in path', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_714_170_000_000)

    const fileKey = generateFileKey({
      contentType: 'image/jpeg',
      folder: 'posts/cover',
      userId: 'user-123',
    })

    expect(fileKey).toMatch(
      /^posts\/cover\/user-123\/[0-9a-f-]+_1714170000000\.jpg$/
    )
  })

  it('builds and parses the public URL for managed uploads', () => {
    const fileKey = 'posts/cover/user-123/example-file.jpg'

    expect(getPublicUrl(fileKey)).toBe(
      'https://cdn.example.com/uploads/posts/cover/user-123/example-file.jpg'
    )
    expect(
      getFileKeyFromPublicUrl(
        'https://cdn.example.com/uploads/posts/cover/user-123/example-file.jpg'
      )
    ).toBe(fileKey)
  })

  it('resolves storage values from both keys and legacy absolute URLs', () => {
    const fileKey = 'posts/cover/user-123/example-file.jpg'
    const legacyUrl = 'https://cdn.example.com/uploads/posts/cover/legacy.jpg'

    expect(getManagedFileKey(fileKey)).toBe(fileKey)
    expect(getManagedFileKey(legacyUrl)).toBe('posts/cover/legacy.jpg')
    expect(getStorageUrl(fileKey)).toBe(
      'https://cdn.example.com/uploads/posts/cover/user-123/example-file.jpg'
    )
    expect(getStorageUrl(legacyUrl)).toBe(legacyUrl)
  })

  it('rejects non-managed public URLs and invalid keys', () => {
    expect(
      getFileKeyFromPublicUrl(
        'https://example.com/posts/cover/example-file.jpg'
      )
    ).toBeNull()

    expect(isManagedFileKey('posts/cover/user-123/example-file.jpg')).toBe(true)
    expect(isManagedFileKey('posts/cover/example-file.jpg')).toBe(false)
    expect(isManagedFileKey('../posts/cover/example-file.jpg')).toBe(false)
    expect(isManagedFileKey('unknown-folder/example-file.jpg')).toBe(false)
  })

  it('extracts userId from fileKey path', () => {
    expect(
      extractUserIdFromFileKey('posts/cover/user-123/uuid_1234567890.jpg')
    ).toBe('user-123')
    expect(
      extractUserIdFromFileKey('profiles/image/abc-456/uuid_1234567890.png')
    ).toBe('abc-456')
    expect(extractUserIdFromFileKey('posts/cover/invalid-key.jpg')).toBeNull()
    expect(
      extractUserIdFromFileKey('unknown-folder/user-123/file.jpg')
    ).toBeNull()
  })
})
