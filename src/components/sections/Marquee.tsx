'use client'

import { useRef } from 'react'
import { marqueeItems } from '@/data/resume'
import { gsap, ScrollTrigger, Observer, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * Marquee — the craft ticker as a GSAP loop that answers the scroll:
 * scrolling down drives it left and faster the harder you scroll,
 * scrolling up reverses it, and the type leans into the motion. When
 * scrolling stops it eases back to its cruising speed. You can also grab
 * it and drag it either way (Observer).
 */
export function Marquee() {
  const root = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const track = root.current?.querySelector('[data-track]') as HTMLElement
      // start far into the loop so it can run backwards indefinitely
      const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 38, repeat: -1 })
      loop.totalTime(loop.duration() * 200)

      const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' })
      let dir = 1
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const v = self.getVelocity()
          dir = self.direction
          const boost = 1 + Math.min(Math.abs(v) / 300, 7)
          gsap.to(loop, { timeScale: dir * boost, duration: 0.25, overwrite: true })
          gsap.to(loop, { timeScale: dir, duration: 1.4, delay: 0.25, ease: 'power2.out' })
          skew(gsap.utils.clamp(-8, 8, -v / 220))
          gsap.delayedCall(0.2, () => skew(0))
        },
      })

      // grab and drag the ticker (GSAP Observer): pointer or touch drags
      // scrub the loop directly, so the strip follows your hand
      const secondsPerPx = () => loop.duration() / (track.scrollWidth / 2)
      Observer.create({
        target: root.current,
        type: 'pointer,touch',
        dragMinimum: 3,
        onDrag: (self) => {
          loop.totalTime(loop.totalTime() - self.deltaX * secondsPerPx())
          skew(gsap.utils.clamp(-8, 8, self.deltaX * 0.6))
        },
        onRelease: () => skew(0),
      })
    },
    { scope: root },
  )

  const row = [...marqueeItems, ...marqueeItems]
  return (
    <div ref={root} className="relative cursor-grab touch-pan-y select-none overflow-hidden border-y border-fg/15 py-5 active:cursor-grabbing" aria-hidden="true">
      <div data-track className="flex w-max items-center gap-8 pr-8 will-change-transform">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className="font-display text-2xl font-semibold tracking-[-0.03em] text-fg/70">{item}</span>
            <span className="text-accent">✳</span>
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper to-transparent" />
    </div>
  )
}
