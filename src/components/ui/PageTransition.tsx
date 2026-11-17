'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { NAV_ROUTES } from '@/data/routes'

/**
 * PageTransition — the curtain between pages, never the same twice.
 *
 * Every page change picks one of five covers at random (never the one it
 * just used), and rolls its own direction, angle, colour order and
 * starting point, so no two transitions look alike:
 *
 *   panels    neon slabs sweep across from a random side, skewed by speed
 *   vortex    giant squares spin up out of nothing into a neon tunnel,
 *             then spin back out layer by layer
 *   pinwheel  eight wedges whirl in from every side like an iris, then
 *             twist away
 *   tiles     a grid of tiles flips in from a random point, then flips out
 *             from another
 *   blinds    stripes slash across at a random tilt, alternating sides
 *
 * The destination's name decodes in giant type over the cover, arriving at
 * a random spin and scale; a neon bar loads under it. Then the route swaps
 * behind the cover, and the cover's own reveal plays.
 *
 * Only internal page links take part (same-page # links, downloads, new
 * tabs and modified clicks are left alone). Back/forward plays a reveal
 * only. Reduced motion: no curtain at all.
 */

const LABELS: Record<string, string> = { '/': 'Home', ...Object.fromEntries(NAV_ROUTES.map((r) => [r.href, r.label])) }
const labelFor = (path: string) => LABELS[path] ?? path.replace(/^\//, '').replace(/-/g, ' ')

/** Jump to the very top, instantly — natively and inside Lenis. */
const toTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  ;(window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis?.scrollTo(0, { immediate: true, force: true })
}

const NEON = ['--pink-rgb', '--orange-rgb', '--lilac-rgb', '--accent-rgb', '--blue-rgb'].map((v) => `rgb(var(${v}))`)
const INK = 'rgb(14 16 15)'
const rand = gsap.utils.random
const sign = () => (Math.random() < 0.5 ? -1 : 1)

type Cover = { cover: (tl: gsap.core.Timeline) => void; reveal: (tl: gsap.core.Timeline) => void }
type Make = (stage: HTMLElement) => Cover

/** a full-screen layer (or any box) appended to the stage */
const layer = (stage: HTMLElement, css: Partial<CSSStyleDeclaration>) => {
  const d = document.createElement('div')
  Object.assign(d.style, { position: 'absolute', inset: '0', willChange: 'transform' }, css)
  stage.appendChild(d)
  return d
}
/** a dark veil that settles over busy covers so the name stays readable */
const veil = (stage: HTMLElement) => layer(stage, { background: INK, opacity: '0' })

const VARIANTS: Record<string, Make> = {
  panels(stage) {
    const dir = gsap.utils.random(['up', 'down', 'left', 'right']) as string
    const vertical = dir === 'up' || dir === 'down'
    const from = dir === 'up' || dir === 'left' ? 100 : -100
    const prop = vertical ? 'yPercent' : 'xPercent'
    const skew = vertical ? 'skewY' : 'skewX'
    const colors = [...gsap.utils.shuffle([...NEON]).slice(0, 4), INK]
    const els = colors.map((c) => layer(stage, { background: c }))
    gsap.set(els, { [prop]: from })
    return {
      cover: (tl) =>
        tl
          .to(els, { [prop]: 0, duration: 0.75, ease: 'power4.inOut', stagger: 0.08 }, 0)
          .fromTo(els, { [skew]: 7 * sign() }, { [skew]: 0, duration: 0.75, ease: 'power3.out', stagger: 0.08 }, 0),
      reveal: (tl) =>
        tl
          .to([...els].reverse(), { [prop]: -from, duration: 0.8, ease: 'power4.inOut', stagger: 0.07 }, 0)
          .fromTo([...els].reverse(), { [skew]: 0 }, { [skew]: -6 * sign(), duration: 0.4, ease: 'power2.in', stagger: 0.07, yoyo: true, repeat: 1 }, 0),
    }
  },

  vortex(stage) {
    const turn = sign()
    const round = Math.random() < 0.5 ? '0%' : '22%'
    const colors = [...gsap.utils.shuffle([...NEON]), INK]
    const els = colors.map((c) =>
      layer(stage, { inset: 'auto', left: '50%', top: '50%', width: '260vmax', height: '260vmax', background: c, borderRadius: round }),
    )
    els.forEach((el) => gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0, rotation: rand(-90, 90) }))
    return {
      cover: (tl) => tl.to(els, { scale: 1, rotation: `+=${turn * 200}`, duration: 0.95, ease: 'power3.inOut', stagger: 0.08 }, 0),
      reveal: (tl) =>
        tl.to([...els].reverse(), { scale: 0, rotation: `+=${turn * 220}`, duration: 0.85, ease: 'power3.in', stagger: 0.06 }, 0),
    }
  },

  pinwheel(stage) {
    const n = 8
    const turn = sign()
    const colors = gsap.utils.shuffle([...NEON])
    const wedge = (i: number) => {
      // a triangle from the centre out past the screen edge; R is huge so the
      // wedges cover the corners on any aspect ratio
      const a0 = ((i / n) * 360 - 1) * (Math.PI / 180)
      const a1 = (((i + 1) / n) * 360 + 1) * (Math.PI / 180)
      const pt = (a: number) => `${50 + Math.cos(a) * 160}% ${50 + Math.sin(a) * 160}%`
      return `polygon(50% 50%, ${pt(a0)}, ${pt((a0 + a1) / 2)}, ${pt(a1)})`
    }
    const els = Array.from({ length: n }, (_, i) => layer(stage, { background: colors[i % colors.length], clipPath: wedge(i) }))
    gsap.set(els, { transformOrigin: '50% 50%', scale: 0, rotation: () => turn * rand(120, 240) })
    const core = layer(stage, { inset: 'auto', left: '50%', top: '50%', width: '240vmax', height: '240vmax', borderRadius: '50%', background: INK })
    gsap.set(core, { xPercent: -50, yPercent: -50, scale: 0 })
    return {
      cover: (tl) =>
        tl
          .to(els, { scale: 1.02, rotation: 0, duration: 0.85, ease: 'power3.out', stagger: { each: 0.05, from: 'random' } }, 0)
          .to(core, { scale: 1, duration: 0.6, ease: 'power3.in' }, 0.45),
      reveal: (tl) =>
        tl
          .to(core, { scale: 0, duration: 0.55, ease: 'power3.in' }, 0)
          .to(els, { scale: 0, rotation: () => -turn * rand(140, 260), duration: 0.8, ease: 'power3.in', stagger: { each: 0.04, from: 'random' } }, 0.25),
    }
  },

  tiles(stage) {
    const cols = window.innerWidth > 760 ? 8 : 4
    const rows = Math.max(3, Math.round((cols * window.innerHeight) / window.innerWidth))
    const pick = () => NEON[Math.floor(Math.random() * NEON.length)]
    stage.style.perspective = '1200px'
    const els: HTMLElement[] = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        els.push(
          layer(stage, {
            inset: 'auto',
            left: `${(c / cols) * 100}%`,
            top: `${(r / rows) * 100}%`,
            width: `${100 / cols + 0.3}%`,
            height: `${100 / rows + 0.3}%`,
            background: Math.random() < 0.35 ? INK : pick(),
          }),
        )
    const v = veil(stage)
    const axis = Math.random() < 0.5 ? 'rotationX' : 'rotationY'
    const at = () => Math.floor(Math.random() * els.length)
    gsap.set(els, { [axis]: 90 * sign(), scale: 0.4, autoAlpha: 0 })
    return {
      cover: (tl) =>
        tl
          .to(els, { [axis]: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.6)', stagger: { grid: [rows, cols], from: at(), amount: 0.55 } }, 0)
          .to(v, { opacity: 0.88, duration: 0.4 }, 0.65),
      reveal: (tl) =>
        tl
          .to(v, { opacity: 0, duration: 0.3 }, 0)
          .to(els, { [axis === 'rotationX' ? 'rotationY' : 'rotationX']: -90 * sign(), scale: 0.3, autoAlpha: 0, duration: 0.5, ease: 'power3.in', stagger: { grid: [rows, cols], from: at(), amount: 0.5 } }, 0.1),
    }
  },

  blinds(stage) {
    const n = 9
    const angle = rand(-38, 38)
    const box = layer(stage, { inset: 'auto', left: '50%', top: '50%', width: '220vmax', height: '220vmax' })
    gsap.set(box, { xPercent: -50, yPercent: -50, rotation: angle })
    const colors = gsap.utils.shuffle([...NEON])
    const els = Array.from({ length: n }, (_, i) => {
      const d = document.createElement('div')
      Object.assign(d.style, { position: 'absolute', left: '0', right: '0', top: `${(i / n) * 100}%`, height: `${100 / n + 0.2}%`, background: colors[i % colors.length] })
      box.appendChild(d)
      return d
    })
    const v = veil(stage)
    els.forEach((el, i) => gsap.set(el, { scaleX: 0, transformOrigin: i % 2 ? '100% 50%' : '0% 50%' }))
    return {
      cover: (tl) =>
        tl
          .to(els, { scaleX: 1, duration: 0.6, ease: 'expo.inOut', stagger: { each: 0.05, from: Math.random() < 0.5 ? 'start' : 'end' } }, 0)
          .to(box, { rotation: angle + rand(-12, 12), duration: 1, ease: 'power2.out' }, 0)
          .to(v, { opacity: 0.86, duration: 0.4 }, 0.6),
      reveal: (tl) => {
        els.forEach((el, i) => gsap.set(el, { transformOrigin: i % 2 ? '0% 50%' : '100% 50%' }))
        tl.to(v, { opacity: 0, duration: 0.3 }, 0)
          .to(els, { scaleX: 0, duration: 0.55, ease: 'expo.inOut', stagger: { each: 0.04, from: 'center' } }, 0.05)
          .to(box, { rotation: `+=${rand(-25, 25)}`, scale: 1.15, duration: 0.8, ease: 'power2.in' }, 0)
      },
    }
  },
}
const NAMES = Object.keys(VARIANTS)

