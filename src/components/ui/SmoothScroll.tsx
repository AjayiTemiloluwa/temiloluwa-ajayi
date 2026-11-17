'use client'

import { useEffect } from 'react'
import type Lenis from 'lenis'
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '@/lib/gsap'

/**
 * SmoothScroll — Lenis smooth scrolling on mouse and trackpad devices,
 * driven by GSAP's ticker so smooth scroll and every ScrollTrigger
 * (pins, scrubs, snaps) read the same scroll position on the same
 * frame. Touch devices keep native scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return

    let cancelled = false
    let lenis: Lenis | null = null
    const tick = (time: number) => lenis?.raf(time * 1000)

    import('lenis')
      .then(({ default: LenisCtor }) => {
        if (cancelled) return
        lenis = new LenisCtor({
          lerp: 0.09,
          wheelMultiplier: 1,
          syncTouch: false,
          // a pinned section (the gallery) can hold the page: wheel input is
          // then ignored here and that section steps through its own story.
          // (Not lenis.stop(): that sets overflow:clip, which blocks scripted
          // glides too and hides the scrollbar, shifting the whole layout.)
          virtualScroll: () => !document.documentElement.hasAttribute('data-scroll-hold'),
        })
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0)
        document.documentElement.classList.add('lenis', 'lenis-smooth')
        ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
      })
      .catch(() => {})

    return () => {
      cancelled = true
      gsap.ticker.remove(tick)
      lenis?.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
      document.documentElement.classList.remove('lenis', 'lenis-smooth')
    }
  }, [])

  return null
}
