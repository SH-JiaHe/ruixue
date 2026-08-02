'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Compass, X, MapPin, ExternalLink } from 'lucide-react'

import type { Conflict } from '@/lib/conflicts'
import { GALLERY } from '@/lib/gallery'
import { cn } from '@/lib/utils'

interface FreeExploreButtonProps {
  freeMode: boolean
  onToggle: () => void
}

/**
 * Bottom-left "自由探索" button.
 *
 * Toggles between scroll-driven mode and free explore mode.
 * In free mode, the user can drag the earth and click war markers.
 */
export function FreeExploreButton({ freeMode, onToggle }: FreeExploreButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      onClick={onToggle}
      className={cn(
        'pointer-events-auto absolute bottom-6 left-6 md:bottom-8 md:left-8 z-30',
        'flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium',
        'backdrop-blur-md border transition-all',
        freeMode
          ? 'bg-amber-300 text-zinc-950 border-amber-200 hover:bg-amber-200'
          : 'bg-black/40 text-white/90 border-white/15 hover:bg-black/55 hover:border-white/30',
      )}
    >
      <Compass className={cn('h-4 w-4 transition-transform', freeMode && 'rotate-180')} />
      <span>{freeMode ? '退出自由探索' : '自由探索'}</span>
    </motion.button>
  )
}

interface DetailPanelProps {
  conflict: Conflict | null
  onClose: () => void
}

/**
 * Right-side detail panel, shown when a war marker is clicked in
 * free explore mode.
 *
 * Shows the conflict's photo (if available), name, region, summary,
 * casualty / displacement stats, and a closing message.
 */
export function DetailPanel({ conflict, onClose }: DetailPanelProps) {
  const photo = conflict
    ? GALLERY.find((p) => {
        if (conflict.id === 'ukraine') return p.act === 'ukraine'
        if (conflict.id === 'gaza') return p.act === 'gaza'
        return false
      })
    : null

  return (
    <AnimatePresence>
      {conflict && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto absolute right-0 top-0 z-30 h-full w-full md:w-[440px] flex flex-col justify-center p-6 md:p-8"
        >
          <div className="relative rounded-2xl border border-white/12 bg-zinc-950/85 backdrop-blur-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition z-10"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Photo */}
            {photo && (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 -mx-1">
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  style={{ filter: 'contrast(1.05) saturate(0.92)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-[11px] text-white/85 leading-snug font-light">
                    {photo.caption}
                  </p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-2 text-amber-300/90 mb-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-[10px] tracking-[0.3em] uppercase">
                {conflict.region}
              </span>
              <span
                className={cn(
                  'ml-auto text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border',
                  conflict.intensity >= 9
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : conflict.intensity >= 7
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      : 'bg-amber-400/20 text-amber-200 border-amber-400/40',
                )}
              >
                强度 Lv {conflict.intensity}
              </span>
            </div>

            <h3 className="text-2xl font-semibold leading-tight">
              {conflict.name}
            </h3>
            <p className="text-xs text-white/40 mt-1">{conflict.nameEn}</p>

            {/* Stats grid */}
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  冲突起始
                </div>
                <div className="mt-1 text-sm font-medium text-white/90">
                  {conflict.started}
                </div>
              </div>
              <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  伤亡情况
                </div>
                <div className="mt-1 text-sm font-medium text-white/90">
                  {conflict.casualties}
                </div>
              </div>
              <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-white/40">
                  流离失所
                </div>
                <div className="mt-1 text-sm font-medium text-white/90">
                  {conflict.displaced}
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="mt-5 text-sm text-white/80 leading-relaxed">
              {conflict.summary}
            </p>
            <p className="mt-2 text-xs text-white/40 leading-relaxed">
              {conflict.summaryEn}
            </p>

            {/* Closing message */}
            <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-sm text-amber-100/90">
              在 {conflict.region}，无数家庭正在承受失去的痛楚。
              <br />
              愿和平早日到来。
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-white/30">
              <ExternalLink className="h-3 w-3" />
              <span>点击地球其他红点查看更多冲突</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
