'use client'

import { motion } from 'framer-motion'

/**
 * The final quote panel, shown at the very bottom of the scroll.
 *
 * Classic peace quote + dove release imagery. This is the emotional
 * resolution after the user has scrolled through all the conflicts.
 */
export function FinalQuote() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background — deep space with a warm glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, #0a0f1e 0%, #04060d 70%)',
        }}
      />

      {/* Soft animated glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 0.5, scale: 1.3 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 3, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="h-96 w-96 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,220,170,0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-3xl px-6 text-center"
      >
        <div className="text-[10px] tracking-[0.5em] uppercase text-amber-300/70 mb-8">
          Finale
        </div>

        <blockquote
          className="text-2xl md:text-4xl font-light leading-relaxed text-white/90 italic"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}
        >
          “和平不是没有冲突，
          <br />
          而是用对话解决冲突。”
        </blockquote>

        <div className="mt-6 text-sm text-white/50 tracking-wider">
          — 纳尔逊·曼德拉
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.8, delay: 0.6, ease: 'easeOut' }}
          className="h-px bg-amber-300/40 mx-auto my-12 origin-center"
          style={{ width: '180px' }}
        />

        <p
          className="text-base md:text-lg text-white/55 leading-relaxed font-light max-w-xl mx-auto"
        >
          今天，地球上有 1.2 亿人流离失所，
          <br />
          4.5 亿儿童生活在冲突地区。
          <br />
          愿白鸽飞过这片满目疮痍的土地，
          <br />
          愿炮火止于今日。
        </p>
      </motion.div>
    </div>
  )
}
