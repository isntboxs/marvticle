import { describe, expect, it } from 'vitest'

import {
  getCreatePostTimestampValues,
  getUpdatePostTimestampValues,
} from '#/lib/post-timestamps'

describe('post timestamp helpers', () => {
  it('creates drafts without a published timestamp', () => {
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(getCreatePostTimestampValues({ status: 'DRAFT', now })).toEqual({
      publishedAt: null,
      updatedAt: now,
    })
  })

  it('creates published posts with matching published and updated timestamps', () => {
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
        currentPublishedAt: null,
        hasContentChanges: false,
        nextStatus: 'PUBLISHED',
        now,
      })
    ).toEqual({
      publishedAt: now,
      updatedAt: now,
    })
  })

  it('edits a published post without changing the published timestamp', () => {
    const publishedAt = new Date('2026-04-29T10:00:00.000Z')
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'PUBLISHED',
        currentPublishedAt: publishedAt,
        hasContentChanges: true,
        now,
      })
    ).toEqual({
      publishedAt,
      updatedAt: now,
    })
  })

  it('archives a published post by clearing the published timestamp', () => {
    const publishedAt = new Date('2026-04-29T10:00:00.000Z')
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'PUBLISHED',
        currentPublishedAt: publishedAt,
        hasContentChanges: false,
        nextStatus: 'ARCHIVED',
        now,
      })
    ).toEqual({
      publishedAt: null,
      updatedAt: now,
    })
  })

  it('republishes an archived post with a new published timestamp', () => {
    const now = new Date('2026-04-30T10:00:00.000Z')

    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'ARCHIVED',
        currentPublishedAt: null,
        hasContentChanges: false,
        nextStatus: 'PUBLISHED',
        now,
      })
    ).toEqual({
      publishedAt: now,
      updatedAt: now,
    })
  })

  it('does not return a timestamp patch for status-only no-op updates', () => {
    expect(
      getUpdatePostTimestampValues({
        currentStatus: 'PUBLISHED',
        currentPublishedAt: new Date('2026-04-29T10:00:00.000Z'),
        hasContentChanges: false,
        nextStatus: 'PUBLISHED',
      })
    ).toEqual({})
  })
})
