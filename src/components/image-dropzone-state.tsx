import { TrashIcon } from '@phosphor-icons/react'
import { CloudUploadIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { Progress } from '#/components/ui/progress'
import { Spinner } from '#/components/ui/spinner'

export const ImageDropzoneEmptyState = ({
  isDragActive,
  onSelect,
}: {
  isDragActive: boolean
  onSelect: () => void
}) => {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center bg-muted">
        <CloudUploadIcon
          className={cn(
            'size-6 text-muted-foreground',
            isDragActive && 'text-primary'
          )}
        />
      </div>

      <p className="text-base font-semibold text-muted-foreground">
        Drop your image here or{' '}
        <span className="cursor-pointer font-bold text-primary">
          click here
        </span>
      </p>

      <Button
        type="button"
        variant="default"
        className="mt-4"
        onClick={onSelect}
      >
        Select File
      </Button>
    </div>
  )
}

export const ImageDropzoneErrorState = ({
  onSelect,
}: {
  onSelect: () => void
}) => {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center bg-destructive/30">
        <CloudUploadIcon className={cn('size-6 text-destructive')} />
      </div>

      <p className="text-base font-semibold">Upload failed</p>

      <p className="mt-1 text-xs text-muted-foreground">
        Something went wrong.
      </p>

      <Button
        type="button"
        variant="default"
        className="mt-4"
        onClick={onSelect}
      >
        Retry File Selection
      </Button>
    </div>
  )
}

export const ImageDropzoneUploadedState = ({
  previewUrl,
  isDeleting,
  onDelete,
  onReplace,
  isReplacing,
}: {
  previewUrl: string
  isDeleting: boolean
  onDelete: () => void
  onReplace: () => void
  isReplacing: boolean
}) => {
  return (
    <div className="relative h-full w-full">
      <img
        src={previewUrl}
        alt="Uploaded image"
        className="h-full w-full object-cover"
      />

      <Button
        type="button"
        variant="destructive"
        className={cn('absolute top-4 right-4')}
        disabled={isDeleting || isReplacing}
        onClick={onDelete}
        aria-label={isDeleting ? 'Deleting cover' : 'Delete cover'}
        title={isDeleting ? 'Deleting cover' : 'Delete cover'}
      >
        {isDeleting ? <Spinner /> : <TrashIcon />}
      </Button>

      <Button
        type="button"
        variant="secondary"
        className={cn('absolute top-4 left-4')}
        disabled={isDeleting || isReplacing}
        onClick={onReplace}
        aria-label={isReplacing ? 'Replacing cover' : 'Change cover'}
        title={isReplacing ? 'Replacing cover' : 'Change cover'}
      >
        {isReplacing ? <Spinner /> : 'Change cover'}
      </Button>
    </div>
  )
}

export const ImageDropzoneUploadingState = ({
  progress,
  file,
}: {
  progress: number
  file: File
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Progress value={progress} className="w-full" />
      <p className="mt-2 font-medium text-foreground">Uploading...</p>
      <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
        {file.name}
      </p>
    </div>
  )
}
