import { describe, expect, it } from 'vitest'

import {
  getCreatePostTimestampValues,
  getUpdatePostTimestampValues,
  shouldShowPostUpdatedAt,
} from '#/lib/post-timestamps'

describe('post timestamp helpers', () => {
  it('creates drafts without a published timestamp', () => {
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(getCreatePostTimestampValues({ status: 'DRAFT', now })).toEqual({
      publishedAt: null,
      updatedAt: now,
    })
  })

  it('creates published posts with a published timestamp', () => {
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(getCreatePostTimestampValues({ status: 'PUBLISHED', now })).toEqual({
      publishedAt: now,
      updatedAt: now,
    })
  })

  it('publishes a draft with a fresh published timestamp', () => {
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'DRAFT',
        nextStatus: 'PUBLISHED',
        now,
      })
    ).toEqual({
      publishedAt: now,
    })
  })

  it('does not patch timestamps when editing a published post', () => {
    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'PUBLISHED',
      })
    ).toEqual({})
  })

  it('archives a published post by clearing the published timestamp', () => {
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'PUBLISHED',
        nextStatus: 'ARCHIVED',
        now,
      })
    ).toEqual({
      publishedAt: null,
    })
  })

  it('republishes an archived post with a new published timestamp', () => {
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'ARCHIVED',
        nextStatus: 'PUBLISHED',
        now,
      })
    ).toEqual({
      publishedAt: now,
    })
  })

  it('does not return a timestamp patch for status-only no-op updates', () => {
    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'PUBLISHED',
        nextStatus: 'PUBLISHED',
      })
    ).toEqual({})
  })

  it('does not treat direct publish insert timestamp drift as an update', () => {
    const publishedAt = new Date('2026-04-30T10:00:00.000Z')
    const updatedAt = new Date('2026-04-30T10:00:00.004Z')

    expect(shouldShowPostUpdatedAt({ publishedAt, updatedAt })).toBe(false)
  })
})
