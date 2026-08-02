'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MapPin } from 'lucide-react'

import { NARRATIVE_CONFLICTS } from '@/lib/sceneState'
import { GALLERY } from '@/lib/gallery'
import type { Conflict } from '@/lib/conflicts'

/**
 * Side panel that shows the current conflict's photo + description.
 *
 * Appears on the right side of the screen. Driven by the `focusIndex`
 * stored in sceneState, which is updated by CameraRig each time the
 * camera arrives at a new conflict.
 *
 * In free explore mode, this panel is hidden (the DetailPanel takes over).
 */
interface SidePanelProps {
  freeMode: boolean
}

export function SidePanel({ freeMode }: SidePanelProps) {
  const [focusIndex, setFocusIndex] = useState(-1)

  useEffect(() => {
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail
      setFocusIndex(idx)
    }
    window.addEventListener('peace-focus-change', handler)
    return () => window.removeEventListener('peace-focus-change', handler)
  }, [])

  // Find the conflict + a representative photo for the current focus.
  const conflict: Conflict | null =
    focusIndex >= 0 && focusIndex < NARRATIVE_CONFLICTS.length
      ? NARRATIVE_CONFLICTS[focusIndex]
      : null

  // Map conflict to a gallery photo. The gallery has photos for ukraine
  // (3) and gaza (3). For other conflicts, we show the conflict info
  // without a photo.
  const photo = conflict
    ? GALLERY.find((p) => {
        if (conflict.id === 'ukraine') return p.act === 'ukraine'
        if (conflict.id === 'gaza') return p.act === 'gaza'
        return false
      })
    : null

  // Show a different photo for each scroll-through of the same conflict
  // (cycle through the 3 ukraine / 3 gaza photos based on focusIndex).
  const photoIndex = conflict
    ? GALLERY.filter((p) => p.act === conflict.id).findIndex((p) => p === photo)
    : -1

  const isHidden = freeMode || !conflict

  return (
    <div
      className={`pointer-events-none absolute right-0 top-0 z-20 h-full w-full md:w-[440px] transition-opacity duration-500 ${
        isHidden ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <AnimatePresence mode="wait">
        {conflict && !freeMode && (
          <motion.div
            key={conflict.id + '-' + photoIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto h-full flex flex-col justify-end p-6 md:p-8 pb-24"
          >
            {/* Photo */}
            {photo && (
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-4">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  style={{ filter: 'contrast(1.05) saturate(0.92)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-xs text-white/85 leading-snug font-light">
                    {photo.caption}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">
                    {photo.credit}
                  </p>
                </div>
              </div>
            )}

            {/* Conflict info card */}
            <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md p-5">
              <div className="flex items-center gap-2 text-amber-300/90 mb-2">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-[10px] tracking-[0.3em] uppercase">
                  {conflict.region}
                </span>
                <span className="ml-auto text-[10px] tracking-widest uppercase text-white/40">
                  Lv {conflict.intensity}
                </span>
              </div>
              <h3 className="text-xl font-semibold leading-tight mb-2">
                {conflict.name}
              </h3>
              <p className="text-sm text-white/65 leading-relaxed mb-3">
                {conflict.summary}
              </p>
              <div className="flex gap-4 text-xs text-white/50">
                <span>始于 {conflict.started}</span>
                <span>·</span>
                <span>{conflict.casualties}</span>
              </div>
            </div>

            {/* Scroll hint */}
            <div className="mt-4 flex items-center justify-center gap-2 text-white/30 text-xs">
              <ChevronDown className="h-3 w-3 animate-bounce" />
              <span>继续滚动，前往下一处</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
