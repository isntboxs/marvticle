import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { math } from '@streamdown/math'
import { mermaid } from '@streamdown/mermaid'
import 'katex/dist/katex.min.css'
import { EyeIcon, PencilIcon, SplitIcon } from 'lucide-react'
import { Streamdown } from 'streamdown'
import type { ComponentProps, ComponentType } from 'react'

import type { MarkdownMenuAction } from '#/components/markdown-menu-bar'
import { MarkdownMenuBar } from '#/components/markdown-menu-bar'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'

type MarkdownEditorProps = ComponentProps<'textarea'>

type EditorSelection = {
  end: number
  start: number
  value: string
}

type EditorTransformResult = {
  nextValue: string
  selectionEnd: number
  selectionStart: number
}

type EditorMode = 'write' | 'split' | 'preview'

const streamdownPlugins = {
  cjk,
  code,
  math,
  mermaid,
}

const modeOptions: Array<{
  icon: ComponentType<{ className?: string }>
  label: string
  value: EditorMode
}> = [
  { value: 'write', label: 'Write', icon: PencilIcon },
  { value: 'split', label: 'Split', icon: SplitIcon },
  { value: 'preview', label: 'Preview', icon: EyeIcon },
]

const orderedListPattern = /^\d+\.\s/

const getLineRange = (value: string, start: number, end: number) => {
  const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1
  const nextLineBreak = value.indexOf('\n', end)
  const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak

  return { lineEnd, lineStart }
}

const replaceRange = ({
  end,
  nextSelectionEnd,
  nextSelectionStart,
  replacement,
  start,
  value,
}: {
  end: number
  nextSelectionEnd: number
  nextSelectionStart: number
  replacement: string
  start: number
  value: string
}): EditorTransformResult => {
  return {
    nextValue: `${value.slice(0, start)}${replacement}${value.slice(end)}`,
    selectionStart: nextSelectionStart,
    selectionEnd: nextSelectionEnd,
  }
}

const wrapSelection = (
  selection: EditorSelection,
  {
    after,
    before,
    placeholder,
  }: {
    after?: string
    before: string
    placeholder: string
  }
): EditorTransformResult => {
  const trailing = after ?? before
  const hasSelection = selection.start !== selection.end
  const content = hasSelection
    ? selection.value.slice(selection.start, selection.end)
    : placeholder
  const replacement = `${before}${content}${trailing}`

  return replaceRange({
    value: selection.value,
    start: selection.start,
    end: selection.end,
    replacement,
    nextSelectionStart: selection.start + before.length,
    nextSelectionEnd: selection.start + before.length + content.length,
  })
}

