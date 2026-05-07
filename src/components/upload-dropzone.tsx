import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import type { FileRejection } from 'react-dropzone'
import type { HTMLAttributes } from 'react'

import { cn } from '#/lib/utils'
import {
  UploadDropzoneAvatarEmpty,
  UploadDropzoneAvatarUploaded,
  UploadDropzoneAvatarUploading,
  UploadDropzoneBannerEmpty,
  UploadDropzoneBannerUploaded,
  UploadDropzoneBannerUploading,
  UploadDropzoneError,
} from '#/components/upload-dropzone-state'
import { IMAGE_MAX_FILE_SIZE } from '#/schemas/file-upload.schema'
import { getManagedFileKey, getStorageUrl } from '#/utils/storage'

interface ManagedFile {
  fileKey: string | null
  previewUrl: string
}

interface UploadDropzoneProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  value?: string
  onChange?: (value: string) => void
  variant: 'banner' | 'avatar'
  folder?: string
  label?: string
}

const getManagedFileFromValue = (value?: string): ManagedFile | null => {
  if (!value) return null
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

export const UploadDropzone = ({
  className,
  onChange,
  value,
  variant,
  folder = 'profiles/image',
  label,
  ...props
}: UploadDropzoneProps) => {
  const [managedFile, setManagedFile] = useState<ManagedFile | null>(() =>
    getManagedFileFromValue(value)
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
  const isMountedRef = useRef<boolean>(true)

  const apiEndpoint = '/api/s3/cover-image'

  const deleteManagedFile = useCallback(
    async (fileKey: string) => {
      const abortController = new AbortController()
      deleteAbortRef.current?.abort()
      deleteAbortRef.current = abortController

      const deleteResponse = await fetch(apiEndpoint, {
        method: 'DELETE',
        signal: abortController.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey }),
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
    },
    [apiEndpoint]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      const previousFile = managedFile
      const temporaryPreviewUrl = URL.createObjectURL(file)

      setManagedFile({
        fileKey: previousFile?.fileKey ?? null,
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

        const presignedUrlResponse = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            folder,
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

        setManagedFile({ fileKey, previewUrl: publicUrl })
        setPendingFile(null)
        setUploading(false)
        setProgress(100)
        setErrorMessage(null)
        onChange?.(fileKey)

        toast.success('Upload successful', {
          description: previousFile
            ? 'Image replaced successfully'
            : 'File uploaded successfully',
        })

        if (previousFile?.fileKey && previousFile.fileKey !== fileKey) {
          try {
            await deleteManagedFile(previousFile.fileKey)
          } catch (error) {
            toast.warning('Previous file kept', {
              description:
                error instanceof Error
                  ? error.message
                  : 'The old file could not be deleted automatically.',
            })
          }
        }
      } catch (error) {
        revokeObjectUrl(temporaryPreviewUrl)

        if (!isMountedRef.current) {
          revokeObjectUrl(temporaryPreviewUrl)
          return
        }

        setManagedFile(previousFile ?? null)
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
    [managedFile, deleteManagedFile, onChange, folder, apiEndpoint]
  )

  const handleRemoveFile = async () => {
    if (isDeleting || uploading || !managedFile?.previewUrl) return

    try {
      setIsDeleting(true)
      setErrorMessage(null)

      if (managedFile.fileKey) {
        await deleteManagedFile(managedFile.fileKey)
      }

      onChange?.('')
      setManagedFile(null)
      setPendingFile(null)
      setProgress(0)
      setErrorMessage(null)

      toast.success('Removed successfully', {
        description: 'Image has been removed.',
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

  const renderContent = () => {
    if (uploading && pendingFile) {
      if (variant === 'avatar') {
        return (
          <UploadDropzoneAvatarUploading
            file={pendingFile}
            previewUrl={managedFile?.previewUrl}
            progress={progress}
          />
        )
      }
      return (
        <UploadDropzoneBannerUploading
          file={pendingFile}
          previewUrl={managedFile?.previewUrl}
          progress={progress}
        />
      )
    }

    if (errorMessage && !managedFile?.previewUrl) {
      return <UploadDropzoneError message={errorMessage} onRetry={open} />
    }

    if (managedFile?.previewUrl) {
      if (variant === 'avatar') {
        return (
          <UploadDropzoneAvatarUploaded
            isDeleting={isDeleting}
            onChange={open}
            onDelete={handleRemoveFile}
            previewUrl={managedFile.previewUrl}
          />
        )
      }
      return (
        <UploadDropzoneBannerUploaded
          isDeleting={isDeleting}
          onChange={open}
          onDelete={handleRemoveFile}
          previewUrl={managedFile.previewUrl}
        />
      )
    }

    if (variant === 'avatar') {
      return (
        <UploadDropzoneAvatarEmpty
          isDragActive={isDragActive}
          onSelect={open}
        />
      )
    }
    return (
      <UploadDropzoneBannerEmpty isDragActive={isDragActive} onSelect={open} />
    )
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      void uploadFile(file)
    },
    [uploadFile]
  )

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
      setManagedFile(getManagedFileFromValue(value))
    }
  }, [value])

  useEffect(() => {
    const currentPreviewUrl = managedFile?.previewUrl
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

  const isBanner = variant === 'banner'

  return (
    <div
      {...getRootProps({
        ...props,
        className: cn(
          'relative overflow-hidden border border-dashed ring-0 transition-all duration-300 ease-in-out',
          isBanner ? 'aspect-[3/1] w-full' : 'size-28',
          isDragActive
            ? 'border-solid border-primary bg-primary/10'
            : 'border-border hover:border-primary/60',
          managedFile?.previewUrl && 'border-solid',
          uploading && 'pointer-events-none',
          className
        ),
        'aria-label': label,
      })}
    >
      <input {...getInputProps()} />
      {renderContent()}
    </div>
  )
}
