import { createFileRoute } from '@tanstack/react-router'
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { authMiddleware } from '#/middlewares/auth'
import {
  fileDeleteSchema,
  fileUploadSchema,
} from '#/schemas/file-upload.schema'
import {
  extractUserIdFromFileKey,
  generateFileKey,
  getPublicUrl,
  isManagedFileKey,
} from '#/utils/storage'
import { env } from '#/lib/env/server'
import { s3Client } from '#/lib/s3-client'

const jsonResponse = (body: Record<string, string>, status: number) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const isS3ObjectMissing = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    (error.name === 'NotFound' || error.name === 'NoSuchKey')
  )
}

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

        let body: unknown
        try {
          body = await request.json()
        } catch (error) {
          console.error({ error }, 'Failed to parse request body')
          return jsonResponse({ error: 'Invalid request body' }, 400)
        }

        try {
          const { auth } = context

          if (!auth) {
            console.error('Unauthorized')

            return jsonResponse({ error: 'Unauthorized' }, 401)
          }

          const validatedBody = fileUploadSchema.safeParse(body)

          if (!validatedBody.success) {
            console.error(
              { errors: validatedBody.error.issues },
              'Invalid file upload request'
            )

            return jsonResponse({ error: 'Invalid file upload request' }, 400)
          }

          const { contentType, size, folder } = validatedBody.data
          const fileKey = generateFileKey({
            contentType,
            folder,
            userId: auth.user.id,
          })

          const command = new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: fileKey,
            CacheControl: 'public, max-age=31536000, immutable',
            ContentType: contentType,
            ContentLength: size,
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
            { fileKey, publicUrl: response.publicUrl },
            'File upload request processed successfully'
          )

          return jsonResponse(response, 200)
        } catch (error) {
          console.error({ error }, 'Failed to process file upload request')

          return jsonResponse(
            {
              error: 'Failed to process file upload request',
            },
            500
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

        let body: unknown
        try {
          body = await request.json()
        } catch (error) {
          console.error({ error }, 'Failed to parse request body')
          return jsonResponse({ error: 'Invalid request body' }, 400)
        }

        try {
          const { auth } = context

          if (!auth) {
            console.error('Unauthorized')

            return jsonResponse({ error: 'Unauthorized' }, 401)
          }

          const validatedBody = fileDeleteSchema.safeParse(body)

          if (!validatedBody.success) {
            console.error(
              { errors: validatedBody.error.issues },
              'Invalid file delete request'
            )

            return jsonResponse({ error: 'Invalid file delete request' }, 400)
          }

          const { fileKey } = validatedBody.data

          if (!isManagedFileKey(fileKey)) {
            return jsonResponse({ error: 'Invalid file key' }, 400)
          }

          // Extract owner from fileKey path: {folder}/{userId}/{uuid}_{timestamp}.{ext}
          const ownerId = extractUserIdFromFileKey(fileKey)

          if (!ownerId) {
            return jsonResponse({ error: 'Invalid file key format' }, 400)
          }

          if (ownerId !== auth.user.id) {
            console.error(
              { fileKey, ownerId, requesterId: auth.user.id },
              'Attempted to delete another user file'
            )
            return jsonResponse({ error: 'Forbidden' }, 403)
          }

          // Verify file exists before deleting
          try {
            await s3Client.send(
              new HeadObjectCommand({
                Bucket: env.AWS_BUCKET_NAME,
                Key: fileKey,
              })
            )
          } catch (error) {
            if (isS3ObjectMissing(error)) {
              return jsonResponse({ error: 'File not found' }, 404)
            }
            throw error
          }

          const command = new DeleteObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: fileKey,
          })

          await s3Client.send(command)

          console.info(
            { fileKey },
            'File delete request processed successfully'
          )

          return jsonResponse({ message: 'File deleted successfully' }, 200)
        } catch (error) {
          console.error({ error }, 'Failed to process file delete request')

          return jsonResponse(
            {
              error: 'Failed to process file delete request',
            },
            500
          )
        }
      },
    },
  },
})
