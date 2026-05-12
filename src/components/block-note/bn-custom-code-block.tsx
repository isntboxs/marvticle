import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  createCodeBlockConfig,
  createCodeBlockSpec,
  type CodeBlockOptions,
} from '@blocknote/core'
import {
  createReactBlockSpec,
  type ReactCustomBlockRenderProps,
} from '@blocknote/react'
import { CheckIcon, CopyIcon, TrashIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export const DEFAULT_CODE_BLOCK_LANGUAGE = 'javascript'

export const CODE_BLOCK_LANGUAGES = [
  { id: 'text', name: 'Plain Text' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
] as const

export const SUPPORTED_CODE_BLOCK_LANGUAGES = {
  text: {
    name: 'Plain Text',
    aliases: ['txt', 'plaintext', 'plain'],
  },
  javascript: {
    name: 'JavaScript',
    aliases: ['js'],
  },
  typescript: {
    name: 'TypeScript',
    aliases: ['ts'],
  },
  python: {
    name: 'Python',
    aliases: ['py'],
  },
  java: {
    name: 'Java',
  },
  c: {
    name: 'C',
  },
  cpp: {
    name: 'C++',
    aliases: ['c++'],
  },
  csharp: {
    name: 'C#',
    aliases: ['c#', 'cs'],
  },
} satisfies NonNullable<CodeBlockOptions['supportedLanguages']>

type CodeBlockRenderProps = ReactCustomBlockRenderProps<
  typeof createCodeBlockConfig
>

type EditableBlockNoteEditor = CodeBlockRenderProps['editor'] & {
  document: Array<{ id: string }>
  replaceBlocks: (
    blocksToRemove: string[],
    blocksToInsert: Array<{ type: 'paragraph' }>
  ) => unknown
}

function getInlineText(content: unknown): string {
  if (typeof content === 'string') return content

  if (Array.isArray(content)) {
    return content.map((item) => getInlineText(item)).join('')
  }

  if (!content || typeof content !== 'object') return ''

  if ('text' in content && typeof content.text === 'string') {
    return content.text
  }

  if ('content' in content) {
    return getInlineText(content.content)
  }

  return ''
}

function getLanguageName(language: string) {
  return (
    CODE_BLOCK_LANGUAGES.find((item) => item.id === language)?.name ?? language
  )
}

function CustomCodeBlock({ block, editor, contentRef }: CodeBlockRenderProps) {
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const language = block.props.language || DEFAULT_CODE_BLOCK_LANGUAGE
  const canEdit = editor.isEditable

  const languageOptions = useMemo(() => {
    if (CODE_BLOCK_LANGUAGES.some((item) => item.id === language)) {
      return CODE_BLOCK_LANGUAGES
    }

    return [{ id: language, name: language }, ...CODE_BLOCK_LANGUAGES]
  }, [language])

  const handleLanguageChange = useCallback(
    (nextLanguage: string) => {
      if (!editor.isEditable) return

      editor.updateBlock(block.id, {
        props: {
          language: nextLanguage,
        },
      })
    },
    [block.id, editor]
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getInlineText(block.content))
      setCopied(true)
      toast.success('Code copied to clipboard')

      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => {
        setCopied(false)
        copiedTimerRef.current = null
      }, 1500)
    } catch {
      toast.error('Failed to copy code')
    }
  }, [block.content])

  const handleDelete = useCallback(() => {
    if (!editor.isEditable) return

    const editorWithParagraph = editor as EditableBlockNoteEditor

    if (editorWithParagraph.document.length > 1) {
      editor.removeBlocks([block.id])
      return
    }

    editorWithParagraph.replaceBlocks([block.id], [{ type: 'paragraph' }])
  }, [block.id, editor])

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden rounded-none border bg-none">
      <div
        className="flex h-10 items-center justify-between gap-3 border-b px-2"
        contentEditable={false}
      >
        <Select
          value={language}
          onValueChange={handleLanguageChange}
          disabled={!canEdit}
        >
          <SelectTrigger
            aria-label="Code block language"
            size="sm"
            className="h-7 w-32 rounded-none border-none! bg-transparent! px-2 text-xs"
          >
            <SelectValue>
              <span className="font-semibold text-muted-foreground capitalize">
                {getLanguageName(language)}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" className="h-64 w-36 min-w-36">
            {languageOptions.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-muted-foreground"
            contentEditable={false}
            onClick={handleCopy}
          >
            {copied ? (
              <CheckIcon className="size-4" />
            ) : (
              <CopyIcon className="size-4" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 text-muted-foreground"
            contentEditable={false}
            aria-label="Delete code block"
            title="Delete code block"
            disabled={!canEdit}
            onClick={handleDelete}
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </div>

      <pre className="m-0 overflow-x-auto p-3 text-sm leading-6">
        <code
          ref={contentRef}
          className="block min-w-full font-mono whitespace-pre outline-none"
          data-language={language}
        />
      </pre>
    </div>
  )
}

function CodeBlockExternalHTML({ block, contentRef }: CodeBlockRenderProps) {
  const language = block.props.language || DEFAULT_CODE_BLOCK_LANGUAGE

  return (
    <pre>
      <code
        ref={contentRef}
        className={`language-${language}`}
        data-language={language}
      />
    </pre>
  )
}

export const BNCustomCodeBlock = createReactBlockSpec(
  createCodeBlockConfig,
  (options) => {
    const baseSpec = createCodeBlockSpec(options)

    return {
      ...baseSpec.implementation,
      render: CustomCodeBlock,
      toExternalHTML: CodeBlockExternalHTML,
    }
  },
  (options) => createCodeBlockSpec(options).extensions ?? []
)
