'use client'

import { useRef } from 'react'
import { FluidText } from '@/components/effects/fluid'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import type { MaskSegment } from '@/components/anim/MaskText'

/**
 * FluidTitle — a page title that behaves like the hero name: its glyphs
 * ripple away from the cursor and part around the finger on touch
 * (FluidText), after its words rise and un-tilt into place on load.
 * `accent: true` segments are set italic in the accent colour.
 */
export function FluidTitle({
  segments,
  strength = 22,
  radius = 160,
}: {
  segments: MaskSegment[]
  strength?: number
  radius?: number
}) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from(gsap.utils.selector(ref)('.fluid-word'), {
        yPercent: 115,
        rotate: 8,
        autoAlpha: 0,
        duration: 1.25,
        ease: 'silk',
        stagger: 0.09,
        delay: 0.1,
      })
    },
    { scope: ref },
  )

  return (
    <span ref={ref}>
      {segments.map((s, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <span className={s.accent ? 'italic text-accent' : undefined}>
            <FluidText text={s.text.trim()} strength={strength} radius={radius} />
          </span>
        </span>
      ))}
    </span>
  )
}
