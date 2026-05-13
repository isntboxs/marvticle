import { TanStackDevtools } from '@tanstack/react-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'
import { type QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { type ReactNode } from 'react'

import { TanStackRouterProgressProvider } from '#/components/providers/tanstack-router-progress-provider'
import { ThemeProvider } from '#/components/providers/theme-provider'
import { Toaster } from '#/components/ui/sonner'
import { TooltipProvider } from '#/components/ui/tooltip'
import { getAuthFn } from '#/functions/get-auth-fn'
import { type orpc } from '#/orpc/client'
import appCss from '#/styles.css?url'

interface MyRouterContext {
  orpc: typeof orpc
  queryClient: QueryClient
  breadcrumb: string | undefined
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
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: appUrl },
        {
          property: 'og:image',
          content: `${appUrl}/api/og-static?type=home&title=${encodeURIComponent('Write Anything That Matters')}&description=${encodeURIComponent(description)}`,
        },
        { property: 'og:site_name', content: import.meta.env.VITE_APP_NAME },

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
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/marv-logo.svg',
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
    <html
      lang="en"
      className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent scrollbar-gutter-stable"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <TanStackRouterProgressProvider
          color="#2563eb"
          height="3px"
          options={{ showSpinner: false }}
        >
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="top-right" />
          </ThemeProvider>
        </TanStackRouterProgressProvider>
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
