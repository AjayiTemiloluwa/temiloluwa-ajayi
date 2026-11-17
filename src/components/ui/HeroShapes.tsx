'use client'

import { useRef } from 'react'
import { gsap, Draggable, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * HeroShapes — the playful layer behind the hero name.
 *
 *  · The worm: a thick neon stroke that draws itself in (DrawSVG), then
 *    keeps morphing between squiggles (MorphSVG) and leans toward the
 *    pointer.
 *  · Four loose shapes float on the pointer at different depths. Grab one
 *    and throw it (Draggable + Inertia): it flies with momentum, spins,
 *    and after a moment springs back home with an elastic snap.
 */

const WORMS = [
  'M20,140 C90,40 160,40 220,110 S340,190 400,100 S520,20 580,80',
  'M20,90 C80,170 170,170 230,90 S330,10 410,80 S510,170 580,120',
  'M20,120 C110,60 140,170 240,130 S360,30 420,110 S540,150 580,60',
]

const SHAPES = [
  { key: 'pink', cls: 'left-[6%] top-[58%] h-14 w-14 rounded-full bg-pink sm:h-20 sm:w-20', depth: 0.06 },
  { key: 'orange', cls: 'right-[8%] top-[10%] h-12 w-24 rounded-full bg-orange sm:h-16 sm:w-32', depth: 0.1 },
  { key: 'lilac', cls: 'left-[46%] top-[4%] h-16 w-16 rounded-full border-[10px] border-lilac sm:h-24 sm:w-24 sm:border-[14px]', depth: 0.04 },
  { key: 'blue', cls: 'right-[30%] top-[70%] h-12 w-12 rotate-12 rounded-[14px] bg-blue sm:h-16 sm:w-16', depth: 0.08 },
]

export function HeroShapes() {
  const root = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const worm = q('[data-worm]')[0] as unknown as SVGPathElement
      const shapes = q('[data-shape]') as HTMLElement[]

      // the worm draws in, then morphs for ever
      gsap.fromTo(worm, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.8, ease: 'power3.inOut', delay: 0.4 })
      const morph = gsap.timeline({ repeat: -1, yoyo: true, delay: 2.2 })
      WORMS.slice(1).forEach((d) => morph.to(worm, { morphSVG: d, duration: 2.4, ease: 'sine.inOut' }))
      morph.to(worm, { morphSVG: WORMS[0], duration: 2.4, ease: 'sine.inOut' })

      // shapes pop in, then hover on the pointer at their own depth
      gsap.from(shapes, { scale: 0, rotate: -90, duration: 1.2, ease: 'back.out(2)', stagger: 0.12, delay: 1.2 })
      const movers = shapes.map((el) => ({
        el,
        depth: Number(el.dataset.depth),
        x: gsap.quickTo(el.parentElement, 'x', { duration: 1.2, ease: 'power3.out' }),
        y: gsap.quickTo(el.parentElement, 'y', { duration: 1.2, ease: 'power3.out' }),
      }))
      const wormSvg = q('[data-worm-svg]')[0]
      const wx = gsap.quickTo(wormSvg, 'x', { duration: 1.6, ease: 'power3.out' })
      const wy = gsap.quickTo(wormSvg, 'y', { duration: 1.6, ease: 'power3.out' })
      const onMove = (e: PointerEvent) => {
        const dx = e.clientX - window.innerWidth / 2
        const dy = e.clientY - window.innerHeight / 2
        movers.forEach((m) => {
          m.x(-dx * m.depth)
          m.y(-dy * m.depth)
        })
        wx(dx * 0.03)
        wy(dy * 0.03)
      }
      window.addEventListener('pointermove', onMove, { passive: true })

      // grab and throw — then home again
      const drags = shapes.map((el) =>
        Draggable.create(el, {
          type: 'x,y',
          inertia: true,
          bounds: root.current,
          edgeResistance: 0.6,
          onPress() {
            gsap.to(el, { scale: 1.15, duration: 0.2 })
          },
          onRelease() {
            gsap.to(el, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
          },
          onDrag() {
            gsap.set(el, { rotation: `+=${this.deltaX * 0.6}` })
          },
          onThrowUpdate() {
            gsap.set(el, { rotation: `+=${(this.deltaX ?? 0) * 0.4}` })
          },
          onThrowComplete() {
            gsap.to(el, { x: 0, y: 0, rotation: 0, duration: 1.4, delay: 1.2, ease: 'elastic.out(1, 0.35)' })
          },
        })[0],
      )

      return () => {
        window.removeEventListener('pointermove', onMove)
        drags.forEach((d) => d.kill())
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg data-worm-svg viewBox="0 0 600 200" className="pointer-events-none absolute right-[-8%] top-[6%] w-[78%] max-w-[900px] opacity-90 sm:right-[-4%]">
        <defs>
          <linearGradient id="worm-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgb(var(--accent-rgb))" />
            <stop offset="50%" stopColor="rgb(var(--blue-rgb))" />
            <stop offset="100%" stopColor="rgb(var(--lilac-rgb))" />
          </linearGradient>
        </defs>
        <path data-worm d={WORMS[0]} fill="none" stroke="url(#worm-grad)" strokeWidth="34" strokeLinecap="round" />
      </svg>
      {SHAPES.map((s) => (
        // the outer wrapper follows the pointer; the inner shape is the one you throw
        <div key={s.key} className={`absolute ${s.cls.split(' ').filter((c) => /^(left|right|top|bottom)-/.test(c)).join(' ')}`}>
          <div
            data-shape
            data-depth={s.depth}
            data-cursor="THROW"
            className={`pointer-events-auto cursor-grab touch-none active:cursor-grabbing ${s.cls.split(' ').filter((c) => !/^(left|right|top|bottom)-/.test(c)).join(' ')}`}
          />
        </div>
      ))}
    </div>
  )
}
