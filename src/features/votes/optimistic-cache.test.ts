import { describe, expect, it } from 'vitest'

import { getOptimisticVoteState } from '#/features/votes/optimistic-cache'

describe('getOptimisticVoteState', () => {
  it('applies a new upvote', () => {
    expect(
      getOptimisticVoteState({ points: 0, isVoted: null }, 'UPVOTE')
    ).toEqual({
      points: 1,
      isVoted: 'UPVOTE',
    })
  })

  it('applies a new downvote', () => {
    expect(
      getOptimisticVoteState({ points: 0, isVoted: null }, 'DOWNVOTE')
    ).toEqual({
      points: -1,
      isVoted: 'DOWNVOTE',
    })
  })

  it('removes a repeated upvote', () => {
    expect(
      getOptimisticVoteState({ points: 1, isVoted: 'UPVOTE' }, 'UPVOTE')
    ).toEqual({
      points: 0,
      isVoted: null,
    })
  })

  it('switches an upvote to a downvote', () => {
    expect(
      getOptimisticVoteState({ points: 1, isVoted: 'UPVOTE' }, 'DOWNVOTE')
    ).toEqual({
      points: -1,
      isVoted: 'DOWNVOTE',
    })
  })

  it('switches a downvote to an upvote', () => {
    expect(
      getOptimisticVoteState({ points: -1, isVoted: 'DOWNVOTE' }, 'UPVOTE')
    ).toEqual({
      points: 1,
      isVoted: 'UPVOTE',
    })
  })
})
