import '@blocknote/core/fonts/inter.css'
import { BlockNoteSchema } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/shadcn/style.css'
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
import { createHighlighter } from '#/lib/shiki.bundle'

const schema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: BNCustomCodeBlock({
      indentLineWithTab: true,
      defaultLanguage: DEFAULT_CODE_BLOCK_LANGUAGE,
      supportedLanguages: SUPPORTED_CODE_BLOCK_LANGUAGES,
      createHighlighter: () =>
        createHighlighter({
          themes: ['one-dark-pro'],
          langs: [],
        }),
    }),
  },
})

export default function BlockNoteEditor() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: 'codeBlock',
        props: {
          language: DEFAULT_CODE_BLOCK_LANGUAGE,
        },
        content: [
          {
            type: 'text',
            text: 'console.log(1)',
            styles: {},
          },
        ],
      },
    ],
  })

  // Renders the editor instance using a React component.
  return (
    <BlockNoteView
      className="[&_.bn-editor]:rounded-none! [&_.bn-editor]:bg-transparent!"
      editor={editor}
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
