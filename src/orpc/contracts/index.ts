// import { commentsContract } from '#/orpc/contracts/comments.contract'
import { threadsContract } from '#/orpc/contracts/threads.contract'
import { getMeContract, usersContract } from '#/orpc/contracts/users.contract'

export const orpcContracts = {
  users: usersContract,
  threads: threadsContract,
  // comments: commentsContract,
  me: getMeContract,
}
