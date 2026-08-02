'use client'

import { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

import { Overlay } from '@/components/peace/Overlay'
import { SidePanel } from '@/components/peace/SidePanel'
import { FreeExploreButton, DetailPanel } from '@/components/peace/FreeExplore'
import { FinalQuote } from '@/components/peace/FinalQuote'
import { sceneState, CHAPTER_COUNT } from '@/lib/sceneState'
import type { Conflict } from '@/lib/conflicts'

// The 3D scene contents (Earth, doves, war markers, etc.) are lazy-loaded
// with ssr:false because they depend on WebGL context creation.
const Scene = lazy(() =>
  import('@/components/peace/Scene').then((m) => ({ default: m.Scene })),
)

export default function Home() {
  const [ready, setReady] = useState(false)
  const [freeMode, setFreeMode] = useState(false)
  const [detailConflict, setDetailConflict] = useState<Conflict | null>(null)
  const [overlayOpacity, setOverlayOpacity] = useState(1)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Track scroll progress across the entire page.
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start start', 'end end'],
  })

  // Update sceneState.progress on scroll (for the CameraRig to read).
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    sceneState.progress = v
    // Fade the intro overlay out during the first chapter.
    const overlayOpacity = Math.max(0, 1 - v * CHAPTER_COUNT)
    setOverlayOpacity(overlayOpacity > 0.01 ? overlayOpacity : 0)
  })

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 800)
    return () => clearTimeout(id)
  }, [])

  // Toggle free explore mode.
  const toggleFreeMode = useCallback(() => {
    setFreeMode((prev) => {
      const next = !prev
      sceneState.freeMode = next
      if (!next) {
        // Exiting free mode — clear detail panel.
        setDetailConflict(null)
      }
      return next
    })
  }, [])

  // Handle war marker click (in free mode).
  const handleMarkerClick = useCallback((conflict: Conflict) => {
    setDetailConflict(conflict)
  }, [])

  return (
    <main className="relative w-full bg-[#04060d]" style={{ color: '#f5f7fb' }}>
      {/* ===========================================
          STICKY 3D CANVAS (fills viewport, stays fixed during scroll)
          =========================================== */}
      <div className="sticky top-0 h-screen w-full overflow-hidden z-0">
        <Canvas
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.NoToneMapping,
            toneMappingExposure: 1.0,
          }}
          dpr={[1, 2]}
          camera={{ position: [0, 0.5, 3.0], fov: 42, near: 0.1, far: 200 }}
          className="absolute inset-0"
        >
          <Suspense fallback={null}>
            <Scene onMarkerClick={handleMarkerClick} />
          </Suspense>
        </Canvas>

        {/* Loading screen */}
        <div
          className={`pointer-events-none absolute inset-0 z-[6] flex items-center justify-center transition-opacity duration-700 ${
            ready ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ background: '#04060d' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-t-2 border-amber-300/80 animate-spin" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              Loading Earth…
            </div>
          </div>
        </div>

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background:
              'radial-gradient(80% 60% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)',
          }}
        />

        {/* Intro overlay (title + stats) — fades out on scroll */}
        <Overlay opacity={overlayOpacity} />

        {/* Side panel (conflict photo + info) — driven by scroll focus */}
        <SidePanel freeMode={freeMode} />

        {/* Detail panel (when a marker is clicked in free mode) */}
        <DetailPanel
          conflict={detailConflict}
          onClose={() => setDetailConflict(null)}
        />

        {/* Free explore button (bottom-left) */}
        <FreeExploreButton freeMode={freeMode} onToggle={toggleFreeMode} />

        {/* Free mode hint banner */}
        {freeMode && !detailConflict && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-center"
          >
            <div className="text-xs text-white/50 tracking-wider">
              拖动地球旋转视角 · 点击红点查看冲突详情
            </div>
          </motion.div>
        )}

        {/* Scroll cue (only in scroll mode, not free mode, fades on scroll) */}
        {!freeMode && overlayOpacity > 0.3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-2 text-white/40">
              <div className="text-[10px] tracking-[0.4em] uppercase">Scroll</div>
              <div className="h-8 w-px bg-gradient-to-b from-amber-300/50 to-transparent" />
            </div>
          </motion.div>
        )}
      </div>

      {/* ===========================================
          SCROLL SECTIONS (drive the camera animation)
          Each section is 100vh. The CameraRig maps scroll
          progress to camera position, flying to each conflict
          in sequence.
          =========================================== */}
      <div ref={scrollContainerRef} className="relative z-10">
        {/* Chapter 0: Intro — the overlay handles the visual, this is just a spacer */}
        <ScrollSpacer label="Chapter I · 凝视" />

        {/* Chapters 1..N: one per conflict */}
        {Array.from({ length: CHAPTER_COUNT - 2 }).map((_, i) => (
          <ScrollSpacer
            key={i}
            label={`Chapter ${romanize(i + 2)} · ${
              i < 10 ? conflictNames[i] : '...'
            }`}
          />
        ))}

        {/* Final chapter: the quote */}
        <section className="relative z-10">
          <FinalQuote />
        </section>
      </div>
    </main>
  )
}

/**
 * An invisible 100vh spacer that drives the scroll progress.
 * A subtle chapter label appears at the bottom for orientation.
 */
function ScrollSpacer({ label }: { label: string }) {
  return (
    <section className="relative h-screen w-full pointer-events-none">
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-white/20">
        {label}
      </div>
    </section>
  )
}

function romanize(n: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let result = ''
  let num = n
  for (const [val, sym] of map) {
    while (num >= val) {
      result += sym
      num -= val
    }
  }
  return result
}

const conflictNames = [
  '乌克兰',
  '加沙',
  '苏丹',
  '缅甸',
  '叙利亚',
  '也门',
  '刚果',
  '萨赫勒',
  '海地',
  '索马里',
]
