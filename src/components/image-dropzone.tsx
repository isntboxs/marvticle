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

interface ImageDropzoneState {
  id: string | null
  file: File | null
  uploading: boolean
  progress: number
  key?: string
  isDeleting: boolean
  error: boolean
  objectUrl?: string
  fileType: 'image' | 'video'
}

interface ImageDropzoneProps {
  value?: string
  onChange?: (value: string) => void
}

export const ImageDropzone = ({ onChange, value }: ImageDropzoneProps) => {
  const [fileState, setFileState] = useState<ImageDropzoneState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: 'image',
    key: value,
  })

  const uploadFile = useCallback(
    async (file: File) => {
      setFileState((prev) => ({
        ...prev,
        uploading: true,
        progress: 0,
      }))

      try {
        // 1. get presigned url from api
        const presignedUrlResponse = await fetch('/api/s3/cover-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            folder: 'posts/cover',
            isImage: file.type.startsWith('image/'),
          }),
        })

        if (!presignedUrlResponse.ok) {
          toast.error('Upload failed', {
            description: 'Failed to get presigned url',
          })

          setFileState((prev) => ({
            ...prev,
            uploading: false,
            progress: 0,
            error: true,
          }))

          return
        }

        const { presignedUrl, fileKey } =
          (await presignedUrlResponse.json()) as {
            presignedUrl: string
            fileKey: string
          }

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
                key: fileKey,
              }))

              onChange?.(fileKey)

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
      } catch (error) {
        toast.error('Upload failed', {
          description:
            error instanceof Error ? error.message : 'Failed to upload file',
        })

        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }))
      }
    },
    [onChange]
  )

  const renderContent = () => {
    if (fileState.uploading) {
      return (
        <ImageDropzoneUploadingState
          progress={fileState.progress}
          file={fileState.file!}
        />
      )
    }

    if (fileState.error) {
      return <ImageDropzoneErrorState />
    }

    if (fileState.objectUrl) {
      return (
        <ImageDropzoneUploadedState
          previewUrl={fileState.objectUrl}
          isDeleting={fileState.isDeleting}
          onDelete={handleRemoveFile}
        />
      )
    }

    return <ImageDropzoneEmptyState isDragActive={isDragActive} />
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]

        if (!file) return

        if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
          URL.revokeObjectURL(fileState.objectUrl)
        }

        setFileState({
          file: file,
          uploading: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          error: false,
          id: uuidV4(),
          isDeleting: false,
          fileType: 'image',
        })

        void uploadFile(file)
      }
    },
    [fileState.objectUrl, uploadFile]
  )

  const handleRemoveFile = async () => {
    if (fileState.isDeleting || !fileState.objectUrl) return

    try {
      setFileState((prev) => ({ ...prev, isDeleting: true }))

      const deleteResponse = await fetch('/api/s3/cover-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: fileState.key,
        }),
      })

      if (!deleteResponse.ok) {
        toast.error('Delete failed', {
          description: 'Failed to delete file from storage',
        })

        setFileState((prev) => ({ ...prev, isDeleting: false, error: true }))

        return
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
        URL.revokeObjectURL(fileState.objectUrl)
      }

      onChange?.('')

      setFileState((prev) => ({
        ...prev,
        file: null,
        uploading: false,
        progress: 0,
        objectUrl: undefined,
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
    return () => {
      if (fileState.objectUrl && !fileState.objectUrl.startsWith('http')) {
        URL.revokeObjectURL(fileState.objectUrl)
      }
    }
  }, [fileState.objectUrl])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 1024 * 1024 * 5, // 5MB
    onDropRejected: rejectedFile,
    disabled: fileState.uploading || !!fileState.objectUrl,
  })

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'aspect-[2.38/1] h-64 w-full border-2 border-dashed ring-0 transition-all duration-300 ease-in-out',
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
