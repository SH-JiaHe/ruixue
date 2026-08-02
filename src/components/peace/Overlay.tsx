'use client'

import { motion } from 'framer-motion'
import { Globe2 } from 'lucide-react'

/**
 * Cinematic HTML overlay rendered on top of the 3D earth canvas.
 *
 * This is the "Chapter I" UI — the 3D earth hero. Only shown at the
 * top of the page (the intro chapter). As the user scrolls, this
 * overlay fades out and the SidePanel takes over.
 *
 * Layout — intentionally minimal:
 *  - top-left  : small label + main title only
 *
 * The previous version had a stats panel (top-right) and a bottom
 * chapter card that overlapped with the scroll cue. Both removed.
 */
interface OverlayProps {
  /** Scroll progress 0..1 — used to fade the overlay out as user scrolls. */
  opacity: number
}

export function Overlay({ opacity }: OverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-start"
      style={{ color: '#f5f7fb', opacity }}
    >
      {/* Subtle top-down gradient to improve text contrast (top only) */}
      <div
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,12,24,0.55) 0%, rgba(8,12,24,0.0) 100%)',
        }}
      />

      {/* Title block — top-left only, no overlapping elements */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 p-6 md:p-10"
      >
        <div className="flex items-center gap-2 text-amber-300/90 mb-3">
          <Globe2 className="h-3.5 w-3.5" />
          <span className="text-[10px] tracking-[0.4em] uppercase">
            Peace on Earth
          </span>
        </div>
        <h1
          className="text-3xl md:text-5xl font-light leading-tight tracking-tight"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
        >
          让炮火，止于今日。
        </h1>
      </motion.div>
    </div>
  )
}
