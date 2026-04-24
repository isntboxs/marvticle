/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { v4 as uuidV4 } from 'uuid'
import type { FileRejection } from 'react-dropzone'

import { Card, CardContent } from '#/components/ui/card'
import { cn } from '#/lib/utils'
import {
  ImageDropzoneEmptyState,
  ImageDropzoneErrorState,
  ImageDropzoneUploadedState,
  ImageDropzoneUploadingState,
} from '#/components/image-dropzone-state'
import {
  getStorageObjectUrl,
  isStorageObjectKey,
  normalizeStorageObjectKey,
} from '#/lib/storage'

interface ImageDropzoneState {
  id: string | null
  file: File | null
  uploading: boolean
  progress: number
  isDeleting: boolean
  error: boolean
  fileType: 'image' | 'video'
}

interface ImageDropzoneProps {
  value?: string
  onChange?: (value: string) => void
  folder: string
  onUploadingChange?: (uploading: boolean) => void
}

export const ImageDropzone = ({
  value,
  onChange,
  folder,
  onUploadingChange,
}: ImageDropzoneProps) => {
  const [fileState, setFileState] = useState<ImageDropzoneState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: 'image',
  })

  const derivedKey = value ? normalizeStorageObjectKey(value) : ''
  const derivedObjectUrl = derivedKey ? getStorageObjectUrl(derivedKey) ?? undefined : undefined

  const deleteObject = useCallback(async (key: string) => {
    const deleteResponse = await fetch('/api/s3', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
      }),
    })

    if (!deleteResponse.ok) {
      throw new Error('Failed to delete file from storage')
    }
  }, [])

  const uploadFile = useCallback(
    async (
      file: File,
      previousState?: { key?: string; objectUrl?: string }
    ) => {
      const previousKey = previousState?.key
      const previousObjectUrl = previousState?.objectUrl

      setFileState((prev) => ({
        ...prev,
        uploading: true,
        progress: 0,
        error: false,
      }))

      try {
        const presignedUrlResponse = await fetch('/api/s3', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            folder,
            isImage: file.type.startsWith('image/'),
          }),
        })

        if (!presignedUrlResponse.ok) {
          throw new Error('Failed to get presigned url')
        }

        const { presignedUrl, key } = await presignedUrlResponse.json()
        const normalizedKey = normalizeStorageObjectKey(key)

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentageComplete = (event.loaded / event.total) * 100

              setFileState((prev) => ({
                ...prev,
                progress: Math.round(percentageComplete),
              }))
            }
          }

          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 204) {
              setFileState((prev) => ({
                ...prev,
                uploading: false,
                progress: 100,
              }))

              onChange?.(normalizedKey)

              toast.success('Upload successful', {
                description: 'File uploaded successfully',
              })

              resolve()
            } else {
              reject(new Error('Failed to upload file'))
            }
          }

          xhr.onerror = () => {
            reject(new Error('Failed to upload file'))
          }

          xhr.open('PUT', presignedUrl)
          xhr.setRequestHeader('Content-Type', file.type)
          xhr.send(file)
        })

        if (
          previousKey &&
          previousKey !== normalizedKey &&
          isStorageObjectKey(previousKey)
        ) {
          await deleteObject(previousKey)
        }

        if (
          previousObjectUrl &&
          previousObjectUrl !== getStorageObjectUrl(previousKey) &&
          !previousObjectUrl.startsWith('http')
        ) {
          URL.revokeObjectURL(previousObjectUrl)
        }
      } catch (error) {
        toast.error('Upload failed', {
          description:
            error instanceof Error ? error.message : 'Failed to upload file',
        })

        setFileState((prev) => {
          return {
            ...prev,
            uploading: false,
            progress: 0,
            error: previousKey || previousObjectUrl ? false : true,
          }
        })
      }
    },
    [deleteObject, folder, onChange]
  )

  const renderContent = () => {
    if (fileState.uploading) {
      if (!fileState.file) {
        return <ImageDropzoneErrorState onSelect={open} />
      }

      return (
        <ImageDropzoneUploadingState
          progress={fileState.progress}
          file={fileState.file}
        />
      )
    }

    if (fileState.error) {
      return <ImageDropzoneErrorState onSelect={open} />
    }

    if (derivedObjectUrl) {
      return (
        <ImageDropzoneUploadedState
          previewUrl={derivedObjectUrl}
          isDeleting={fileState.isDeleting}
          isReplacing={fileState.uploading}
          onDelete={handleRemoveFile}
          onReplace={open}
        />
      )
    }

    return (
      <ImageDropzoneEmptyState isDragActive={isDragActive} onSelect={open} />
    )
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]

        if (!file) return

        const previousState = {
          key: derivedKey,
          objectUrl: derivedObjectUrl,
        }

        setFileState({
          file: file,
          uploading: false,
          progress: 0,
          error: false,
          id: uuidV4(),
          isDeleting: false,
          fileType: 'image',
        })

        void uploadFile(file, previousState)
      }
    },
    [derivedKey, derivedObjectUrl, uploadFile]
  )

  const handleRemoveFile = async () => {
    if (fileState.isDeleting || !derivedObjectUrl) return

    try {
      setFileState((prev) => ({ ...prev, isDeleting: true }))

      if (derivedKey && isStorageObjectKey(derivedKey)) {
        await deleteObject(derivedKey)
      }

      if (derivedObjectUrl && !derivedObjectUrl.startsWith('http')) {
        URL.revokeObjectURL(derivedObjectUrl)
      }

      onChange?.('')

      setFileState((prev) => ({
        ...prev,
        file: null,
        uploading: false,
        progress: 0,
        error: false,
        fileType: 'image',
        id: null,
        isDeleting: false,
      }))

      toast.success('Delete success', {
        description: 'File deleted from storage successfully',
      })
    } catch (error) {
      toast.error('Delete failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Error while deleting file, please try again',
      })

      setFileState((prev) => ({ ...prev, isDeleting: false, error: true }))
    }
  }

  const rejectedFile = (fileRejection: FileRejection[]) => {
    if (fileRejection.length) {
      const toManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0]?.code === 'too-many-files'
      )

      const fileSizeTooBig = fileRejection.find(
        (rejection) => rejection.errors[0]?.code === 'file-too-large'
      )

      if (toManyFiles) {
        toast.error('Upload failed', {
          description: 'Too many files selected, only 1 file is allowed',
        })
      }

      if (fileSizeTooBig) {
        toast.error('Upload failed', {
          description: 'File size is too big, maximum file size is 5MB',
        })
      }
    }
  }

  useEffect(() => {
    onUploadingChange?.(fileState.uploading)
  }, [fileState.uploading, onUploadingChange])

  useEffect(() => {
    return () => {
      if (derivedObjectUrl && !derivedObjectUrl.startsWith('http')) {
        URL.revokeObjectURL(derivedObjectUrl)
      }
    }
  }, [derivedObjectUrl])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 1024 * 1024 * 5, // 5MB
    onDropRejected: rejectedFile,
    disabled: fileState.uploading || fileState.isDeleting,
    noClick: true,
  })

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'relative aspect-[2.38/1] h-64 border-2 border-dashed border-border ring-0 transition-all duration-500 ease-in-out',
        isDragActive
          ? 'border-solid border-primary bg-primary/10'
          : 'border-border hover:border-primary'
      )}
    >
      <CardContent className="flex h-full w-full items-center justify-center">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  )
}
