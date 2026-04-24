const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i
const STORAGE_PUBLIC_BASE_URL =
  typeof import.meta !== 'undefined'
    ? (import.meta.env.VITE_S3_PUBLIC_BASE_URL as string | undefined)
    : undefined

export const POSTS_COVER_FOLDER = 'posts-cover'

export const isAbsoluteUrl = (value: string) => {
  return ABSOLUTE_URL_PATTERN.test(value)
}

export const normalizeStorageObjectKey = (value: string) => {
  return value.trim().replace(/\\/g, '/').replace(/^\/+/, '')
}

export const isStorageObjectKey = (value: string) => {
  const normalizedValue = normalizeStorageObjectKey(value)

  return normalizedValue !== '' && !isAbsoluteUrl(normalizedValue)
}

export const sanitizeStorageFileName = (fileName: string) => {
  const baseName = fileName.split(/[\\/]/).pop()?.trim() ?? 'file'
  const sanitizedName = baseName
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._-]/g, '')
    .replace(/-+/g, '-')

  return sanitizedName === '' ? 'file' : sanitizedName
}

export const createStorageObjectKey = ({
  folder,
  fileName,
  id,
}: {
  folder: string
  fileName: string
  id: string
}) => {
  const normalizedFolder = normalizeStorageObjectKey(folder).replace(/\/+$/, '')

  return `${normalizedFolder}/${id}-${sanitizeStorageFileName(fileName)}`
}

export const getStorageObjectUrl = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const normalizedValue = normalizeStorageObjectKey(value)

  if (normalizedValue === '') {
    return null
  }

  if (isAbsoluteUrl(normalizedValue)) {
    return normalizedValue
  }

  if (STORAGE_PUBLIC_BASE_URL) {
    return `${STORAGE_PUBLIC_BASE_URL.replace(/\/+$/, '')}/${normalizedValue}`
  }

  return `/api/s3?key=${encodeURIComponent(normalizedValue)}`
}
