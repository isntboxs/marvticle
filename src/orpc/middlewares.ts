import { orpcBase } from '#/orpc'

export const orpcRequireAuthMiddleware = orpcBase.middleware(
  async ({ next, context, errors }) => {
    if (!context.auth) {
      throw errors.UNAUTHORIZED()
    }

    return next({
      context: {
        ...context,
        auth: {
          ...context.auth,
        },
      },
    })
  }
)
