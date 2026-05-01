import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ImageResponse } from '@vercel/og'

import {
  GridPattern,
  OGAccentLine,
  OGBadge,
  OGDomain,
  OGLogo,
  OGVignetteOverlay,
} from '@/components/og-components'
import { getOGOptions } from '#/utils/get-og-fonts'

const OG_TYPES = ['home', 'feed', 'post'] as const

const ogStaticSchema = z.object({
  type: z.enum(OG_TYPES),
  title: z.string().optional(),
  description: z.string().optional(),
  label: z.string().optional(),
  pathname: z.string().optional(),
})

export const Route = createFileRoute('/api/og-static')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const searchParams = new URL(request.url).searchParams
        const parsed = ogStaticSchema.safeParse(
          Object.fromEntries(searchParams)
        )

        try {
          if (!parsed.success) {
            return new Response('Invalid OG type', { status: 400 })
          }

          const options = await getOGOptions()

          switch (parsed.data.type) {
            case 'feed':
              return new ImageResponse(<OGFeed />, options)
            case 'post':
              return new ImageResponse(
                <OGNewPost
                  title={parsed.data.title}
                  description={parsed.data.description}
                  label={parsed.data.label}
                  pathname={parsed.data.pathname}
                />,
                options
              )
            default:
              return new ImageResponse(
                <OGHome
                  title={parsed.data.title}
                  description={parsed.data.description}
                />,
                options
              )
          }
        } catch (err) {
          console.error(err)
          return new Response('Failed to generate OG image', { status: 500 })
        }
      },
    },
  },
})

function OGHome({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  return (
    <div
      tw="flex flex-col w-full h-full p-16"
      style={{
        fontFamily: 'Inter, sans-serif',
        background: '#1c1c1c',
        position: 'relative',
      }}
    >
      <GridPattern />

      <OGVignetteOverlay />

      <div
        tw="flex flex-col w-full h-full items-center justify-center"
        style={{ position: 'relative' }}
      >
        <div tw="flex items-center justify-center flex-col">
          <OGLogo name="Marvticle" />

          <OGAccentLine single />
        </div>

        <div tw="flex flex-col flex-1 justify-center items-center">
          <h1
            tw="text-6xl font-bold text-white"
            style={{ lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}
          >
            {title}
          </h1>

          <p tw="text-lg text-neutral-500" style={{ marginTop: '1.5rem' }}>
            {description}
          </p>
        </div>

        <OGDomain />
      </div>
    </div>
  )
}

function OGFeed() {
  return (
    <div
      tw="flex flex-col w-full h-full p-16"
      style={{
        fontFamily: 'Inter, sans-serif',
        background: '#1c1c1c',
        position: 'relative',
      }}
    >
      <GridPattern />

      <OGVignetteOverlay />

      <div tw="flex flex-col w-full h-full" style={{ position: 'relative' }}>
        {/* header */}
        <div tw="flex items-center justify-between">
          <OGLogo name="Marvticle" />

          <OGBadge label="Feed" />
        </div>

        {/* main content */}
        <div tw="flex flex-col flex-1 justify-center">
          <OGAccentLine />
          <h1
            tw="text-6xl font-bold text-white"
            style={{ lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}
          >
            See what people are
          </h1>

          <h1
            tw="text-6xl font-bold text-white"
            style={{ lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}
          >
            thinking out loud
          </h1>
          <p tw="text-lg text-neutral-500" style={{ margin: '16px 0 0 0' }}>
            Find something you like, then follow it
          </p>
        </div>

        {/* footer */}
        <div tw="flex items-center justify-between">
          <div tw="flex items-center">
            <div tw="flex flex-col">
              <span tw="text-2xl font-bold text-white">lots</span>
              <span tw="text-sm text-neutral-600">of posts</span>
            </div>

            <div
              style={{
                width: '1px',
                height: '36px',
                background: 'rgba(255,255,255,0.1)',
                margin: '0 24px',
              }}
            />

            <div tw="flex flex-col">
              <span tw="text-2xl font-bold text-white">many</span>
              <span tw="text-sm text-neutral-600">writers</span>
            </div>
          </div>

          <OGDomain />
        </div>
      </div>
    </div>
  )
}

function OGNewPost({
  title,
  description,
  label,
  pathname,
}: {
  title?: string
  description?: string
  label?: string
  pathname?: string
}) {
  return (
    <div
      tw="flex flex-col w-full h-full p-16"
      style={{
        fontFamily: 'Inter, sans-serif',
        background: '#1c1c1c',
        position: 'relative',
      }}
    >
      <GridPattern />

      <OGVignetteOverlay />

      <div tw="flex flex-col w-full h-full" style={{ position: 'relative' }}>
        {/* header */}
        <div tw="flex items-center justify-between">
          <OGLogo name="Marvticle" />

          <OGBadge label={label} />
        </div>

        {/* main content */}
        <div tw="flex flex-col flex-1 justify-center">
          <OGAccentLine />
          <h1
            tw="text-6xl font-bold text-white"
            style={{ lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}
          >
            {title}
          </h1>

          <p tw="text-lg text-neutral-500" style={{ margin: '16px 0 0 0' }}>
            {description}
          </p>
        </div>

        {/* footer */}
        <div tw="flex items-center justify-center w-full">
          <OGDomain pathname={pathname} />
        </div>
      </div>
    </div>
  )
}
