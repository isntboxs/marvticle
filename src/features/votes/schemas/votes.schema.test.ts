import { describe, expect, it } from 'vitest'

import {
  voteCommentThreadOutputSchema,
  voteThreadOutputSchema,
} from '#/features/votes/schemas/votes.schema'

describe('vote schemas', () => {
  it('accepts canonical thread vote output', () => {
    expect(
      voteThreadOutputSchema.safeParse({
        action: 'VOTED',
        points: 1,
        isVoted: 'UPVOTE',
      }).success
    ).toBe(true)
  })

  it('accepts canonical comment vote output', () => {
    expect(
      voteCommentThreadOutputSchema.safeParse({
        action: 'UNVOTED',
        points: 0,
        isVoted: null,
      }).success
    ).toBe(true)
  })
})
