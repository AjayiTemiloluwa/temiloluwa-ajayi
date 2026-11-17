'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * TimelineTrack — wraps a vertical list with a hand-drawn line down its
 * left edge. As you scroll through the list the line draws itself
 * (DrawSVG) and a glowing dot rides along it (MotionPath), so the
 * reader's progress through the record is literally traced.
 *
 * The path is rebuilt from the list's real height on every refresh, so
 * it always spans exactly the content.
 */
export function TimelineTrack({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const svg = el.querySelector('svg') as SVGSVGElement
      const paths = el.querySelectorAll<SVGPathElement>('[data-path]')
      const line = el.querySelector('[data-line]') as SVGPathElement
      const dot = el.querySelector('[data-dot]') as SVGGElement

      // a gentle S-curve, one bend per ~150px of list
      const build = () => {
        const h = Math.max(1, el.offsetHeight)
        svg.setAttribute('viewBox', `0 0 24 ${h}`)
        svg.style.height = `${h}px`
        const seg = 150
        let d = 'M12 0'
        for (let y = 0, k = 0; y < h; y += seg, k++) {
          const y2 = Math.min(h, y + seg)
          const x = k % 2 ? 4 : 20
          d += ` C ${x} ${y + (y2 - y) * 0.33}, ${x} ${y + (y2 - y) * 0.66}, 12 ${y2}`
        }
        paths.forEach((p) => p.setAttribute('d', d))
      }
      build()
      if (prefersReducedMotion()) return

      ScrollTrigger.addEventListener('refreshInit', build)
      const st = { trigger: el, start: 'top 72%', end: 'bottom 55%', scrub: 0.6, invalidateOnRefresh: true }
      gsap.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: st })
      gsap.to(dot, {
        motionPath: { path: line, align: line, alignOrigin: [0.5, 0.5] },
        ease: 'none',
        scrollTrigger: { ...st },
      })
      return () => ScrollTrigger.removeEventListener('refreshInit', build)
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative pl-7 sm:pl-10">
      <svg className="pointer-events-none absolute left-0 top-0 w-6 overflow-visible" aria-hidden="true">
        <path data-path fill="none" stroke="rgb(var(--fg-rgb) / 0.12)" strokeWidth="1.5" />
        <path data-path data-line fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="2" strokeLinecap="round" />
        <g data-dot>
          <circle r="9" fill="rgb(var(--accent-rgb) / 0.18)" />
          <circle r="4" fill="rgb(var(--accent-rgb))" />
        </g>
      </svg>
      {children}
    </div>
  )
}
