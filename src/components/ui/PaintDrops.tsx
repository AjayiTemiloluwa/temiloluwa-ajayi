'use client'

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { Dices, X } from 'lucide-react'
import { gsap, Draggable, prefersReducedMotion } from '@/lib/gsap'
import { DEFAULT_PALETTE, PALETTES, paletteById, type Palette } from '@/lib/palettes'

/**
 * PaintDrops — choose the site's colour by throwing paint at it.
 *
 * A paint-drop button in the nav opens a wheel of eight paint drops. Three ways to choose:
 *   · tap a drop          the new colour floods the whole page outward from that drop
 *   · drag a drop out     fling it anywhere on the page: it splats there and floods from the splat
 *   · spin the wheel      flick it (it keeps spinning, then settles); the drop under the ▼ wins.
 *                          The dice spins it for you.
 * The flood is a View Transition (the new colours open as a circle from the point); browsers
 * without it get the splash only. Keyboard: arrows move round the wheel, Enter/Space throws,
 * Esc closes. Reduced motion: colours change instantly, no splash. The choice is remembered.
 */

const RING = 248 // wheel diameter
const R = 96 // radius drops sit on
const STEP = 360 / PALETTES.length

const rgb = (t: string, a = 1) => `rgb(${t} / ${a})`
const isDark = () => document.documentElement.dataset.theme === 'dark'
const shade = (p: Palette) => (isDark() ? p.dark : p.light)
const current = () => document.documentElement.dataset.palette ?? DEFAULT_PALETTE

/** Paint splats at a point: a ring, a burst of droplets under gravity, and a blot that fades. */
function splat(x: number, y: number, color: string) {
  if (prefersReducedMotion()) return
  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '9998', overflow: 'hidden' })
  document.body.appendChild(layer)
  const blob = (size: number, extra: Partial<CSSStyleDeclaration> = {}) => {
    const d = document.createElement('div')
    Object.assign(d.style, { position: 'absolute', left: `${x - size / 2}px`, top: `${y - size / 2}px`, width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: color }, extra)
    layer.appendChild(d)
    return d
  }
  const blot = blob(70)
  const ring = blob(40, { background: 'transparent', border: `3px solid ${color}` })
  const drops = Array.from({ length: 22 }, () => blob(gsap.utils.random(6, 16)))
  const tl = gsap.timeline({ onComplete: () => layer.remove() })
  tl.fromTo(blot, { scale: 0 }, { scale: 1.4, duration: 0.25, ease: 'back.out(3)' }, 0)
    .to(blot, { scale: 0.2, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 0.35)
    .fromTo(ring, { scale: 0.4 }, { scale: 9, autoAlpha: 0, borderWidth: 0.5, duration: 0.8, ease: 'expo.out' }, 0)
    .to(drops, {
      physics2D: { velocity: () => gsap.utils.random(260, 620), angle: () => gsap.utils.random(-170, -10), gravity: 1400 },
      scale: () => gsap.utils.random(0.3, 1.1),
      autoAlpha: 0,
      duration: 1.1,
      ease: 'none',
    }, 0)
}

