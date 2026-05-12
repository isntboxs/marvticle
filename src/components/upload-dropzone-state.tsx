import { CameraIcon, TrashIcon, WarningIcon } from '@phosphor-icons/react'

import { Button } from '#/components/ui/button'
import { Progress } from '#/components/ui/progress'
import { Spinner } from '#/components/ui/spinner'

// ─── Empty States ─────────────────────────────────────────────────────────────

export const UploadDropzoneBannerEmpty = ({
  isDragActive,
  onSelect,
}: {
  isDragActive: boolean
  onSelect: () => void
}) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <Button
        type="button"
        variant={isDragActive ? 'default' : 'outline'}
        size="icon-lg"
        className="transition-all duration-300 ease-in-out"
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <CameraIcon className="size-6" />
      </Button>
    </div>
  )
}

export const UploadDropzoneAvatarEmpty = ({
  isDragActive,
  onSelect,
}: {
  isDragActive: boolean
  onSelect: () => void
}) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <Button
        type="button"
        variant={isDragActive ? 'default' : 'outline'}
        size="icon-lg"
        className="transition-all duration-300 ease-in-out"
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <CameraIcon className="size-6" />
      </Button>
    </div>
  )
}

// ─── Uploaded States ────────────────────────────────────────────────────────

export const UploadDropzoneBannerUploaded = ({
  previewUrl,
  isDeleting,
  onChange,
  onDelete,
}: {
  previewUrl: string
  isDeleting: boolean
  onChange: () => void
  onDelete: () => void
}) => {
  return (
    <div className="relative h-full w-full">
      <img
        src={previewUrl}
        alt="Banner preview"
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/0 opacity-0 transition-all duration-300 hover:bg-black/50 hover:opacity-100 hover:backdrop-blur-sm hover:supports-backdrop-filter:bg-black/50">
        <div className="flex h-full w-full items-center justify-center gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={(e) => {
                e.stopPropagation()
                onChange()
              }}
            >
              <CameraIcon className="size-4" />
              Change
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              {isDeleting ? (
                <Spinner className="size-4" />
              ) : (
                <TrashIcon className="size-4" />
              )}
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const UploadDropzoneAvatarUploaded = ({
  previewUrl,
  isDeleting,
  onChange,
  onDelete,
}: {
  previewUrl: string
  isDeleting: boolean
  onChange: () => void
  onDelete: () => void
}) => {
  return (
    <div className="relative h-full w-full bg-sidebar">
      <img
        src={previewUrl}
        alt="Profile photo preview"
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 ease-in-out hover:bg-black/30 hover:opacity-100 hover:backdrop-blur-sm supports-backdrop-filter:bg-black/30">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="bg-secondary/50"
            aria-label="Change avatar"
            onClick={(e) => {
              e.stopPropagation()
              onChange()
            }}
          >
            <CameraIcon className="size-4" />
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="bg-secondary/50"
            aria-label="Remove avatar"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            {isDeleting ? (
              <Spinner className="size-4" />
            ) : (
              <TrashIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Uploading States ───────────────────────────────────────────────────────

export const UploadDropzoneBannerUploading = ({
  previewUrl,
  progress,
  file,
}: {
  previewUrl?: string
  progress: number
  file: File
}) => {
  return (
    <div className="relative h-full w-full">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Uploading"
          className="h-full w-full object-cover opacity-40"
        />
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
        <Progress value={progress} className="w-full max-w-xs" />
        <p className="text-sm font-medium text-foreground">
          Uploading banner...
        </p>
        <p className="max-w-xs truncate text-xs text-muted-foreground">
          {file.name}
        </p>
      </div>
    </div>
  )
}

export const UploadDropzoneAvatarUploading = ({
  previewUrl,
  progress,
  file,
}: {
  previewUrl?: string
  progress: number
  file: File
}) => {
  return (
    <div className="relative h-full w-full">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Uploading"
          className="h-full w-full object-cover opacity-40"
        />
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <Progress value={progress} className="w-16" />
        <p className="text-xs font-medium text-foreground">{progress}%</p>
        <p className="max-w-32 truncate text-[10px] text-muted-foreground">
          {file.name}
        </p>
      </div>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

export const UploadDropzoneError = ({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/15">
        <WarningIcon className="size-5 text-destructive" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Upload failed</p>
        <p className="max-w-[16rem] text-xs text-muted-foreground">{message}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onRetry()
        }}
      >
        Try Again
      </Button>
    </div>
  )
}
