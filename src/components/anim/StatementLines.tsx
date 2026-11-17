'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * StatementLines — a few short display lines, each in its own mask. As the
 * block scrolls in, each line rises out of its mask and un-tilts, one after
 * another, scrubbed with the scroll (so scrolling back lowers them again).
 */
export function StatementLines({ lines }: { lines: { text: string; tone: string }[] }) {
  const root = useRef<HTMLSpanElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const inner = gsap.utils.toArray<HTMLElement>('[data-line]', root.current)
      gsap.fromTo(
        inner,
        { yPercent: 105, rotate: 3 },
        {
          yPercent: 0,
          rotate: 0,
          ease: 'power3.out',
          stagger: 0.25,
          scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 40%', scrub: 0.8 },
        },
      )
    },
    { scope: root },
  )

  return (
    <span ref={root} className="block">
      {lines.map((l) => (
        // the mask: tall enough for descenders, clipped at its edges
        <span key={l.text} className="block overflow-hidden pb-[0.08em]">
          <span data-line className={`block origin-left will-change-transform ${l.tone}`}>
            {l.text}
          </span>
        </span>
      ))}
    </span>
  )
}
