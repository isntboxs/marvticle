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
  const publicUrl =
    typeof window !== 'undefined'
      ? import.meta.env.VITE_BUCKET_PUBLIC_URL
      : process.env.VITE_BUCKET_PUBLIC_URL

  return publicUrl.replace(/\/+$/, '')
}

const getFileExtension = ({
  contentType,
  fileName,
}: {
  contentType: AllowedImageMimeType
  fileName: string
}): string => {
  const extensionFromName = fileName
    .includes('.')
    ? fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')
    : undefined

  if (extensionFromName) {
    return extensionFromName
  }

  return MIME_TYPE_EXTENSION_MAP[contentType]
}

export function generateFileKey({
  contentType,
  folder,
  fileName,
}: {
  contentType: AllowedImageMimeType
  folder: (typeof FOLDER_NAMES)[number]
  fileName: string
}): string {
  const fileExtension = getFileExtension({ contentType, fileName })
  const uuid = uuidV4()
  const timestamp = Date.now()

  return `${folder}/${uuid}_${timestamp}.${fileExtension}`
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

  return decodeURIComponent(publicUrl.slice(keyPrefix.length))
}

export const isManagedFileKey = (fileKey: string): boolean => {
  return (
    !fileKey.includes('..') &&
    FOLDER_NAMES.some((folder) => fileKey.startsWith(`${folder}/`))
  )
}
