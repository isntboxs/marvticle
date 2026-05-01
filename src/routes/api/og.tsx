import fs from 'node:fs'
import path from 'node:path'
import { createFileRoute } from '@tanstack/react-router'

import { ImageResponse } from '@vercel/og'

const getFont = async ({
  font,
  fileName,
}: {
  font: string
  fileName: string
}) => {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', font, fileName)
  const data = await fs.promises.readFile(fontPath)

  return data
}

export const Route = createFileRoute('/api/og')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { searchParams } = new URL(request.url)
          const title = searchParams.get('title') ?? 'marvticle'
          const description = searchParams.get('description') ?? ''
          const authorName = searchParams.get('authorName') ?? ''
          const authorUsername = searchParams.get('authorUsername') ?? ''
          const authorImage =
            searchParams.get('authorImage') ??
            `https://api.dicebear.com/9.x/notionists-neutral/png?seed=${authorUsername || 'default'}`

          const [
            interFontRegular,
            interFontMedium,
            interFontSemiBold,
            interFontBold,
          ] = await Promise.all([
            // regular
            getFont({
              font: 'inter',
              fileName: 'inter-latin-400-normal.ttf',
            }),

            // medium
            getFont({
              font: 'inter',
              fileName: 'inter-latin-500-normal.ttf',
            }),

            // semibold
            getFont({
              font: 'inter',
              fileName: 'inter-latin-600-normal.ttf',
            }),

            // bold
            getFont({
              font: 'inter',
              fileName: 'inter-latin-700-normal.ttf',
            }),
          ])

          return new ImageResponse(
            <OGImage
              title={title}
              description={description}
              authorName={authorName}
              authorUsername={authorUsername}
              authorImage={authorImage}
            />,
            {
              width: 1200,
              height: 630,
              fonts: [
                {
                  name: 'Inter',
                  data: interFontRegular,
                  weight: 400,
                  style: 'normal',
                },
                {
                  name: 'Inter',
                  data: interFontMedium,
                  weight: 500,
                  style: 'normal',
                },
                {
                  name: 'Inter',
                  data: interFontSemiBold,
                  weight: 600,
                  style: 'normal',
                },
                {
                  name: 'Inter',
                  data: interFontBold,
                  weight: 700,
                  style: 'normal',
                },
              ],
            }
          )
        } catch (error) {
          console.error('[OG Image] Failed to generate:', error)
          return new Response('Failed to generate OG image', { status: 500 })
        }
      },
    },
  },
})

function OGImage({
  title,
  description,
  authorName,
  authorUsername,
  authorImage,
}: {
  title: string
  description: string
  authorName: string
  authorUsername: string
  authorImage: string
}) {
  // generate grid SVG sebagai background
  const GRID_SIZE = 16
  const W = 1200
  const H = 630

  let svgParts = ''

  // vertical lines
  for (let x = 0; x <= W; x += GRID_SIZE) {
    svgParts += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>`
  }
  // horizontal lines
  for (let y = 0; y <= H; y += GRID_SIZE) {
    svgParts += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>`
  }
  // dots di setiap intersection
  for (let x = 0; x <= W; x += GRID_SIZE) {
    for (let y = 0; y <= H; y += GRID_SIZE) {
      svgParts += `<circle cx="${x}" cy="${y}" r="1.5" fill="rgba(255,255,255,0.5)"/>`
    }
  }

  const gridSvg = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svgParts}</svg>`
  )}`

  return (
    <div
      tw="flex flex-col w-full h-full p-16"
      style={{
        fontFamily: 'Inter, sans-serif',
        background: '#1c1c1c',
        position: 'relative',
      }}
    >
      {/* grid layer */}
      <img
        src={gridSvg}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* vignette overlay biar pinggir gelap, tengah lebih fokus */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* content */}
      <div tw="flex flex-col w-full h-full" style={{ position: 'relative' }}>
        {/* top: logo + badge */}
        <div tw="flex items-center justify-between">
          <div tw="flex items-center">
            <svg viewBox="0 0 460.11 409.97" width={36} fill="#ffffff">
              <polygon points="55.81 0 171.96 292.62 285.86 0 338.25 0 218.7 301.18 221.52 301.74 287.57 235.69 342.81 235.69 171.42 409.97 0 235.69 55.24 235.69 122.44 302.87 122.72 299.17 3.42 0 55.81 0" />
              <rect x="369" y="278.96" width="91.11" height="93.37" />
            </svg>
            <span tw="text-xl font-bold tracking-tight text-white ml-3">
              marvticle
            </span>
          </div>

          <div
            tw="flex items-center p-2 text-sm font-medium text-white rounded-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            article
          </div>
        </div>

        {/* middle: title + desc */}
        <div tw="flex flex-col flex-1 justify-center">
          <div tw="flex items-center" style={{ marginBottom: '24px' }}>
            <div
              tw="h-[3px] w-12 rounded-full"
              style={{ background: '#6366f1' }}
            />
            <div
              tw="h-[3px] w-4 rounded-full"
              style={{
                background: 'rgba(99,102,241,0.4)',
                marginLeft: '6px',
              }}
            />
          </div>

          <h1
            tw="text-5xl font-bold text-white"
            style={{ lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}
          >
            {title}
          </h1>

          {description && (
            <p
              tw="text-lg text-neutral-400"
              style={{
                marginTop: '16px',
                lineHeight: 1.6,
                margin: '16px 0 0 0',
              }}
            >
              {description.length > 100
                ? description.slice(0, 100) + '...'
                : description}
            </p>
          )}
        </div>

        {/* bottom: author + domain */}
        <div tw="flex items-center justify-between">
          <div tw="flex items-center">
            {authorImage && (
              <img
                src={authorImage}
                width={48}
                height={48}
                tw="rounded-full"
                alt={authorName || 'Author'}
                style={{ border: '2px solid rgba(255,255,255,0.15)' }}
              />
            )}
            <div tw="flex flex-col" style={{ marginLeft: '12px' }}>
              {authorName && (
                <span tw="text-base font-semibold text-white">
                  {authorName}
                </span>
              )}
              {authorUsername && (
                <span tw="text-sm text-neutral-500">@{authorUsername}</span>
              )}
            </div>
          </div>

          <span tw="text-sm text-neutral-600">article.marvagency.net</span>
        </div>
      </div>
    </div>
  )
}
