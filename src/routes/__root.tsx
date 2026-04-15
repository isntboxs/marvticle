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

import appCss from '#/styles.css?url'
import { TanstackQueryProvider } from '#/components/providers/tanstack-query-provider'
import { ThemeProvider } from '#/components/providers/theme-provider'
import { TooltipProvider } from '#/components/ui/tooltip'
import { Toaster } from '#/components/ui/sonner'
import { getAuthFn } from '#/functions/get-auth-fn'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'marvticle',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

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
        <TanstackQueryProvider>
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
        </TanstackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
