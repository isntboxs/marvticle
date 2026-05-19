import { describe, expect, it } from 'vitest'

import { decodeCursor, encodeCursor } from '#/lib/cursor'

const id = '11111111-1111-4111-8111-111111111111'
const createdAt = new Date('2026-05-19T00:00:00.000Z')

describe('cursor encoding', () => {
  it('round-trips latest comment cursors', () => {
    const cursor = encodeCursor({ mode: 'latest', id, createdAt })

    expect(decodeCursor(cursor)).toEqual({ mode: 'latest', id, createdAt })
  })

  it('round-trips oldest comment cursors', () => {
    const cursor = encodeCursor({ mode: 'oldest', id, createdAt })

    expect(decodeCursor(cursor)).toEqual({ mode: 'oldest', id, createdAt })
  })

  it('round-trips top comment cursors', () => {
    const cursor = encodeCursor({ mode: 'top', id, points: 12 })

    expect(decodeCursor(cursor)).toEqual({ mode: 'top', id, points: 12 })
  })
})
