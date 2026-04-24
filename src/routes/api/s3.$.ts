/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidV4 } from 'uuid'

import { s3Client } from '#/lib/s3-client'
import { env } from '#/lib/env/client'
import {
  createStorageObjectKey,
  normalizeStorageObjectKey,
} from '#/lib/storage'

const fileUploadSchema = z.object({
  fileName: z.string().nonempty({ error: 'File name is required' }),
  contentType: z.string().nonempty({ error: 'Content type is required' }),
  size: z.coerce.number().nonnegative({ error: 'Size is required' }),
  folder: z.string().trim().nonempty({ error: 'Folder is required' }),
  isImage: z.boolean(),
})

const fileDeleteSchema = z.object({
  key: z.string().nonempty({ error: 'Key is required' }),
})

const fileReadSchema = z.object({
  key: z.string().trim().nonempty({ error: 'Key is required' }),
})

export const Route = createFileRoute('/api/s3/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        console.info(
          {
            method: request.method,
            path: new URL(request.url).pathname,
          },
          'Request received'
        )

        try {
          const url = new URL(request.url)
          const result = fileReadSchema.safeParse({
            key: url.searchParams.get('key'),
          })

          if (!result.success) {
            console.error(
              { errors: result.error.issues },
              'Invalid file read request'
            )

            return new Response(
              JSON.stringify({
                error: 'Invalid file read request, missing object key',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          const command = new GetObjectCommand({
            Bucket: env.VITE_S3_BUCKET_NAME,
            Key: normalizeStorageObjectKey(result.data.key),
          })

          const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 5,
          })

          return Response.redirect(presignedUrl, 307)
        } catch (error) {
          console.error({ error }, 'Failed to process file read request')

          return new Response(
            JSON.stringify({ error: 'Failed to process file read request' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },

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

          const { fileName, contentType, folder, size } = result.data
          const uniqueKey = createStorageObjectKey({
            folder,
            fileName,
            id: uuidV4(),
          })

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

          const key = normalizeStorageObjectKey(result.data.key)

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