const toggleHeading = (selection: EditorSelection): EditorTransformResult => {
  const { lineEnd, lineStart } = getLineRange(
    selection.value,
    selection.start,
    selection.end
  )
  const currentLine = selection.value.slice(lineStart, lineEnd)

  if (!currentLine.trim()) {
    const replacement = '## Heading'

    return replaceRange({
      value: selection.value,
      start: lineStart,
      end: lineEnd,
      replacement,
      nextSelectionStart: lineStart + 3,
      nextSelectionEnd: lineStart + replacement.length,
    })
  }

  const strippedLine = currentLine.replace(/^#{1,6}\s+/, '')
  const replacement =
    currentLine.startsWith('## ') && strippedLine !== currentLine
      ? strippedLine
      : `## ${strippedLine}`

  return replaceRange({
    value: selection.value,
    start: lineStart,
    end: lineEnd,
    replacement,
    nextSelectionStart: lineStart,
    nextSelectionEnd: lineStart + replacement.length,
  })
}

const togglePrefixedLines = (
  selection: EditorSelection,
  {
    placeholder,
    prefix,
  }: {
    placeholder: string
    prefix: string
  }
): EditorTransformResult => {
  const { lineEnd, lineStart } = getLineRange(
    selection.value,
    selection.start,
    selection.end
  )
  const block = selection.value.slice(lineStart, lineEnd)
  const lines = block.split('\n')

  if (selection.start === selection.end && lines.length === 1 && !lines[0]?.trim()) {
    const replacement = `${prefix}${placeholder}`

    return replaceRange({
      value: selection.value,
      start: lineStart,
      end: lineEnd,
      replacement,
      nextSelectionStart: lineStart + prefix.length,
      nextSelectionEnd: lineStart + replacement.length,
    })
  }

  const allPrefixed = lines.every((line) => line.startsWith(prefix))
  const nextBlock = allPrefixed
    ? lines.map((line) => line.slice(prefix.length)).join('\n')
    : lines.map((line) => (line.length === 0 ? prefix : `${prefix}${line}`)).join('\n')

  return replaceRange({
    value: selection.value,
    start: lineStart,
    end: lineEnd,
    replacement: nextBlock,
    nextSelectionStart: lineStart,
    nextSelectionEnd: lineStart + nextBlock.length,
  })
}

const toggleOrderedList = (selection: EditorSelection): EditorTransformResult => {
  const { lineEnd, lineStart } = getLineRange(
    selection.value,
    selection.start,
    selection.end
  )
  const block = selection.value.slice(lineStart, lineEnd)
  const lines = block.split('\n')

  if (selection.start === selection.end && lines.length === 1 && !lines[0]?.trim()) {
    const replacement = '1. List item'

    return replaceRange({
      value: selection.value,
      start: lineStart,
      end: lineEnd,
      replacement,
      nextSelectionStart: lineStart + 3,
      nextSelectionEnd: lineStart + replacement.length,
    })
  }

  const allOrdered = lines.every((line) => orderedListPattern.test(line))
  const nextBlock = allOrdered
    ? lines.map((line) => line.replace(orderedListPattern, '')).join('\n')
    : lines
        .map((line, index) =>
          line.length === 0 ? `${index + 1}. ` : `${index + 1}. ${line}`
        )
        .join('\n')

  return replaceRange({
    value: selection.value,
    start: lineStart,
    end: lineEnd,
    replacement: nextBlock,
    nextSelectionStart: lineStart,
    nextSelectionEnd: lineStart + nextBlock.length,
  })
}

const insertHorizontalRule = (
  selection: EditorSelection
): EditorTransformResult => {
  const needsLeadingSpacing =
    selection.start > 0 && !selection.value.slice(0, selection.start).endsWith('\n\n')
  const needsTrailingSpacing =
    selection.end < selection.value.length &&
    !selection.value.slice(selection.end).startsWith('\n\n')
  const replacement = `${needsLeadingSpacing ? '\n\n' : ''}---${
    needsTrailingSpacing ? '\n\n' : ''
  }`
  const caretPosition = selection.start + replacement.length

  return replaceRange({
    value: selection.value,
    start: selection.start,
    end: selection.end,
    replacement,
    nextSelectionStart: caretPosition,
    nextSelectionEnd: caretPosition,
  })
}

const insertLink = (
  selection: EditorSelection
): EditorTransformResult | null => {
  const href = window.prompt('Enter the link URL', 'https://')

  if (href === null) {
    return null
  }

  const label =
    selection.start !== selection.end
      ? selection.value.slice(selection.start, selection.end)
      : 'link text'
  const replacement = `[${label}](${href.trim() === '' ? 'https://' : href})`

  return replaceRange({
    value: selection.value,
    start: selection.start,
    end: selection.end,
    replacement,
    nextSelectionStart: selection.start + 1,
    nextSelectionEnd: selection.start + 1 + label.length,
  })
}

const insertImage = (
  selection: EditorSelection
): EditorTransformResult | null => {
  const src = window.prompt('Enter the image URL', 'https://')

  if (src === null) {
    return null
  }

  const alt =
    selection.start !== selection.end
      ? selection.value.slice(selection.start, selection.end)
      : 'image description'
  const replacement = `![${alt}](${src.trim() === '' ? 'https://' : src})`

  return replaceRange({
    value: selection.value,
    start: selection.start,
    end: selection.end,
    replacement,
    nextSelectionStart: selection.start + 2,
    nextSelectionEnd: selection.start + 2 + alt.length,
  })
}

const toggleCodeBlock = (selection: EditorSelection): EditorTransformResult => {
  const hasSelection = selection.start !== selection.end
  const content = hasSelection
    ? selection.value.slice(selection.start, selection.end)
    : 'code'
  const replacement = `\`\`\`\n${content}\n\`\`\``

  return replaceRange({
    value: selection.value,
    start: selection.start,
    end: selection.end,
    replacement,
    nextSelectionStart: selection.start + 4,
    nextSelectionEnd: selection.start + 4 + content.length,
  })
}

const applyMarkdownAction = (
  action: MarkdownMenuAction,
  selection: EditorSelection
): EditorTransformResult | null => {
  switch (action) {
    case 'bold':
      return wrapSelection(selection, {
        before: '**',
        placeholder: 'bold text',
      })
    case 'italic':
      return wrapSelection(selection, {
        before: '_',
        placeholder: 'italic text',
      })
    case 'heading':
      return toggleHeading(selection)
    case 'bullet-list':
      return togglePrefixedLines(selection, {
        prefix: '- ',
        placeholder: 'List item',
      })
    case 'ordered-list':
      return toggleOrderedList(selection)
    case 'quote':
      return togglePrefixedLines(selection, {
        prefix: '> ',
        placeholder: 'Quoted text',
      })
    case 'link':
      return insertLink(selection)
    case 'image':
      return insertImage(selection)
    case 'horizontal-rule':
      return insertHorizontalRule(selection)
    case 'inline-code':
      return wrapSelection(selection, {
        before: '`',
        placeholder: 'code',
      })
    case 'code-block':
      return toggleCodeBlock(selection)
    default:
      return null
  }
}

const setTextareaValue = (textarea: HTMLTextAreaElement, nextValue: string) => {
  Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set?.call(textarea, nextValue)

  if (textarea.value !== nextValue) {
    textarea.value = nextValue
  }
}

const dedentSelection = (selection: EditorSelection): EditorTransformResult => {
  const { lineEnd, lineStart } = getLineRange(
    selection.value,
    selection.start,
    selection.end
  )
  const block = selection.value.slice(lineStart, lineEnd)
  const nextBlock = block
    .split('\n')
    .map((line) => line.replace(/^ {1,2}/, ''))
    .join('\n')

  return replaceRange({
    value: selection.value,
    start: lineStart,
    end: lineEnd,
    replacement: nextBlock,
    nextSelectionStart: lineStart,
    nextSelectionEnd: lineStart + nextBlock.length,
  })
}

export const MarkdownEditor = ({
  className,
  disabled,
  onKeyDown,
  value = '',
  ...props
}: MarkdownEditorProps) => {
  const [mode, setMode] = useState<EditorMode>('split')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingSelectionRef = useRef<{ end: number; start: number } | null>(null)
  const editorValue = typeof value === 'string' ? value : ''
  const deferredValue = useDeferredValue(editorValue)
  const wordCount = editorValue.trim() ? editorValue.trim().split(/\s+/).length : 0

  const restoreSelection = () => {
    const textarea = textareaRef.current
    const pendingSelection = pendingSelectionRef.current

    if (!textarea || !pendingSelection) {
      return
    }

    textarea.focus()
    textarea.setSelectionRange(
      pendingSelection.start,
      pendingSelection.end
    )
    pendingSelectionRef.current = null
  }

  useEffect(() => {
    restoreSelection()
  }, [editorValue])

  useEffect(() => {
    if (mode !== 'preview') {
      textareaRef.current?.focus()
    }
  }, [mode])

  const commitTransform = (result: EditorTransformResult | null) => {
    const textarea = textareaRef.current

    if (!textarea || !result) {
      return
    }

    pendingSelectionRef.current = {
      start: result.selectionStart,
      end: result.selectionEnd,
    }

    setTextareaValue(textarea, result.nextValue)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    requestAnimationFrame(() => {
      restoreSelection()
    })
  }

  const handleAction = (action: MarkdownMenuAction) => {
    const textarea = textareaRef.current

    if (!textarea || disabled) {
      return
    }

    commitTransform(
      applyMarkdownAction(action, {
        value: textarea.value,
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      })
    )
  }

  const handleKeyDownInternal: NonNullable<ComponentProps<typeof Textarea>['onKeyDown']> =
    (event) => {
      onKeyDown?.(event)

      if (event.defaultPrevented || disabled) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
        if (event.key.toLowerCase() === 'b') {
          event.preventDefault()
          handleAction('bold')
          return
        }

        if (event.key.toLowerCase() === 'i') {
          event.preventDefault()
          handleAction('italic')
          return
        }

        if (event.key.toLowerCase() === 'k') {
          event.preventDefault()
          handleAction('link')
          return
        }
      }

      if (event.key === 'Tab') {
        event.preventDefault()

        const textarea = textareaRef.current

        if (!textarea) {
          return
        }

        const selection = {
          value: textarea.value,
          start: textarea.selectionStart,
          end: textarea.selectionEnd,
        }

        if (event.shiftKey) {
          commitTransform(dedentSelection(selection))
          return
        }

        commitTransform(
          replaceRange({
            value: textarea.value,
            start: selection.start,
            end: selection.end,
            replacement: '  ',
            nextSelectionStart: selection.start + 2,
            nextSelectionEnd: selection.start + 2,
          })
        )
      }
    }

  return (
    <div className="overflow-hidden border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2">
        <MarkdownMenuBar
          disabled={disabled === true || mode === 'preview'}
          onAction={handleAction}
        />

        <div className="flex items-center border">
          {modeOptions.map(({ icon: Icon, label, value: nextMode }) => (
            <Button
              key={nextMode}
              type="button"
              variant={mode === nextMode ? 'secondary' : 'ghost'}
              size="xs"
              className="rounded-none border-0"
              onClick={() => setMode(nextMode)}
            >
              <Icon className="size-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className={cn('grid min-h-[50vh]', mode === 'split' && 'lg:grid-cols-2')}>
        {mode !== 'preview' && (
          <div className={cn(mode === 'split' && 'border-b lg:border-r lg:border-b-0')}>
            <Textarea
              ref={textareaRef}
              value={editorValue}
              disabled={disabled}
              onKeyDown={handleKeyDownInternal}
              className={cn(
                'min-h-[50vh] resize-none border-0 bg-transparent! px-4 py-4 text-sm! leading-7 tracking-tight shadow-none ring-0!',
                className
              )}
              {...props}
            />
          </div>
        )}

        {mode !== 'write' && (
          <div className="min-h-[50vh] bg-muted/10 px-4 py-4">
            {deferredValue.trim() ? (
              <Streamdown
                plugins={streamdownPlugins}
                className="h-full max-w-none text-sm leading-7"
              >
                {deferredValue}
              </Streamdown>
            ) : (
              <div className="flex h-full min-h-[50vh] items-center justify-center border border-dashed text-center">
                <p className="max-w-sm text-xs leading-6 text-muted-foreground">
                  Markdown preview will appear here as you write. Use the toolbar
                  or shortcuts like Cmd/Ctrl+B, Cmd/Ctrl+I, and Cmd/Ctrl+K.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
        <p>Supports headings, lists, links, images, quotes, and fenced code blocks.</p>
        <p>{wordCount} words</p>
      </div>
    </div>
  )
}
