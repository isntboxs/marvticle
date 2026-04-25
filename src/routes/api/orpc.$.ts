import { createFileRoute } from '@tanstack/react-router'
import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { onError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { SmartCoercionPlugin } from '@orpc/json-schema'
import { orpcRouters } from '#/orpc/routers'
import { postSchema, postsPageSchema } from '#/schemas/posts.schema'
import { CreateORPCContext } from '#/orpc'

const rpcHandler = new RPCHandler(orpcRouters, {
  interceptors: [
    onError((error) => {
      console.error({ err: error }, 'RPC handler error')
    }),
  ],
})

const apiHandler = new OpenAPIHandler(orpcRouters, {
  interceptors: [
    onError((error) => {
      console.error({ err: error }, 'OpenAPI handler error')
    }),
  ],

  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'MARVTICLE ORPC Reference',
          version: '1.0.0',
          description: 'API Reference for MARVTICLE',
        },
        commonSchemas: {
          Post: { schema: postSchema },
          PostsPage: { schema: postsPageSchema },
          UndefinedError: { error: 'UndefinedError' },
        },
        security: [{ apiKeyCookie: [] }],
        components: {
          securitySchemes: {
            apiKeyCookie: {
              type: 'apiKey',
              in: 'cookie',
              name: 'better-auth.session_token',
              description: 'Better Auth session cookie authentication',
            },
          },
        },
      },
    }),
  ],
})

const createContext = async (req: Request) => {
  return CreateORPCContext({ headers: req.headers })
}

async function handle({ request }: { request: Request }) {
  console.info(
    { method: request.method, path: new URL(request.url).pathname },
    'Request received'
  )
  const context = await createContext(request)

  const rpcResult = await rpcHandler.handle(request, {
    prefix: '/api/orpc',
    context,
  })
  if (rpcResult.response) return rpcResult.response

  const apiResult = await apiHandler.handle(request, {
    prefix: '/api/orpc/reference',
    context,
  })
  if (apiResult.response) return apiResult.response

  return new Response('Not found', { status: 404 })
}

export const Route = createFileRoute('/api/orpc/$')({
  server: {
    handlers: {
      ANY: handle,
    },
  },
})
