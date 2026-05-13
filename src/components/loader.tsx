import { motion } from 'motion/react'
import { Fragment } from 'react/jsx-runtime'

import { cn } from '#/lib/utils'

// ─── Inline (bouncing dots) ──────────────────────────────────────────────────

function InlineLoader({ className }: { className?: string }) {
  return (
    <motion.span
      className={cn('inline-flex items-center gap-3', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span
          key={i}
          className="inline-block size-3 rounded-full bg-foreground/60"
          animate={{ opacity: [0.4, 1, 0.4], y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay }}
        />
      ))}
    </motion.span>
  )
}

// ─── Book (animated SVG book with page-flip) ─────────────────────────────────

interface BookLoaderProps {
  className?: string
  /** Icon size in px (width = height). Default 52. */
  size?: number
  label?: string
}

/**
 * SVG book icon: right page flips from right → spine → left in a loop.
 * Text lines on the left page appear staggered to reinforce "reading".
 */
function BookLoader({ className, size = 52, label }: BookLoaderProps) {
  // y-positions of the text lines drawn on the left page
  const lineYs = [15, 19, 23, 27, 31, 35]

  return (
    <motion.div
      className={cn('inline-flex flex-col items-center gap-2', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading…"
        role="status"
      >
        {/* ── Left cover ── */}
        <rect
          x="4"
          y="7"
          width="17"
          height="34"
          rx="2"
          className="fill-primary/20"
        />

        {/* ── Right cover (static background) ── */}
        <rect
          x="27"
          y="7"
          width="17"
          height="34"
          rx="2"
          className="fill-primary/20"
        />

        {/* ── Spine ── */}
        <rect
          x="21"
          y="7"
          width="6"
          height="34"
          rx="1.5"
          className="fill-primary/80"
        />

        {/* ── Flipping page ──
            originX at the spine (x=24). scaleX goes 1 → 0 → -1 → 0 → 1
            so the page sweeps right-to-left then back. */}
        <motion.rect
          x="24"
          y="7"
          width="17"
          height="34"
          rx="2"
          className="fill-primary/40"
          style={{ transformOrigin: '24px 24px' }}
          animate={{ scaleX: [1, 0.01, -1, -0.01, 1] }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: 'easeInOut',
            times: [0, 0.38, 0.5, 0.88, 1],
          }}
        />

        {/* ── Text lines on left page — staggered appearance ── */}
        {lineYs.map((y, i) => {
          // Alternate short / full widths for a natural text look
          const w = i % 3 === 2 ? 9 : 13
          const cycleDelay = i * 0.12
          return (
            <motion.rect
              key={i}
              x="6"
              y={y}
              width={w}
              height="1.5"
              rx="0.75"
              className="fill-primary/55"
              animate={{ opacity: [0, 0, 1, 1, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                delay: cycleDelay,
                times: [0, cycleDelay / 2.2, 0.25 + cycleDelay / 2.2, 0.75, 1],
                ease: 'easeOut',
              }}
            />
          )
        })}
      </svg>

      {label && (
        <motion.span
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  )
}

// ─── Thread (animated social-thread stack) ───────────────────────────────────

interface ThreadLoaderProps {
  className?: string
  label?: string
  /** Number of thread items to show. Default 3. */
  rows?: number
}

const THREAD_CYCLE = 2.6 // seconds per full animation cycle

/**
 * Animated social-media thread: avatar dots connected by a vertical line,
 * with text-line stubs. Items appear with a stagger then fade out and repeat.
 */
function ThreadLoader({ className, label, rows = 3 }: ThreadLoaderProps) {
  // Pre-compute widths for the "text" stubs
  const widths = [72, 52, 88, 60, 80]

  const itemDelay = (i: number) => (i * THREAD_CYCLE) / (rows * 3.5)

  return (
    <motion.div
      className={cn('inline-flex flex-col items-start gap-0', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Loading…"
      role="status"
    >
      {Array.from({ length: rows }).map((_, i) => {
        const d = itemDelay(i)
        // times: hidden → appear → hold → fade
        const times = [0, d / THREAD_CYCLE, (d + 0.25) / THREAD_CYCLE, 0.85, 1]

        return (
          <Fragment key={i}>
            {/* ── Thread row ── */}
            <motion.div
              className="flex items-center gap-2.5"
              animate={{ opacity: [0, 0, 1, 1, 0], x: [6, 6, 0, 0, 0] }}
              transition={{
                repeat: Infinity,
                duration: THREAD_CYCLE,
                times,
                ease: 'easeOut',
              }}
            >
              {/* Avatar dot */}
              <div className="relative flex size-4 shrink-0 items-center justify-center">
                <div className="size-3.5 rounded-full bg-primary/70 ring-2 ring-primary/20" />
                {/* Subtle pulse ring on first item */}
                {i === 0 && (
                  <motion.div
                    className="absolute size-3.5 rounded-full bg-primary/30"
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'easeOut',
                    }}
                  />
                )}
              </div>

              {/* Text line stubs */}
              <div className="flex flex-col gap-1">
                <div
                  className="h-2 rounded-full bg-foreground/25"
                  style={{ width: widths[i % widths.length] }}
                />
                {i === 0 && (
                  <div
                    className="h-1.5 rounded-full bg-foreground/15"
                    style={{ width: widths[(i + 2) % widths.length] }}
                  />
                )}
              </div>
            </motion.div>

            {/* ── Connector line between rows ── */}
            {i < rows - 1 && (
              <motion.div
                className="ml-[7px] w-px rounded-full bg-border"
                animate={{
                  height: [0, 0, 16, 16, 0],
                  opacity: [0, 0, 1, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: THREAD_CYCLE,
                  times,
                  ease: 'easeOut',
                }}
              />
            )}
          </Fragment>
        )
      })}

      {label && (
        <motion.span
          className="mt-2.5 text-xs text-muted-foreground"
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  )
}

export const Loader = {
  Inline: InlineLoader,
  Book: BookLoader,
  Thread: ThreadLoader,
}
