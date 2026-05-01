const GridPattern = ({
  W = 1200,
  H = 630,
  GRID_SIZE = 16,
}: {
  W?: number
  H?: number
  GRID_SIZE?: number
}) => {
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
  )
}

function OGVignetteOverlay() {
  return (
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
  )
}

const OGLogo = ({ name = 'marvticle' }: { name?: string }) => {
  return (
    <div tw="flex items-center">
      <svg viewBox="0 0 460.11 409.97" width={36} fill="#ffffff">
        <polygon points="55.81 0 171.96 292.62 285.86 0 338.25 0 218.7 301.18 221.52 301.74 287.57 235.69 342.81 235.69 171.42 409.97 0 235.69 55.24 235.69 122.44 302.87 122.72 299.17 3.42 0 55.81 0" />
        <rect x="369" y="278.96" width="91.11" height="93.37" />
      </svg>

      <span tw="text-3xl font-bold tracking-tight text-white ml-3">{name}</span>
    </div>
  )
}

const OGBadge = ({ label = 'article' }: { label?: string }) => {
  return (
    <div
      tw="flex items-center p-2 text-sm font-medium text-white rounded-none"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {label}
    </div>
  )
}

const OGAccentLine = ({ single }: { single?: boolean }) => {
  if (single) {
    return (
      <div
        tw="h-[3px] w-20 rounded-full absolute top-14"
        style={{ background: '#6366f1' }}
      />
    )
  }

  return (
    <div tw="flex items-center" style={{ marginBottom: '24px' }}>
      <div tw="h-[3px] w-12 rounded-full" style={{ background: '#6366f1' }} />
      <div
        tw="h-[3px] w-4 rounded-full"
        style={{
          background: 'rgba(99,102,241,0.4)',
          marginLeft: '6px',
        }}
      />
    </div>
  )
}

const OGDomain = ({ pathname }: { pathname?: string }) => {
  if (pathname) {
    return (
      <div
        tw="flex items-center text-sm text-white p-2"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        article.marvagency.net/{pathname}
      </div>
    )
  }

  return <span tw="text-sm text-neutral-50">article.marvagency.net</span>
}

export {
  GridPattern,
  OGVignetteOverlay,
  OGLogo,
  OGBadge,
  OGAccentLine,
  OGDomain,
}
