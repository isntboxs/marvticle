import { CodeBlockIcon } from '@phosphor-icons/react'
import {
  BoldIcon,
  CodeIcon,
  HeadingIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
} from 'lucide-react'
import type { ComponentType } from 'react'

import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

export type MarkdownMenuAction =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'bullet-list'
  | 'ordered-list'
  | 'quote'
  | 'link'
  | 'image'
  | 'horizontal-rule'
  | 'inline-code'
  | 'code-block'

type MarkdownMenuBarProps = {
  disabled?: boolean
  onAction: (action: MarkdownMenuAction) => void
}

const actions: Array<{
  action: MarkdownMenuAction
  icon: ComponentType<{ className?: string }>
  label: string
}> = [
  { action: 'bold', icon: BoldIcon, label: 'Bold' },
  { action: 'italic', icon: ItalicIcon, label: 'Italic' },
  { action: 'heading', icon: HeadingIcon, label: 'Heading' },
  { action: 'bullet-list', icon: ListIcon, label: 'Bullet List' },
  { action: 'ordered-list', icon: ListOrderedIcon, label: 'Ordered List' },
  { action: 'quote', icon: QuoteIcon, label: 'Quote' },
  { action: 'link', icon: LinkIcon, label: 'Link' },
  { action: 'image', icon: ImageIcon, label: 'Image' },
  {
    action: 'horizontal-rule',
    icon: MinusIcon,
    label: 'Horizontal Rule',
  },
  { action: 'inline-code', icon: CodeIcon, label: 'Inline Code' },
  { action: 'code-block', icon: CodeBlockIcon, label: 'Code Block' },
]

export const MarkdownMenuBar = ({
  disabled = false,
  onAction,
}: MarkdownMenuBarProps) => {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-1">
        {actions.map(({ action, icon: Icon, label }) => (
          <Tooltip key={action}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={label}
                disabled={disabled}
                onClick={() => onAction(action)}
              >
                <Icon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
