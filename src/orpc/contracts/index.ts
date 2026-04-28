import { postsContract } from '#/orpc/contracts/posts.contract'
import { usersContract } from '#/orpc/contracts/users.contract'

export const orpcContracts = {
  posts: postsContract,
  users: usersContract,
}