/** Apply a palette, flooding outward from (x, y) where the browser can. */
function throwPaint(p: Palette, x: number, y: number) {
  const root = document.documentElement
  const set = () => {
    if (p.id === DEFAULT_PALETTE) delete root.dataset.palette
    else root.dataset.palette = p.id
    try { localStorage.setItem('palette', p.id) } catch { /* storage blocked: still applies for this visit */ }
    window.dispatchEvent(new CustomEvent('palette-change', { detail: p.id }))
  }
  const color = rgb(shade(p))
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
  if (prefersReducedMotion() || !doc.startViewTransition) {
    set()
    splat(x, y, color)
    return
  }
  const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  root.dataset.paintFlood = ''
  const t = doc.startViewTransition(set)
  t.ready
    .then(() => {
      splat(x, y, color)
      const anim = root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${far}px at ${x}px ${y}px)`] },
        { duration: 950, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      )
      anim.finished.finally(() => delete root.dataset.paintFlood)
    })
    .catch(() => delete root.dataset.paintFlood)
}

export function PaintDrops() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(DEFAULT_PALETTE)
  const [focus, setFocus] = useState(0)
  const [, setTick] = useState(0) // re-render when the theme flips (drops show that theme's shade)
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const wheel = useRef<HTMLDivElement>(null)
  const drag = useRef<Draggable | null>(null)
  const dropRefs = useRef<(HTMLButtonElement | null)[]>([])
  const titleId = useId()

  useEffect(() => {
    const sync = () => setActive(current())
    sync()
    window.addEventListener('palette-change', sync)
    const mo = new MutationObserver(() => setTick((n) => n + 1))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => { window.removeEventListener('palette-change', sync); mo.disconnect() }
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    button.current?.focus()
  }, [])

  // which drop sits under the ▼ for a wheel rotation
  const atTop = (rotation: number) => {
    const i = Math.round(-rotation / STEP)
    return ((i % PALETTES.length) + PALETTES.length) % PALETTES.length
  }

  const throwFrom = (p: Palette, el?: Element | null) => {
    const b = (el ?? button.current)?.getBoundingClientRect()
    throwPaint(p, b ? b.left + b.width / 2 : innerWidth / 2, b ? b.top + b.height / 2 : innerHeight / 2)
    setActive(p.id)
  }

  // open: pop the drops out of the centre, make the wheel spinnable, close on Esc / outside
  useEffect(() => {
    if (!open || !wheel.current) return
    const reduce = prefersReducedMotion()
    const start = PALETTES.findIndex((p) => p.id === current())
    setFocus(Math.max(0, start))
    gsap.set(wheel.current, { rotation: -Math.max(0, start) * STEP })
    if (!reduce) {
      gsap.fromTo(panel.current, { scale: 0.6, autoAlpha: 0, transformOrigin: '90% 0%' }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.8)' })
      gsap.fromTo(dropRefs.current, { x: 0, y: 0, scale: 0 }, { x: (i) => dropX(i), y: (i) => dropY(i), scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.55)', stagger: 0.04, delay: 0.08 })
    }
    drag.current = Draggable.create(wheel.current, {
      type: 'rotation',
      inertia: true,
      trigger: wheel.current.querySelector('[data-spin]') as Element,
      snap: (v: number) => Math.round(v / STEP) * STEP,
      // the hub names whatever is passing under the ▼ while it spins
      onDrag() { setFocus(atTop(this.rotation)) },
      onThrowUpdate() { setFocus(atTop(this.rotation)) },
      onThrowComplete() {
        const i = atTop(this.rotation)
        setFocus(i)
        throwFrom(PALETTES[i], wheel.current?.parentElement?.querySelector('[data-pointer]'))
      },
    })[0]
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (panel.current?.contains(t) || button.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    requestAnimationFrame(() => dropRefs.current[Math.max(0, start)]?.focus())
    return () => {
      drag.current?.kill()
      drag.current = null
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close])

  const dropX = (i: number) => Math.sin((i * STEP * Math.PI) / 180) * R
  const dropY = (i: number) => -Math.cos((i * STEP * Math.PI) / 180) * R

  /** Roll the dice: the wheel spins hard and lands on a random other colour. */
  const roll = () => {
    if (!wheel.current) return
    const others = PALETTES.map((_, i) => i).filter((i) => PALETTES[i].id !== active)
    const pick = others[Math.floor(Math.random() * others.length)]
    const from = gsap.getProperty(wheel.current, 'rotation') as number
    const base = Math.round(from / 360) * 360
    const to = base - 360 * (3 + Math.floor(Math.random() * 2)) - pick * STEP
    const land = () => {
      setFocus(pick)
      throwFrom(PALETTES[pick], wheel.current?.parentElement?.querySelector('[data-pointer]'))
    }
    if (prefersReducedMotion()) { gsap.set(wheel.current, { rotation: -pick * STEP }); land(); return }
    gsap.to(wheel.current, { rotation: to, duration: 2.2, ease: 'power4.out', onComplete: land })
  }

  /** Dragging a drop off the wheel: a glob of paint follows the pointer; let go on the page to splat. */
  const startGlob = (e: RPointerEvent<HTMLButtonElement>, p: Palette) => {
    if (e.button !== 0) return
    const sx = e.clientX
    const sy = e.clientY
    let glob: HTMLDivElement | null = null
    let lx = sx
    let ly = sy
    const move = (ev: PointerEvent) => {
      if (!glob && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        glob = document.createElement('div')
        Object.assign(glob.style, {
          position: 'fixed', left: '0', top: '0', width: '44px', height: '44px', margin: '-22px 0 0 -22px', borderRadius: '50%',
          background: rgb(shade(p)), boxShadow: `0 10px 30px ${rgb(shade(p), 0.5)}`, pointerEvents: 'none', zIndex: '9999',
        })
        document.body.appendChild(glob)
      }
      if (glob) {
        const vx = ev.clientX - lx
        const vy = ev.clientY - ly
        const speed = Math.min(1, Math.hypot(vx, vy) / 40)
        gsap.set(glob, { x: ev.clientX, y: ev.clientY, rotation: (Math.atan2(vy, vx) * 180) / Math.PI, scaleX: 1 + speed * 0.6, scaleY: 1 - speed * 0.3 })
      }
      lx = ev.clientX
      ly = ev.clientY
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (!glob) return // a plain tap: onClick throws it
      const g = glob
      const inside = panel.current?.contains(document.elementFromPoint(ev.clientX, ev.clientY))
      suppressClick.current = true
      if (inside) {
        gsap.to(g, { scale: 0, duration: 0.3, ease: 'back.in(2)', onComplete: () => g.remove() })
        return
      }
      g.remove()
      throwPaint(p, ev.clientX, ev.clientY)
      setActive(p.id)
      setOpen(false)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  const suppressClick = useRef(false)

  const onDropKey = (e: RKeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const n = (i + step + PALETTES.length) % PALETTES.length
    setFocus(n)
    dropRefs.current[n]?.focus()
    if (wheel.current) gsap.to(wheel.current, { rotation: -n * STEP, duration: prefersReducedMotion() ? 0 : 0.45, ease: 'back.out(1.6)' })
  }

  const me = paletteById(active)
  const shown = paletteById(PALETTES[focus]?.id)

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Colour: ${me.name}. Choose a paint colour`}
        data-cursor="PAINT"
        className="icon-btn group"
      >
        <svg viewBox="0 0 24 24" className="h-[19px] w-[19px] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" aria-hidden="true">
          <path d="M12 2.5c3.6 4.3 6.5 7.8 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7C5.5 10.3 8.4 6.8 12 2.5Z" fill="rgb(var(--accent-rgb))" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="9.6" cy="14.2" r="1.4" fill="rgb(var(--bg-rgb) / 0.7)" />
        </svg>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="fixed right-3 top-[76px] z-[9990] w-[min(320px,calc(100vw-24px))] rounded-[28px] border border-fg/15 bg-paper/95 p-5 text-fg shadow-[0_30px_80px_rgb(0_0_0/0.35)] backdrop-blur-xl sm:right-6"
        >
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <p id={titleId} className="font-display text-xl leading-tight">Throw some paint</p>
              <p className="mt-1 text-[12px] leading-snug text-fg/60">Tap a drop, drag one onto the page, or spin the wheel.</p>
            </div>
            <button type="button" onClick={close} aria-label="Close" className="icon-btn !h-9 !w-9"><X className="h-4 w-4" aria-hidden="true" /></button>
          </div>

          <div className="relative mx-auto my-3" style={{ width: RING, height: RING }}>
            {/* the pointer: whatever lands under it wins */}
            <span data-pointer aria-hidden="true" className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2 text-lg leading-none text-fg">▼</span>
            <div ref={wheel} className="absolute inset-0" style={{ touchAction: 'none' }}>
              {/* the spin surface */}
              <div data-spin className="absolute inset-0 cursor-grab rounded-full border border-dashed border-fg/20 active:cursor-grabbing" style={{ background: `conic-gradient(${PALETTES.map((p, i) => `${rgb(shade(p), 0.18)} ${i * STEP}deg ${(i + 1) * STEP}deg`).join(', ')})` }} aria-hidden="true" />
              <div role="radiogroup" aria-label="Paint colours">
                {PALETTES.map((p, i) => {
                  const on = p.id === active
                  return (
                    <button
                      key={p.id}
                      ref={(el) => { dropRefs.current[i] = el }}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={`${p.name}: ${p.vibe}`}
                      title={`${p.name} · ${p.vibe}`}
                      tabIndex={i === focus ? 0 : -1}
                      onPointerDown={(e) => startGlob(e, p)}
                      onClick={(e) => {
                        if (suppressClick.current) { suppressClick.current = false; return }
                        setFocus(i)
                        throwFrom(p, e.currentTarget)
                      }}
                      onKeyDown={(e) => onDropKey(e, i)}
                      className="absolute left-1/2 top-1/2 z-10 -ml-[22px] -mt-[22px] h-11 w-11 rounded-full outline-none transition-[box-shadow] focus-visible:ring-4 focus-visible:ring-fg/40"
                      style={{
                        transform: `translate(${dropX(i)}px, ${dropY(i)}px)`,
                        background: `radial-gradient(circle at 35% 30%, ${rgb('255 255 255', 0.55)}, transparent 42%), ${rgb(shade(p))}`,
                        boxShadow: on ? `0 0 0 3px rgb(var(--bg-rgb)), 0 0 0 6px ${rgb(shade(p))}, 0 8px 24px ${rgb(shade(p), 0.5)}` : `0 6px 16px ${rgb(shade(p), 0.35)}`,
                        borderRadius: '50% 50% 50% 50% / 58% 58% 42% 42%',
                        touchAction: 'none',
                      }}
                    />
                  )
                })}
              </div>
            </div>
            {/* the hub: the colour under the pointer, and the dice */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-fg/10 bg-paper text-center shadow-inner">
              <span className="font-display text-[15px] leading-tight" style={{ color: rgb(shade(shown)) }}>{shown.name}</span>
              <span className="mt-0.5 px-2 text-[10px] leading-tight text-fg/65">{shown.vibe}</span>
              <button type="button" onClick={roll} className="pointer-events-auto mt-1.5 inline-flex items-center gap-1 rounded-full border border-fg/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg/75 transition hover:border-fg hover:text-fg" aria-label="Surprise me: spin the wheel">
                <Dices className="h-3 w-3" aria-hidden="true" /> Spin
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-fg/65">Light or dark? The moon/sun button keeps working with every colour.</p>
        </div>,
        document.body,
      )}
    </>
  )
}
