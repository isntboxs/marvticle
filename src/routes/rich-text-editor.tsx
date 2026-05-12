import { createFileRoute, ClientOnly } from '@tanstack/react-router'

import BlockNoteEditor from '#/components/block-note/editor'

export const Route = createFileRoute('/rich-text-editor')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto h-svh w-full max-w-7xl p-4">
      <ClientOnly fallback={<div>Loading...</div>}>
        <BlockNoteEditor />
      </ClientOnly>
    </div>
  )
}
