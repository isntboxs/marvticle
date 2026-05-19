import { describe, expect, it } from 'vitest'

import type { ThreadComment } from '#/features/comments/utils/comment-tree'
import { buildCommentTree } from '#/features/comments/utils/comment-tree'

const author = {
  name: 'Marv',
  username: 'marv',
  image: null,
}

const date = new Date('2026-05-14T00:00:00.000Z')

const createComment = (
  overrides: Partial<ThreadComment> & Pick<ThreadComment, 'id'>
): ThreadComment => {
  const content =
    Object.hasOwn(overrides, 'content') && overrides.content !== undefined
      ? overrides.content
      : 'Comment'

  return {
    id: overrides.id,
    threadId: overrides.threadId ?? '11111111-1111-4111-8111-111111111111',
    parentId: overrides.parentId ?? null,
    content,
    createdAt: overrides.createdAt ?? date,
    updatedAt: overrides.updatedAt ?? date,
    deletedAt: overrides.deletedAt ?? null,
    isDeleted: overrides.isDeleted ?? false,
    author: overrides.author ?? author,
  }
}

describe('buildCommentTree', () => {
  it('builds root comments and nested replies', () => {
    const tree = buildCommentTree([
      createComment({ id: 'root-1' }),
      createComment({ id: 'reply-1', parentId: 'root-1' }),
      createComment({ id: 'root-2' }),
    ])

    expect(tree).toHaveLength(2)
    expect(tree[0]?.id).toBe('root-1')
    expect(tree[0]?.replies[0]?.id).toBe('reply-1')
    expect(tree[1]?.id).toBe('root-2')
  })

  it('supports multiple reply levels', () => {
    const tree = buildCommentTree([
      createComment({ id: 'root' }),
      createComment({ id: 'reply', parentId: 'root' }),
      createComment({ id: 'nested-reply', parentId: 'reply' }),
    ])

    expect(tree[0]?.replies[0]?.replies[0]?.id).toBe('nested-reply')
  })

  it('preserves ordering from the flat input', () => {
    const tree = buildCommentTree([
      createComment({ id: 'root-1' }),
      createComment({ id: 'root-2' }),
      createComment({ id: 'reply-1', parentId: 'root-1' }),
      createComment({ id: 'reply-2', parentId: 'root-1' }),
    ])

    expect(tree.map((item) => item.id)).toEqual(['root-1', 'root-2'])
    expect(tree[0]?.replies.map((item) => item.id)).toEqual([
      'reply-1',
      'reply-2',
    ])
  })

  it('treats missing parents as roots', () => {
    const tree = buildCommentTree([
      createComment({ id: 'orphan', parentId: 'missing-parent' }),
    ])

    expect(tree).toHaveLength(1)
    expect(tree[0]?.id).toBe('orphan')
  })

  it('keeps deleted comments in the tree with their replies', () => {
    const tree = buildCommentTree([
      createComment({
        id: 'deleted-root',
        content: null,
        deletedAt: date,
        isDeleted: true,
      }),
      createComment({ id: 'reply', parentId: 'deleted-root' }),
    ])

    expect(tree[0]?.isDeleted).toBe(true)
    expect(tree[0]?.content).toBeNull()
    expect(tree[0]?.replies[0]?.id).toBe('reply')
  })
})
