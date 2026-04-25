import 'katex/dist/katex.min.css'
import { Streamdown } from 'streamdown'
import { cjk } from '@streamdown/cjk'
import { code } from '@streamdown/code'
import { math } from '@streamdown/math'
import { mermaid } from '@streamdown/mermaid'

import { cn } from '#/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer = ({
  content,
  className,
}: MarkdownRendererProps) => {
  return (
    <Streamdown
      plugins={{
        code: code,
        mermaid: mermaid,
        math: math,
        cjk: cjk,
      }}
      className={cn(className)}
    >
      {content}
    </Streamdown>
  )
}
