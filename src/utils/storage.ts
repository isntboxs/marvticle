import { v4 as uuidV4 } from 'uuid'

import type { FOLDER_NAMES } from '#/schemas/file-upload.schema'

export function generateFileKey({
  folder,
  fileName,
}: {
  folder: (typeof FOLDER_NAMES)[number]
  fileName: string
}): string {
  const fileExtension = fileName.split('.').pop()
  const uuid = uuidV4()
  const timestamp = Date.now()

  return `${folder}/${uuid}_${timestamp}.${fileExtension}`
}

export const getPublicUrl = (fileKey: string): string => {
  if (typeof window !== 'undefined') {
    return `${import.meta.env.VITE_BUCKET_PUBLIC_URL}/${fileKey}`
  }

  return `${process.env.VITE_BUCKET_PUBLIC_URL}/${fileKey}`
}
