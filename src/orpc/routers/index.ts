import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from '@orpc/server'

import { orpcBase } from '#/orpc'
import { postsRouter } from '#/orpc/routers/posts.router'
import { usersRouter } from '#/orpc/routers/users.router'

export const orpcRouters = orpcBase.router({
  posts: postsRouter,
  users: usersRouter,
})

export type ORPCRouterClient = RouterClient<typeof orpcRouters>

export type RouterInputs = InferRouterInputs<typeof orpcRouters>
export type RouterOutputs = InferRouterOutputs<typeof orpcRouters>
