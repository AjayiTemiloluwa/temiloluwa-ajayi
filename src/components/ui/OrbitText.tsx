'use client'

import { useId, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * OrbitText — a ring of words that turns slowly around a centre mark.
 * Scrolling spins it faster (in the scroll's direction) and it eases back;
 * hovering or touching it makes it race, then settle.
 */
export function OrbitText({ words, className = '' }: { words: readonly string[]; className?: string }) {
  const root = useRef<HTMLDivElement | null>(null)
  const id = useId().replace(/:/g, '')
  const text = words.map((w) => w.toUpperCase()).join('  ×  ') + '  ×  '

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const ring = root.current!.querySelector('[data-ring]')
      const spin = gsap.to(ring, { rotation: 360, duration: 22, ease: 'none', repeat: -1, transformOrigin: '50% 50%' })
      const boost = (v: number) => gsap.to(spin, { timeScale: v, duration: 0.25, overwrite: true, onComplete: () => gsap.to(spin, { timeScale: 1, duration: 1.4, ease: 'power2.out' }) })
      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-8, 8, self.getVelocity() / 250)
          if (Math.abs(v) > 0.5) boost(v)
        },
      })
      const el = root.current!
      const race = () => boost(7)
      el.addEventListener('pointerenter', race)
      el.addEventListener('touchstart', race, { passive: true })
      return () => {
        st.kill()
        el.removeEventListener('pointerenter', race)
        el.removeEventListener('touchstart', race)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className={`select-none ${className}`} role="img" aria-label={words.join(', ')}>
      <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
        <defs>
          <path id={`orbit-${id}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="99" className="fill-accent" />
        <g data-ring>
          <text style={{ fill: 'rgb(var(--on-accent-rgb))', fontSize: 15.5, fontWeight: 700, letterSpacing: '0.18em' }}>
            <textPath href={`#orbit-${id}`} textLength={2 * Math.PI * 78 - 6} lengthAdjust="spacing">
              {text}
            </textPath>
          </text>
        </g>
        <circle cx="100" cy="100" r="9" style={{ fill: 'rgb(var(--on-accent-rgb))' }} />
      </svg>
    </div>
  )
}
