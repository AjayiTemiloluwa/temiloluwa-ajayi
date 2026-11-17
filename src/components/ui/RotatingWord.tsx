'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * RotatingWord — a typewriter (GSAP TextPlugin): each intersection is
 * typed out, held, then erased before the next, with a blinking caret.
 * Vision, not inventory: the phrases sweep the span of the work.
 * Reduced motion: the first phrase, still.
 */
const PHRASES = [
  'AI and automation at Sankore.',
  'an M.Sc in financial engineering.',
  'machine learning for drilling safety.',
  'a paper from my fracturing-fluid thesis.',
]

export function RotatingWord() {
  const root = useRef<HTMLSpanElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const text = root.current?.querySelector('[data-type]') as HTMLElement
      const caret = root.current?.querySelector('[data-caret]') as HTMLElement
      gsap.to(caret, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' })

      const tl = gsap.timeline({ repeat: -1, delay: 2.4 })
      PHRASES.forEach((phrase, i) => {
        const next = PHRASES[(i + 1) % PHRASES.length]
        tl.to({}, { duration: 2.2 }) // hold
          .to(text, { text: { value: '' }, duration: phrase.length * 0.018, ease: 'none' })
          .to(text, { text: { value: next }, duration: next.length * 0.045, ease: 'none' })
      })
    },
    { scope: root },
  )

  return (
    <span ref={root} className="block italic text-accent" aria-live="off">
      <span data-type>{PHRASES[0]}</span>
      <span data-caret className="ml-0.5 inline-block w-[0.06em] translate-y-[0.08em] bg-accent not-italic" style={{ height: '0.9em' }} aria-hidden="true" />
    </span>
  )
}