export function PageTransition() {
  const root = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const covering = useRef(false)
  const first = useRef(true)
  const pendingHash = useRef('')
  const active = useRef<Cover | null>(null)
  const lastName = useRef('')

  /** a fresh cover, never the same kind as the previous one */
  const build = () => {
    const el = root.current!
    const stage = el.querySelector<HTMLElement>('[data-stage]')!
    stage.innerHTML = ''
    stage.style.perspective = ''
    // (window.__transition can pin one variant, for testing)
    const forced = (window as unknown as { __transition?: string }).__transition
    const name = forced && VARIANTS[forced] ? forced : (gsap.utils.random(NAMES.filter((n) => n !== lastName.current)) as string)
    lastName.current = name
    el.dataset.variant = name
    active.current = VARIANTS[name](stage)
    return active.current
  }

  // leave: intercept internal page links
  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = root.current!
    const word = el.querySelector<HTMLElement>('[data-word]')!
    const bar = el.querySelector<HTMLElement>('[data-bar]')!

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return
      if (/\.(pdf|png|jpe?g|zip)$/i.test(url.pathname)) return
      e.preventDefault()
      e.stopPropagation()
      if (covering.current) return
      covering.current = true

      const cover = build()
      el.style.visibility = 'visible'
      const tl = gsap.timeline({
        onComplete: () => {
          toTop()
          pendingHash.current = url.hash
          router.push(url.pathname + url.search + url.hash, { scroll: !url.hash })
        },
      })
      cover.cover(tl)
      // the name: arrives at a random spin and scale, decoding as it lands
      tl.set(word, { textContent: '', autoAlpha: 1 }, 0)
        .fromTo(
          word,
          { rotation: rand(-28, 28), scale: rand(0.5, 1.7), yPercent: rand(-40, 40) },
          { rotation: 0, scale: 1, yPercent: 0, duration: 0.8, ease: 'back.out(1.7)' },
          0.35,
        )
        .to(word, { duration: 0.65, scrambleText: { text: labelFor(url.pathname), chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.8 } }, 0.4)
        .set(bar.parentElement, { autoAlpha: 1 }, 0)
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0.45)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  // enter: whenever the route changes, take the cover away
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (prefersReducedMotion()) return
    const el = root.current!
    const word = el.querySelector<HTMLElement>('[data-word]')!
    const bar = el.querySelector<HTMLElement>('[data-bar]')!
    const wasCovering = covering.current
    covering.current = false
    // the new page always opens at its top (or at its #anchor), whatever the old
    // page's scroll was — set again now that the new page is in the document
    const hash = pendingHash.current
    pendingHash.current = ''
    const place = () => {
      const target = hash ? document.querySelector<HTMLElement>(hash) : null
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
        ;(window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis?.scrollTo(y, { immediate: true, force: true })
      } else if (wasCovering) toTop()
    }
    place()
    requestAnimationFrame(place)

    el.style.visibility = 'visible'
    let cover = active.current
    if (!wasCovering || !cover) {
      // back / forward: build a cover, snap it shut, then reveal — still a cut
      cover = build()
      const snap = gsap.timeline()
      cover.cover(snap)
      snap.progress(1).kill()
      word.textContent = labelFor(pathname)
      gsap.set(word, { autoAlpha: 1, rotation: 0, scale: 1, yPercent: 0 })
    }
    const c = cover
    const tl = gsap.timeline({
      delay: wasCovering ? 0.12 : 0.05,
      onComplete: () => {
        el.style.visibility = 'hidden'
        el.querySelector('[data-stage]')!.innerHTML = ''
        active.current = null
      },
    })
    tl.to(word, { rotation: rand(-20, 20), scale: rand(1.2, 1.6), autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0)
      .to(bar.parentElement, { autoAlpha: 0, duration: 0.3 }, 0)
    const reveal = gsap.timeline()
    c.reveal(reveal)
    tl.add(reveal, 0.15)
  }, [pathname])

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" style={{ visibility: 'hidden' }}>
      <div data-stage className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6">
        <p
          data-word
          className="text-center font-display text-[clamp(3rem,13vw,11rem)] font-bold leading-none tracking-[-0.05em] text-[rgb(255_252_225)] [text-shadow:0_6px_40px_rgb(0_0_0/0.35)]"
        />
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
          <div data-bar className="h-full w-full origin-left rounded-full bg-[rgb(10_228_72)]" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </div>
  )
}
