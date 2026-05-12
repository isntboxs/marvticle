import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from '@orpc/server'

import { orpcBase } from '#/orpc'
import { usersRouter } from '#/orpc/routers/users.router'

export const orpcRouters = orpcBase.router({
  users: usersRouter,
})

export type ORPCRouterClient = RouterClient<typeof orpcRouters>

export type RouterInputs = InferRouterInputs<typeof orpcRouters>
export type RouterOutputs = InferRouterOutputs<typeof orpcRouters>
