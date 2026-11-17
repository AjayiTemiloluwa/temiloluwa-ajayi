'use client'

import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '@/lib/gsap'

export type MaskSegment = { text: string; accent?: boolean }

/**
 * MaskText — GSAP SplitText heading reveal. The heading is split into
 * words (each clipped by its own mask) and characters; as it scrolls
 * into view the characters rise out of their masks with a slight
 * rotation, staggered left to right. `accent: true` segments are set in
 * the accent colour, italic.
 *
 * SplitText re-splits automatically when fonts load or the width
 * changes (autoSplit), and adds an aria-label so screen readers hear the
 * whole heading, not single letters. Reduced motion: plain text.
 */
export function MaskText({
  segments,
  className = '',
  delay = 0,
  stagger = 0.018,
  immediate = false,
}: {
  segments: MaskSegment[]
  className?: string
  delay?: number
  stagger?: number
  /** Play on mount instead of on scroll (for headings at the top of a page). */
  immediate?: boolean
}) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      SplitText.create(el, {
        type: 'words,chars',
        mask: 'words',
        wordsClass: 'sw',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.chars, {
            yPercent: 115,
            rotate: 7,
            duration: 1.05,
            ease: 'silk',
            stagger,
            delay,
            ...(immediate ? {} : { scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
          })
        },
      })
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className={className}>
      {segments.map((s, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <span className={s.accent ? 'italic text-accent' : undefined}>{s.text.trim()}</span>
        </span>
      ))}
    </span>
  )
}
