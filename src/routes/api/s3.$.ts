/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidV4 } from 'uuid'

import { s3Client } from '#/lib/s3-client'
import { env } from '#/lib/env/client'

const fileUploadSchema = z.object({
  fileName: z.string().nonempty({ error: 'File name is required' }),
  contentType: z.string().nonempty({ error: 'Content type is required' }),
  size: z.coerce.number().nonnegative({ error: 'Size is required' }),
  isImage: z.boolean(),
})

const fileDeleteSchema = z.object({
  key: z.string().nonempty({ error: 'Key is required' }),
})

export const Route = createFileRoute('/api/s3/$')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.info(
          {
            method: request.method,
            path: new URL(request.url).pathname,
          },
          'Request received'
        )

        try {
          const json = await request.json()

          const result = fileUploadSchema.safeParse(json)

          if (!result.success) {
            console.error(
              { errors: result.error.issues },
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

          const { fileName, contentType, size } = result.data

          const uniqueKey = `${uuidV4()}-${fileName}`

          const command = new PutObjectCommand({
            Bucket: env.VITE_S3_BUCKET_NAME,
            ContentType: contentType,
            ContentLength: size,
            Key: uniqueKey,
          })

          const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 5, // 5 minutes
          })

          const response = {
            presignedUrl,
            key: uniqueKey,
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
            JSON.stringify({ error: 'Failed to process file upload request' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },

      DELETE: async ({ request }) => {
        console.info(
          {
            method: request.method,
            path: new URL(request.url).pathname,
          },
          'Request received'
        )

        try {
          const json = await request.json()

          const result = fileDeleteSchema.safeParse(json)

          if (!result.success) {
            console.error(
              { errors: result.error.issues },
              'Invalid file delete request'
            )

            return new Response(
              JSON.stringify({
                error: 'Invalid file delete request, missing object key',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          const { key } = result.data

          const command = new DeleteObjectCommand({
            Bucket: env.VITE_S3_BUCKET_NAME,
            Key: key,
          })

          await s3Client.send(command)

          console.info({ key }, 'File delete request processed successfully')

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
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to process file delete request',
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
