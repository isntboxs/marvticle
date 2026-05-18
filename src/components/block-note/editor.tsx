import '@blocknote/core/fonts/inter.css'
import { useEffect } from 'react'

import { BlockNoteSchema } from '@blocknote/core'
import '@blocknote/shadcn/style.css'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'

import {
  BNCustomCodeBlock,
  DEFAULT_CODE_BLOCK_LANGUAGE,
  SUPPORTED_CODE_BLOCK_LANGUAGES,
} from '#/components/block-note/bn-custom-code-block'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Toggle } from '#/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import {
  CODE_BLOCK_SHIKI_THEME,
  createHighlighter,
  withFontStyleHtmlStyles,
} from '#/lib/shiki.bundle'
import { cn } from '#/lib/utils'

const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: BNCustomCodeBlock({
      indentLineWithTab: true,
      defaultLanguage: DEFAULT_CODE_BLOCK_LANGUAGE,
      supportedLanguages: SUPPORTED_CODE_BLOCK_LANGUAGES,
      createHighlighter: () =>
        createHighlighter({
          themes: [CODE_BLOCK_SHIKI_THEME],
          langs: [],
        }).then(withFontStyleHtmlStyles),
    }),
  },
})

interface Props {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  className?: string
}

export default function BlockNoteEditor({
  value,
  onChange,
  onBlur,
  className,
}: Props) {
  const editor = useCreateBlockNote({
    schema,
  })

  useEffect(() => {
    async function loadInitialContent() {
      const blocks = await editor.tryParseMarkdownToBlocks(value ?? '')
      editor.replaceBlocks(editor.document, blocks)
    }

    void loadInitialContent()
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMarkdownChange = async () => {
    const markdown = await editor.blocksToMarkdownLossy(editor.document)
    onChange?.(markdown)
  }

  return (
    <BlockNoteView
      className={cn(
        'marvticle-block-note-editor [&_.bn-editor]:rounded-none! [&_.bn-editor]:bg-transparent! [&_.bn-editor]:px-0!',
        className
      )}
      editor={editor}
      sideMenu={false}
      onBlur={onBlur}
      onChange={handleMarkdownChange}
      shadCNComponents={{
        Avatar: {
          Avatar,
          AvatarFallback,
          AvatarImage,
        },
        Badge: {
          Badge,
        },
        Button: {
          Button,
        },
        Card: {
          Card,
          CardContent,
        },
        DropdownMenu: {
          DropdownMenu,
          DropdownMenuCheckboxItem,
          DropdownMenuContent,
          DropdownMenuItem,
          DropdownMenuLabel,
          DropdownMenuSeparator,
          DropdownMenuSub,
          DropdownMenuSubContent,
          DropdownMenuSubTrigger,
          DropdownMenuTrigger,
        },
        Input: {
          Input,
        },
        Label: {
          Label,
        },
        Popover: {
          Popover,
          PopoverContent,
          PopoverTrigger,
        },
        Select: {
          Select,
          SelectContent,
          SelectItem,
          SelectTrigger,
          SelectValue,
        },
        Skeleton: {
          Skeleton,
        },
        Tabs: {
          Tabs,
          TabsContent,
          TabsList,
          TabsTrigger,
        },
        Toggle: {
          Toggle,
        },
        Tooltip: {
          Tooltip,
          TooltipContent,
          TooltipProvider,
          TooltipTrigger,
        },
      }}
    />
  )
}
