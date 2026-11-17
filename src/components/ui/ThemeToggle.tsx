'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

type Theme = 'light' | 'dark'

/**
 * ThemeToggle — switches between the light and dark palettes, and
 * morphs its icon (GSAP MorphSVG): the moon's crescent swells into the
 * sun's disc while the rays spin out, and back again.
 *
 * The theme lives on <html data-theme>; a tiny script in the layout sets
 * it before first paint, so there is no flash. This button flips it and
 * remembers the choice.
 */
const MOON = 'M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a6.6 6.6 0 0 0 10.8 10.8Z'
const SUN = 'M12 7a5 5 0 1 1 0 10a5 5 0 1 1 0-10Z'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)
  const core = useRef<SVGPathElement | null>(null)
  const rays = useRef<SVGGElement | null>(null)

  const paint = (t: Theme, animate: boolean) => {
    const d = animate && !prefersReducedMotion() ? 0.7 : 0
    // light theme offers the moon (go dark); dark theme offers the sun
    gsap.to(core.current, { morphSVG: t === 'dark' ? SUN : MOON, duration: d, ease: 'power3.inOut' })
    gsap.to(rays.current, {
      scale: t === 'dark' ? 1 : 0,
      rotate: t === 'dark' ? 0 : -90,
      autoAlpha: t === 'dark' ? 1 : 0,
      transformOrigin: '50% 50%',
      duration: d,
      ease: 'back.out(2)',
    })
  }

  useEffect(() => {
    const t: Theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    setTheme(t)
    paint(t, false)
  }, [])

  const toggle = () => {
    const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // storage blocked — the choice still applies for this visit
    }
    setTheme(next)
    paint(next, true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      data-cursor="THEME"
      className="icon-btn"
    >
      <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] transition-opacity ${theme ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
        <path ref={core} d={MOON} fill="currentColor" />
        <g ref={rays} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: 0 }}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4
            return (
              <line
                key={i}
                x1={(12 + Math.cos(a) * 8).toFixed(2)}
                y1={(12 + Math.sin(a) * 8).toFixed(2)}
                x2={(12 + Math.cos(a) * 10.5).toFixed(2)}
                y2={(12 + Math.sin(a) * 10.5).toFixed(2)}
              />
            )
          })}
        </g>
      </svg>
    </button>
  )
}
