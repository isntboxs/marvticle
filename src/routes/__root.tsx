import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'

import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import type { orpc } from '#/orpc/client'
import appCss from '#/styles.css?url'
import { ThemeProvider } from '#/components/providers/theme-provider'
import { TooltipProvider } from '#/components/ui/tooltip'
import { Toaster } from '#/components/ui/sonner'
import { getAuthFn } from '#/functions/get-auth-fn'

interface MyRouterContext {
  orpc: typeof orpc
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => {
    const title = `${import.meta.env.VITE_APP_NAME} — Write Anything That Matters`
    const description = `Not just blogs. Not just code. Just write.`
    const appUrl = import.meta.env.VITE_APP_URL

    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        { title: title },
        { name: 'description', content: description },

        // open graph
        { name: 'og:title', content: title },
        { name: 'og:description', content: description },
        { name: 'og:type', content: 'website' },
        { name: 'og:url', content: appUrl },
        {
          name: 'og:image',
          content: `${appUrl}/api/og-static?type=home&title=${encodeURIComponent('Write Anything That Matters')}&description=${encodeURIComponent(description)}`,
        },
        { name: 'og:site_name', content: import.meta.env.VITE_APP_NAME },

        // twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:url', content: appUrl },
        {
          name: 'twitter:image',
          content: `${appUrl}/api/og-static?type=home&title=${encodeURIComponent('Write Anything That Matters')}&description=${encodeURIComponent(description)}`,
        },
      ],
      links: [
        {
          rel: 'stylesheet',
          href: appCss,
        },
      ],
    }
  },

  beforeLoad: async () => {
    const auth = await getAuthFn()

    return { auth }
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'React Query',
              render: <ReactQueryDevtoolsPanel />,
            },
            formDevtoolsPlugin(),
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
