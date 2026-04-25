import { z } from 'zod'

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/jpg',
] as const

export const FOLDER_NAMES = [
  'posts/cover',
  'posts/content',
  'profiles/image',
] as const

export const IMAGE_MAX_FILE_SIZE = 1024 * 1024 * 5 // 5MB

export const fileUploadSchema = z.object({
  fileName: z.string().nonempty({ error: 'File name is required' }),
  contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  size: z.coerce
    .number()
    .nonnegative({ error: 'Size is required' })
    .max(IMAGE_MAX_FILE_SIZE, {
      error: `File size must be less than ${IMAGE_MAX_FILE_SIZE / 1024 / 1024}MB`,
    }),
  folder: z.enum(FOLDER_NAMES),
  isImage: z.boolean(),
})

export const fileDeleteSchema = z.object({
  fileKey: z.string().nonempty({ error: 'File key is required' }),
})
