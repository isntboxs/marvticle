import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  CheckIcon,
  CopyIcon,
  FacebookLogoIcon,
  LinkedinLogoIcon,
  RedditLogoIcon,
  TelegramLogoIcon,
  WhatsappLogoIcon,
  XLogoIcon,
} from '@phosphor-icons/react'
import { MailPlusIcon } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Label } from '#/components/ui/label'

interface PostShareDialogProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  postTitle: string
  authorUsername: string
}

export const PostShareDialog = ({
  open,
  setOpen,
  postTitle,
  authorUsername,
}: PostShareDialogProps) => {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fullUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `"${postTitle}" by @${authorUsername}`

  const SHARE_LINKS = useMemo(
    () => ({
      x: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + fullUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`,
      reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(postTitle)}`,
      email: `mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(shareText + '\n\n' + fullUrl)}`,
    }),
    [fullUrl, postTitle, shareText]
  )

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setIsCopied(true)

      toast.success('Link copied to clipboard!', {
        description: `The link has been copied to your clipboard.`,
      })

      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => {
        setIsCopied(false)
        copyTimerRef.current = null
      }, 3000)
    } catch (error) {
      toast.error('Failed to copy link', {
        description: `Failed to copy the link to the clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }, [fullUrl])

  const handleShareOnPlatform = useCallback((platformUrl: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer')
  }, [])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2">
          <div className="grid w-full flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Share this post
            </Label>

            <InputGroup>
              <InputGroupInput id="link" defaultValue={fullUrl} readOnly />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Copy"
                  title="Copy"
                  size="icon-xs"
                  className="w-full"
                  onClick={handleCopyLink}
                >
                  {isCopied ? <CheckIcon /> : <CopyIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleShareOnPlatform(SHARE_LINKS.facebook)}
          >
            <FacebookLogoIcon className="size-5" />
            Share on Facebook
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleShareOnPlatform(SHARE_LINKS.x)}
          >
            <XLogoIcon />
            Share on X
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleShareOnPlatform(SHARE_LINKS.linkedin)}
          >
            <LinkedinLogoIcon />
            Share on LinkedIn
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleShareOnPlatform(SHARE_LINKS.whatsapp)}
          >
            <WhatsappLogoIcon />
            Share on Whatsapp
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleShareOnPlatform(SHARE_LINKS.telegram)}
          >
            <TelegramLogoIcon />
            Share on Telegram
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleShareOnPlatform(SHARE_LINKS.reddit)}
          >
            <RedditLogoIcon />
            Share on Reddit
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => handleShareOnPlatform(SHARE_LINKS.email)}
          >
            <MailPlusIcon />
            Share on Email
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
