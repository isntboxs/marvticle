import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from '@orpc/server'

import { orpcBase } from '#/orpc'
// import { commentsRouter } from '#/orpc/routers/comments.router'
import { threadsRouter } from '#/orpc/routers/threads.routers'
import { getMeHandler, usersRouter } from '#/orpc/routers/users.router'

export const orpcRouters = orpcBase.router({
  users: usersRouter,
  threads: threadsRouter,
  // comments: commentsRouter,
  me: getMeHandler,
})

export type ORPCRouterClient = RouterClient<typeof orpcRouters>

export type RouterInputs = InferRouterInputs<typeof orpcRouters>
export type RouterOutputs = InferRouterOutputs<typeof orpcRouters>
