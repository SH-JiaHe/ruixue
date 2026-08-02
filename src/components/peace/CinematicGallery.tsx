'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { GALLERY, type GalleryPhoto } from '@/lib/gallery'

/**
 * Cinematic photo gallery.
 *
 * Renders as a vertical stack of full-bleed photo panels. Each panel:
 *  - Fills 100vh
 *  - Has a slow Ken-Burns zoom + pan driven by scroll progress
 *  - Has a gradient overlay so captions remain legible
 *  - Reveals with a slow fade + scale-up when it enters the viewport
 *
 * The gallery is the "second act" of the experience — between the 3D
 * Earth hero scene (which shows where the wars are) and the call-to-action
 * (which asks the viewer to act). It is intentionally photographic, not
 * text-heavy — the photos tell the story.
 */
export function CinematicGallery() {
  return (
    <section
      id="gallery"
      className="relative w-full"
      style={{ background: '#04060d' }}
    >
      {/* Section title — minimal, almost like a chapter card in a film */}
      <SectionTitle />

      {GALLERY.map((photo, i) => (
        <PhotoPanel key={i} photo={photo} index={i} />
      ))}

      {/* Closing transition panel — empty black with a single line */}
      <ClosingPanel />
    </section>
  )
}

function SectionTitle() {
  return (
    <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-center px-6"
      >
        <div className="text-[10px] tracking-[0.5em] uppercase text-amber-300/70 mb-4">
          Chapter II
        </div>
        <h2
          className="text-3xl md:text-5xl font-light tracking-tight"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
        >
          这不是新闻，<br className="md:hidden" />这是<span className="text-amber-300/90 font-normal">某个人</span>的今天。
        </h2>
      </motion.div>
    </div>
  )
}

function PhotoPanel({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  // Scroll-driven Ken Burns transform.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // Slow zoom from 1.08 → 1.18 over the panel's scroll lifetime.
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18])
  // Subtle horizontal drift.
  const x = useTransform(scrollYProgress, [0, 1], ['-2%', '2%'])
  // Fade in as it enters, fade out as it leaves.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0.0, 1.0, 1.0, 0.4],
  )

  // Act label based on photo.act
  const actLabel =
    photo.act === 'ukraine'
      ? '乌克兰 · 俄乌战争'
      : photo.act === 'gaza'
        ? '加沙 · 巴以冲突'
        : photo.act === 'peace'
          ? '希望 · 守望和平'
          : ''

  return (
    <div
      ref={ref}
      className="relative h-screen w-full overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* Background photo with Ken Burns motion */}
      <motion.div
        style={{ scale, x, opacity }}
        className="absolute inset-0"
      >
        <img
          src={photo.url}
          alt={photo.alt}
          loading={index < 2 ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          className="h-full w-full object-cover"
          style={{
            filter: 'contrast(1.05) saturate(0.92)',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1.2s ease-out',
          }}
        />
      </motion.div>

      {/* Loading placeholder */}
      <div
        className="absolute inset-0 flex items-center justify-center text-white/30 text-xs"
        style={{ opacity: loaded ? 0 : 1, transition: 'opacity 0.6s' }}
      >
        <div className="h-8 w-8 rounded-full border-2 border-white/15 border-t-amber-300/60 animate-spin" />
      </div>

      {/* Cinematic letterbox bars (top + bottom) */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[8vh] bg-gradient-to-b from-black/85 to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10" />

      {/* Caption block — bottom-left, like a film subtitle card */}
      <motion.div
        style={{
          opacity: useTransform(
            scrollYProgress,
            [0.05, 0.25, 0.75, 0.95],
            [0, 1, 1, 0],
          ),
          y: useTransform(scrollYProgress, [0.05, 0.25], [40, 0]),
        }}
        className="absolute bottom-[8vh] left-6 md:left-12 right-6 md:right-12 z-20 max-w-2xl"
      >
        <div className="text-[10px] tracking-[0.4em] uppercase text-amber-300/80 mb-3">
          {actLabel}
        </div>
        <p
          className="text-lg md:text-2xl font-light leading-snug text-white"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.85)' }}
        >
          {photo.caption}
        </p>
        <div className="mt-4 text-[11px] text-white/40">
          摄影 · {photo.credit}
        </div>
      </motion.div>

      {/* Subtle film grain (CSS noise) — gives a documentary texture */}
      <div
        className="pointer-events-none absolute inset-0 z-15 mix-blend-overlay opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  )
}

function ClosingPanel() {
  return (
    <div className="relative h-[80vh] flex items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="text-center px-6"
      >
        <p
          className="text-xl md:text-3xl font-light text-white/85 leading-relaxed max-w-2xl mx-auto"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.85)' }}
        >
          每一张照片背后，<br />
          都是一个再也回不去的家。
        </p>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '120px' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.6, delay: 0.6, ease: 'easeOut' }}
          className="h-px bg-amber-300/60 mx-auto mt-8"
        />
      </motion.div>
    </div>
  )
}
