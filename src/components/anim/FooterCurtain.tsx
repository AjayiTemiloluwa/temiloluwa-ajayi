'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * FooterCurtain — the cinematic closing reveal.
 *
 * The footer lives UNDER the page: as you scroll down, the content layer
 * above (opaque, z-10) wipes upward like a lifted curtain while the footer
 * stays put beneath it, so it reads as having been there all along.
 *
 * One scrubbed timeline drives it:
 *   · the stage counter-moves by exactly the scroll distance — it holds
 *     still under the lifting curtain — while it pushes in from 0.86 → 1
 *   · a black veil lifts off it (a fade up from darkness)
 *   · the curtain's bottom edge rounds off and casts a deep shadow
 *   · an accent glow blooms behind the headline
 * Then, once most of it is uncovered, the headline's words surge up out
 * of their line and the rest of the page follows in a stagger.
 *
 * Not sticky / fixed: the footer is in normal flow, so even a footer
 * taller than the screen can be scrolled through completely.
 */
export function FooterCurtain({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  const root = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const foot = root.current
      if (!foot || prefersReducedMotion()) return
      const q = gsap.utils.selector(foot)
      const stage = q('[data-curtain-stage]')[0] as HTMLElement | undefined
      if (!stage) return
      const veil = q('[data-curtain-veil]')
      const glow = q('[data-curtain-glow]')
      const curtain = foot.previousElementSibling as HTMLElement | null

      const vh = () => window.innerHeight
      const tall = () => foot.offsetHeight > vh()
      // how far the page scrolls while the curtain lifts
      const travel = () => Math.min(foot.offsetHeight, vh())

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: foot,
          start: 'top bottom',
          end: () => (tall() ? 'top top' : 'bottom bottom'),
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(stage, { y: () => -travel(), scale: 0.86, transformOrigin: '50% 60%' }, { y: 0, scale: 1 }, 0)
        .fromTo(veil, { opacity: 0.92 }, { opacity: 0, ease: 'power2.in' }, 0)
        .fromTo(glow, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ease: 'power2.out' }, 0.2)

      if (curtain) {
        const r = () => Math.round(Math.min(56, window.innerWidth * 0.07))
        tl.fromTo(
          curtain,
          {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '0px 0px 0px rgba(0,0,0,0)',
          },
          {
            borderBottomLeftRadius: r,
            borderBottomRightRadius: r,
            boxShadow: '0px 40px 80px rgba(0,0,0,0.55)',
            ease: 'power1.out',
          },
          0,
        )
      }

      // the headline surges up once most of the page is uncovered
      const words = q('[data-curtain-title] .fluid-word')
      const rise = q('[data-curtain-rise]')
      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: 'silk' },
      })
      intro
        .fromTo(words, { yPercent: 120, rotate: 7, autoAlpha: 0 }, { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 1.3, stagger: 0.07 }, 0)
        .fromTo(rise, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }, 0.35)

      gsap.timeline({
        scrollTrigger: {
          trigger: foot,
          start: () => (tall() ? 'top 45%' : 'bottom 140%'),
          invalidateOnRefresh: true,
          onEnter: () => intro.timeScale(1).play(),
          onLeaveBack: () => intro.timeScale(2).reverse(),
        },
      })

      return () => {
        if (curtain) gsap.set(curtain, { clearProps: 'borderBottomLeftRadius,borderBottomRightRadius,boxShadow' })
      }
    },
    { scope: root },
  )

  return (
    <footer ref={root} id={id} className={`relative z-0 overflow-hidden ${className}`}>
      <div data-curtain-stage className="relative will-change-transform">
        <div
          data-curtain-glow
          aria-hidden="true"
          className="pointer-events-none absolute left-[-10%] top-[-10%] h-[70%] w-[80%] rounded-full opacity-0 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgb(var(--accent-rgb) / 0.22), transparent)' }}
        />
        <div className="relative">{children}</div>
      </div>
      <div data-curtain-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-black opacity-0" />
    </footer>
  )
}
