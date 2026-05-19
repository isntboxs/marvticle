import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import {
  applyCommentVoteResult,
  applyOptimisticCommentVote,
  applyOptimisticThreadVote,
  applyThreadVoteResult,
  cancelCommentVoteQueries,
  cancelThreadVoteQueries,
  invalidateCommentVoteQueries,
  invalidateThreadVoteQueries,
  restoreCommentVoteSnapshot,
  restoreThreadVoteSnapshot,
  snapshotCommentVoteQueries,
  snapshotThreadVoteQueries,
} from '#/features/votes/optimistic-cache'
import { orpc } from '#/orpc/client'

export const useToggleThreadVoteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.threads.vote.mutationOptions({
      onMutate: async ({ direction, slug }) => {
        await cancelThreadVoteQueries(queryClient, slug)

        const snapshot = snapshotThreadVoteQueries(queryClient, slug)
        applyOptimisticThreadVote(queryClient, slug, direction)
        return { snapshot }
      },
      onError: (error, _input, context) => {
        toast.error('Failed to vote', {
          description: error.message,
        })

        if (context?.snapshot) {
          restoreThreadVoteSnapshot(queryClient, context.snapshot)
        }
      },
      onSuccess: (result, variables) => {
        applyThreadVoteResult(queryClient, variables.slug, result)

        toast.success('Thread voted', {
          description: 'Your vote has been cast.',
        })
      },
      onSettled: (_result, _error, variables) => {
        invalidateThreadVoteQueries(queryClient, variables.slug)
      },
    })
  )
}

export const useToggleVoteMutation = useToggleThreadVoteMutation

export const useToggleCommentVoteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    orpc.comments.vote.mutationOptions({
      onMutate: async ({ direction, id }) => {
        await cancelCommentVoteQueries(queryClient, id)

        const snapshot = snapshotCommentVoteQueries(queryClient)
        applyOptimisticCommentVote(queryClient, id, direction)
        return { snapshot }
      },
      onError: (error, _input, context) => {
        toast.error('Failed to vote', {
          description: error.message,
        })

        if (context?.snapshot) {
          restoreCommentVoteSnapshot(queryClient, context.snapshot)
        }
      },
      onSuccess: (result, variables) => {
        applyCommentVoteResult(queryClient, variables.id, result)

        toast.success('Comment voted', {
          description: 'Your vote has been cast.',
        })
      },
      onSettled: () => {
        invalidateCommentVoteQueries(queryClient)
      },
    })
  )
}
