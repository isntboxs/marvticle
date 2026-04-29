import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import type { FileRejection } from 'react-dropzone'
import type { HTMLAttributes } from 'react'

import { Card, CardContent } from '#/components/ui/card'
import { cn } from '#/lib/utils'
import {
  ImageDropzoneEmptyState,
  ImageDropzoneErrorState,
  ImageDropzoneUploadedState,
  ImageDropzoneUploadingState,
} from '#/components/image-dropzone-state'
import { IMAGE_MAX_FILE_SIZE } from '#/schemas/file-upload.schema'
import { getManagedFileKey, getStorageUrl } from '#/utils/storage'

interface ManagedCoverFile {
  fileKey: string | null
  previewUrl: string
}

interface ImageDropzoneProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  value?: string
  onChange?: (value: string) => void
}

const getManagedCoverFromValue = (value?: string): ManagedCoverFile | null => {
  if (!value) {
    return null
  }

  return {
    fileKey: getManagedFileKey(value),
    previewUrl: getStorageUrl(value),
  }
}

const revokeObjectUrl = (url?: string | null) => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export const ImageDropzone = ({
  className,
  onChange,
  value,
  ...props
}: ImageDropzoneProps) => {
  const [coverFile, setCoverFile] = useState<ManagedCoverFile | null>(() =>
    getManagedCoverFromValue(value)
  )
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const prevValueRef = useRef(value)
  const uploadAbortRef = useRef<AbortController | null>(null)
  const deleteAbortRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  const deleteManagedFile = useCallback(async (fileKey: string) => {
    const abortController = new AbortController()
    deleteAbortRef.current?.abort()
    deleteAbortRef.current = abortController

    const deleteResponse = await fetch('/api/s3/cover-image', {
      method: 'DELETE',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileKey,
      }),
    })

    if (!deleteResponse.ok) {
      let deleteErrorMessage = 'Failed to delete file from storage'

      try {
        const responseBody = (await deleteResponse.json()) as {
          error?: string
        }
        deleteErrorMessage = responseBody.error ?? deleteErrorMessage
      } catch {
        // Ignore invalid JSON response bodies and fall back to generic copy.
      }

      throw new Error(deleteErrorMessage)
    }
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      const previousCoverFile = coverFile
      const temporaryPreviewUrl = URL.createObjectURL(file)

      setCoverFile({
        fileKey: previousCoverFile?.fileKey ?? null,
        previewUrl: temporaryPreviewUrl,
      })
      setPendingFile(file)
      setUploading(true)
      setProgress(0)
      setErrorMessage(null)

      try {
        const abortController = new AbortController()
        uploadAbortRef.current?.abort()
        uploadAbortRef.current = abortController

        const presignedUrlResponse = await fetch('/api/s3/cover-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            folder: 'posts/cover',
            isImage: file.type.startsWith('image/'),
          }),
        })

        if (!presignedUrlResponse.ok) {
          let uploadErrorMessage = 'Failed to get presigned url'

          try {
            const responseBody = (await presignedUrlResponse.json()) as {
              error?: string
            }
            uploadErrorMessage = responseBody.error ?? uploadErrorMessage
          } catch {
            // Ignore invalid JSON response bodies and fall back to generic copy.
          }

          throw new Error(uploadErrorMessage)
        }

        if (!isMountedRef.current) {
          revokeObjectUrl(temporaryPreviewUrl)
          return
        }

        const { fileKey, presignedUrl, publicUrl } =
          (await presignedUrlResponse.json()) as {
            fileKey: string
            presignedUrl: string
            publicUrl: string
          }

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhrRef.current = xhr

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentageComplete = (event.loaded / event.total) * 100

              setProgress(Math.round(percentageComplete))
            }
          }

          xhr.onload = () => {
            xhrRef.current = null

            if (xhr.status === 200 || xhr.status === 204) {
              resolve()
            } else {
              reject(
                new Error(
                  xhr.responseText || 'Failed to upload file to object storage'
                )
              )
            }
          }

          xhr.onerror = () => {
            xhrRef.current = null
            reject(new Error('Failed to upload file to object storage'))
          }

          xhr.onabort = () => {
            xhrRef.current = null
            reject(new Error('Upload cancelled'))
          }

          xhr.open('PUT', presignedUrl)
          xhr.setRequestHeader('Content-Type', file.type)
          xhr.send(file)
        })

        revokeObjectUrl(temporaryPreviewUrl)

        if (!isMountedRef.current) {
          revokeObjectUrl(temporaryPreviewUrl)
          return
        }

        setCoverFile({
          fileKey,
          previewUrl: publicUrl,
        })
        setPendingFile(null)
        setUploading(false)
        setProgress(100)
        setErrorMessage(null)
        onChange?.(fileKey)

        toast.success('Upload successful', {
          description: previousCoverFile
            ? 'Cover image replaced successfully'
            : 'File uploaded successfully',
        })

        if (
          previousCoverFile?.fileKey &&
          previousCoverFile.fileKey !== fileKey
        ) {
          try {
            await deleteManagedFile(previousCoverFile.fileKey)
          } catch (error) {
            toast.warning('Previous cover kept', {
              description:
                error instanceof Error
                  ? error.message
                  : 'The old cover could not be deleted automatically.',
            })
          }
        }
      } catch (error) {
        revokeObjectUrl(temporaryPreviewUrl)

        if (!isMountedRef.current) {
          revokeObjectUrl(temporaryPreviewUrl)
          return
        }

        setCoverFile(previousCoverFile ?? null)
        setPendingFile(null)
        setUploading(false)
        setProgress(0)
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to upload file'
        )

        toast.error('Upload failed', {
          description:
            error instanceof Error ? error.message : 'Failed to upload file',
        })
      }
    },
    [coverFile, deleteManagedFile, onChange]
  )

  const renderContent = () => {
    if (uploading && pendingFile) {
      return (
        <ImageDropzoneUploadingState
          file={pendingFile}
          isReplacing={Boolean(coverFile?.fileKey)}
          previewUrl={coverFile?.previewUrl}
          progress={progress}
        />
      )
    }

    if (errorMessage && !coverFile?.previewUrl) {
      return <ImageDropzoneErrorState message={errorMessage} onRetry={open} />
    }

    if (coverFile?.previewUrl) {
      return (
        <ImageDropzoneUploadedState
          isDeleting={isDeleting}
          onChange={open}
          onDelete={handleRemoveFile}
          previewUrl={coverFile.previewUrl}
        />
      )
    }

    return (
      <ImageDropzoneEmptyState isDragActive={isDragActive} onSelect={open} />
    )
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]

      if (!file) {
        return
      }

      void uploadFile(file)
    },
    [uploadFile]
  )

  const handleRemoveFile = async () => {
    if (isDeleting || uploading || !coverFile?.previewUrl) {
      return
    }

    try {
      setIsDeleting(true)
      setErrorMessage(null)

      if (coverFile.fileKey) {
        await deleteManagedFile(coverFile.fileKey)
      }

      onChange?.('')
      setCoverFile(null)
      setPendingFile(null)
      setProgress(0)
      setErrorMessage(null)

      toast.success('Delete success', {
        description: 'Cover image removed successfully',
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Error while deleting file, please try again'
      )

      toast.error('Delete failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Error while deleting file, please try again',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const rejectedFile = (fileRejection: FileRejection[]) => {
    if (fileRejection.length) {
      const hasTooManyFiles = fileRejection.some((rejection) =>
        rejection.errors.some((error) => error.code === 'too-many-files')
      )

      const hasFileTooLarge = fileRejection.some((rejection) =>
        rejection.errors.some((error) => error.code === 'file-too-large')
      )

      const hasInvalidFileType = fileRejection.some((rejection) =>
        rejection.errors.some((error) => error.code === 'file-invalid-type')
      )

      if (hasTooManyFiles) {
        toast.error('Upload failed', {
          description: 'Too many files selected, only 1 file is allowed',
        })
      }

      if (hasFileTooLarge) {
        toast.error('Upload failed', {
          description: 'File size is too big, maximum file size is 5MB',
        })
      }

      if (hasInvalidFileType) {
        toast.error('Upload failed', {
          description:
            'Unsupported file type, use PNG, JPG, JPEG, GIF, or WEBP',
        })
      }
    }
  }

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value
      setCoverFile(getManagedCoverFromValue(value))
    }
  }, [value])

  useEffect(() => {
    const currentPreviewUrl = coverFile?.previewUrl
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      uploadAbortRef.current?.abort()
      deleteAbortRef.current?.abort()
      xhrRef.current?.abort()
      revokeObjectUrl(currentPreviewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: IMAGE_MAX_FILE_SIZE,
    multiple: false,
    noClick: true,
    onDropRejected: rejectedFile,
    disabled: uploading || isDeleting,
  })

  return (
    <Card
      {...getRootProps({
        ...props,
        className: cn(
          'aspect-[2.38/1] h-64 w-full border-2 border-dashed ring-0 transition-all duration-300 ease-in-out',
          isDragActive
            ? 'border-solid border-primary bg-primary/10'
            : 'border-border hover:border-primary',
          coverFile?.previewUrl && 'border-solid',
          uploading && 'pointer-events-none',
          'overflow-hidden',
          className
        ),
      })}
    >
      <CardContent className="flex h-full w-full items-center justify-center">
        <input {...getInputProps()} />
        {renderContent()}
      </CardContent>
    </Card>
  )
}
