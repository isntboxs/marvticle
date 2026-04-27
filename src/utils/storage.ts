import { v4 as uuidV4 } from 'uuid'

import { FOLDER_NAMES } from '#/schemas/file-upload.schema'

type AllowedImageMimeType =
  | 'image/gif'
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'image/webp'

const MIME_TYPE_EXTENSION_MAP: Record<AllowedImageMimeType, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const getBucketPublicUrlBase = (): string => {
  const publicUrl = import.meta.env.VITE_BUCKET_PUBLIC_URL
  if (!publicUrl) {
    throw new Error('VITE_BUCKET_PUBLIC_URL is not defined')
  }
  return publicUrl.replace(/\/+$/, '')
}

const getFileExtension = ({
  contentType,
}: {
  contentType: AllowedImageMimeType
}): string => {
  return MIME_TYPE_EXTENSION_MAP[contentType]
}

export function generateFileKey({
  contentType,
  folder,
  userId,
}: {
  contentType: AllowedImageMimeType
  folder: (typeof FOLDER_NAMES)[number]
  userId: string
}): string {
  const fileExtension = getFileExtension({ contentType })
  const uuid = uuidV4()
  const timestamp = Date.now()

  return `${folder}/${userId}/${uuid}_${timestamp}.${fileExtension}`
}

export const getPublicUrl = (fileKey: string): string => {
  return `${getBucketPublicUrlBase()}/${fileKey}`
}

export const getManagedFileKey = (value: string): string | null => {
  if (!value) {
    return null
  }

  if (isManagedFileKey(value)) {
    return value
  }

  return getFileKeyFromPublicUrl(value)
}

export const getStorageUrl = (value: string): string => {
  if (/^https?:\/\//.test(value)) {
    return value
  }

  return getPublicUrl(value)
}

export const getFileKeyFromPublicUrl = (publicUrl: string): string | null => {
  if (!publicUrl) {
    return null
  }

  const bucketPublicUrlBase = getBucketPublicUrlBase()
  const keyPrefix = `${bucketPublicUrlBase}/`

  if (!publicUrl.startsWith(keyPrefix)) {
    return null
  }

  try {
    return decodeURIComponent(publicUrl.slice(keyPrefix.length))
  } catch {
    return null
  }
}

export const isManagedFileKey = (fileKey: string): boolean => {
  if (fileKey.includes('..')) return false
  return FOLDER_NAMES.some((folder) => {
    if (!fileKey.startsWith(`${folder}/`)) return false
    const rest = fileKey.slice(folder.length + 1).split('/')
    // Expect: {userId}/{uuid}_{timestamp}.{ext}
    return (
      rest.length === 2 &&
      rest[0] &&
      rest[0].length > 0 &&
      rest[1] &&
      /^[^/]+\.[a-z0-9]+$/i.test(rest[1])
    )
  })
}

export const extractUserIdFromFileKey = (fileKey: string): string | null => {
  // Pattern: {folder}/{userId}/{uuid}_{timestamp}.{ext}
  for (const folder of FOLDER_NAMES) {
    if (fileKey.startsWith(`${folder}/`)) {
      const parts = fileKey.slice(folder.length + 1).split('/')
      if (parts.length >= 2 && parts[0]) {
        return parts[0] // userId is the first segment after folder
      }
    }
  }
  return null
}
