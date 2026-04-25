import { createFileRoute } from '@tanstack/react-router'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { authMiddleware } from '#/middlewares/auth'
import {
  fileDeleteSchema,
  fileUploadSchema,
} from '#/schemas/file-upload.schema'
import { generateFileKey, getPublicUrl } from '#/utils/storage'
import { env } from '#/lib/env/server'
import { s3Client } from '#/lib/s3-client'

export const Route = createFileRoute('/api/s3/cover-image')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      POST: async ({ request, context }) => {
        console.info(
          {
            method: request.method,
            path: new URL(request.url).pathname,
          },
          'Request received'
        )

        try {
          const { auth } = context

          if (!auth) {
            console.error('Unauthorized')

            return new Response(
              JSON.stringify({
                error: 'Unauthorized',
              }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const body = await request.json()
          const validatedBody = fileUploadSchema.safeParse(body)

          if (!validatedBody.success) {
            console.error(
              { errors: validatedBody.error.issues },
              'Invalid file upload request'
            )

            return new Response(
              JSON.stringify({
                error: 'Invalid file upload request',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          const { fileName, contentType, size, folder } = validatedBody.data
          const fileKey = generateFileKey({ folder, fileName })

          const command = new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: fileKey,
            ContentType: contentType,
            ContentLength: size,
            Metadata: {
              userId: auth.user.id,
            },
          })

          const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 5, // 5 minutes
          })

          const response = {
            fileKey,
            presignedUrl,
            publicUrl: getPublicUrl(fileKey),
          }

          console.info(
            { response },
            'File upload request processed successfully'
          )

          return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error({ error }, 'Failed to process file upload request')

          return new Response(
            JSON.stringify({
              error: 'Failed to process file upload request',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },

      DELETE: async ({ request, context }) => {
        console.info(
          {
            method: request.method,
            path: new URL(request.url).pathname,
          },
          'Request received'
        )

        try {
          const { auth } = context

          if (!auth) {
            console.error('Unauthorized')

            return new Response(
              JSON.stringify({
                error: 'Unauthorized',
              }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const body = await request.json()
          const validatedBody = fileDeleteSchema.safeParse(body)

          if (!validatedBody.success) {
            console.error(
              { errors: validatedBody.error.issues },
              'Invalid file delete request'
            )

            return new Response(
              JSON.stringify({
                error: 'Invalid file upload request',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          const { fileKey } = validatedBody.data

          const command = new DeleteObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: fileKey,
          })

          await s3Client.send(command)

          console.info(
            { fileKey },
            'File delete request processed successfully'
          )

          return new Response(
            JSON.stringify({ message: 'File deleted successfully' }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        } catch (error) {
          console.error({ error }, 'Failed to process file delete request')

          return new Response(
            JSON.stringify({
              error: 'Failed to process file delete request',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },
    },
  },
})
