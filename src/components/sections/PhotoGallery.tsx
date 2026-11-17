'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { plates } from '@/data/photos'
import { FilmReel } from '@/components/ui/FilmReel'
import { gsap, ScrollTrigger, Observer, useGSAP, glide, holdScroll } from '@/lib/gsap'

/**
 * PhotoGallery — the photo essay as a photo book. It never takes over the
 * page by itself.
 *
 *  · Scroll past — the tiles fly in and lock into a tilted wall; keep
 *    scrolling and the photos gather into a 3D spiral staircase that turns
 *    and sinks away, darkening as they face away (scrubbed, no stops).
 *  · Click a photo — it lifts off the wall and flies onto the right-hand
 *    page of a book, and the book swings open: caption page on the left,
 *    photograph on the right.
 *  · Turn the pages — each wheel notch, swipe or arrow key turns ONE page
 *    in 3D around the spine, shaded as it bends. A gesture that arrives
 *    mid-turn is queued, so fast scrolling flows page to page instead of
 *    being swallowed.
 *  · Close — Esc, ×, or turning past either end: the book folds shut and
 *    the photo flies back into its place on the wall.
 *
 * Reduced motion: no movement — the wall is a plain grid.
 */

const N = plates.length
const TURN = 0.9 // seconds per page turn

export function PhotoGallery() {
  const root = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const spiralEl = q('[data-spiral]')[0] as HTMLElement
        const wall = q('[data-wall]')[0] as HTMLElement
        const tiles = q('[data-tile]') as HTMLElement[]
        const inners = q('[data-tile-inner]') as HTMLElement[]
        const head = q('[data-head]')[0] as HTMLElement
        const counter = q('[data-counter]')[0] as HTMLElement
        const bar = q('[data-bar]')[0] as HTMLElement
        const hint = q('[data-hint]')[0] as HTMLElement
        const closeBtn = q('[data-close]')[0] as HTMLButtonElement
        // the book
        const viewer = q('[data-viewer]')[0] as HTMLElement
        const leftPage = q('[data-left]')[0] as HTMLElement
        const rightPage = q('[data-right]')[0] as HTMLElement
        const leaf = q('[data-leaf]')[0] as HTMLElement
        const L = q('[data-l]') as HTMLElement[] // caption pages
        const R = q('[data-r]') as HTMLElement[] // photo pages
        const LF = q('[data-lf]') as HTMLElement[] // leaf front (photo)
        const LB = q('[data-lb]') as HTMLElement[] // leaf back (caption)
        const shadeFront = q('[data-shade-front]')[0] as HTMLElement
        const shadeBack = q('[data-shade-back]')[0] as HTMLElement
        const shadeUnder = q('[data-shade-under]')[0] as HTMLElement
        const mcap = q('[data-mcap]')[0] as HTMLElement

        const show = (list: HTMLElement[], i: number) => list.forEach((el, j) => (el.style.visibility = j === i ? 'visible' : 'hidden'))
        const REST = { rotateX: 22, rotateZ: -2, scale: 0.92 }
        gsap.set(wall, { ...REST, transformOrigin: '50% 50%' })
        gsap.set(viewer, { autoAlpha: 0 })
        gsap.set(closeBtn, { autoAlpha: 0 })
        gsap.set(leaf, { autoAlpha: 0, transformOrigin: '0% 50%', rotationY: 0 })
        gsap.set(leftPage, { transformOrigin: '100% 50%' })

        // ── 1. assemble: tiles fly in from a scatter as the section approaches
        gsap.from(tiles, {
          x: () => gsap.utils.random(-window.innerWidth * 0.6, window.innerWidth * 0.6),
          y: () => gsap.utils.random(window.innerHeight * 0.3, window.innerHeight * 0.9),
          rotate: () => gsap.utils.random(-28, 28),
          scale: 0.4,
          autoAlpha: 0,
          ease: 'power3.out',
          stagger: { each: 0.04, from: 'center' },
          scrollTrigger: { trigger: root.current, start: 'top 95%', end: 'top 15%', scrub: 1, invalidateOnRefresh: true },
        })

        // ── 2. scroll past: the wall becomes a 3D spiral staircase of photos
        //    that turns and sinks away (fully scrubbed, nothing to get stuck on)
        //      · the wall stands up and the photos gather around one axis,
        //        each a step lower than the last, fanned around a cylinder
        //      · the whole helix turns as it sinks into the depth
        //      · photos facing away from you darken, like paper turning in light
        const NT = tiles.length
        const tileW = () => tiles[0].offsetWidth
        const radius = () => (NT * tileW() * 1.12) / (2 * Math.PI)
        const offX = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2 - wall.offsetWidth / 2
        const offY = (el: HTMLElement) => el.offsetTop + el.offsetHeight / 2 - wall.offsetHeight / 2
        const shade = () => {
          const wy = Number(gsap.getProperty(wall, 'rotationY')) || 0
          tiles.forEach((t, i) => {
            const ty = Number(gsap.getProperty(t, 'rotationY')) || 0
            const facing = Math.cos(((ty + wy) * Math.PI) / 180)
            inners[i].style.filter = ty === 0 && wy === 0 ? '' : `brightness(${(0.32 + 0.68 * Math.max(0, facing)).toFixed(2)})`
          })
        }
        const spiral = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: shade,
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * 1.1}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        spiral
          .fromTo(
            wall,
            { rotateX: REST.rotateX, rotateZ: REST.rotateZ, rotationY: 0, y: 0, scale: REST.scale },
            { rotateX: 8, rotateZ: 0, scale: 0.92, duration: 0.35, ease: 'power2.inOut', immediateRender: false },
            0,
          )
          .fromTo(
            tiles,
            { x: 0, y: 0, rotationY: 0, rotation: 0, scale: 1, transformOrigin: '50% 50% 0px' },
            {
              x: (_, el) => -offX(el),
              y: (i, el) => -offY(el) + (i - (NT - 1) / 2) * tileW() * 0.3,
              rotationY: (i) => (i * 360) / NT,
              transformOrigin: () => `50% 50% ${-radius()}px`,
              scale: 0.95,
              duration: 0.42,
              ease: 'power3.inOut',
              stagger: { each: 0.012, from: 'center' },
              immediateRender: false,
            },
            0,
          )
          .to(wall, { rotationY: 330, rotateX: 20, y: () => window.innerHeight * 0.42, scale: 0.55, duration: 0.6, ease: 'power2.in' }, 0.36)
          .to(head, { y: -60, autoAlpha: 0, duration: 0.4 }, 0.2)
          .to(spiralEl, { autoAlpha: 0, duration: 0.18 }, 0.84)

        // ── 3. the book ─────────────────────────────────────────────────
        let open = false
        let busy = false
        let index = 0
        let queued: 1 | -1 | 0 = 0

        const hud = () => {
          counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`
          gsap.to(bar, { scaleX: (index + 1) / N, duration: 0.6, ease: 'power2.out' })
          const p = plates[index]
          mcap.textContent = `${String(index + 1).padStart(2, '0')} · ${p.tag} — ${p.place}`
        }
        const spread = (k: number) => {
          show(L, k)
          show(R, k)
          gsap.set(leaf, { autoAlpha: 0, rotationY: 0 })
        }
        const settle = () => {
          busy = false
          if (queued && open) {
            const d = queued
            queued = 0
            turn(d)
          }
        }

        /** turn one page: +1 forward (right page over to the left), −1 back */
        function turn(dir: 1 | -1) {
          if (!open) return
          if (busy) {
            queued = dir // remember one gesture; it plays the moment this turn lands
            return
          }
          const to = index + dir
          if (to < 0 || to >= N) return close()
          busy = true
          const from = index
          index = to
          hud()
          const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: settle })
          if (dir > 0) {
            // the right page lifts and turns over to the left; the next photo lies beneath
            show(LF, from)
            show(LB, to)
            show(R, to)
            gsap.set(leaf, { autoAlpha: 1, rotationY: 0, z: 0 })
            tl.to(leaf, { rotationY: -180, duration: TURN }, 0)
              .to(leaf, { z: 40, duration: TURN / 2, ease: 'sine.out', yoyo: true, repeat: 1 }, 0)
              .fromTo(shadeFront, { opacity: 0 }, { opacity: 0.55, duration: TURN / 2, ease: 'sine.in' }, 0)
              .fromTo(shadeBack, { opacity: 0.55 }, { opacity: 0, duration: TURN / 2, ease: 'sine.out' }, TURN / 2)
              .fromTo(shadeUnder, { opacity: 0.6 }, { opacity: 0, duration: TURN, ease: 'power1.out' }, 0)
              .add(() => spread(to))
          } else {
            // the left page lifts and turns back over to the right
            show(LF, to)
            show(LB, from)
            show(L, to)
            gsap.set(leaf, { autoAlpha: 1, rotationY: -180, z: 0 })
            tl.to(leaf, { rotationY: 0, duration: TURN }, 0)
              .to(leaf, { z: 40, duration: TURN / 2, ease: 'sine.out', yoyo: true, repeat: 1 }, 0)
              .fromTo(shadeBack, { opacity: 0 }, { opacity: 0.55, duration: TURN / 2, ease: 'sine.in' }, 0)
              .fromTo(shadeFront, { opacity: 0.55 }, { opacity: 0, duration: TURN / 2, ease: 'sine.out' }, TURN / 2)
              .add(() => spread(to))
          }
        }

        // a photo that flies between the wall and the book (FLIP by hand)
        const flyer = (k: number) => {
          const img = tiles[k].querySelector('img') as HTMLImageElement
          const el = document.createElement('div')
          el.className = 'pointer-events-none fixed z-[60] overflow-hidden bg-mist shadow-2xl'
          const im = document.createElement('img')
          im.src = img.currentSrc || img.src
          im.alt = ''
          im.className = 'h-full w-full object-cover'
          el.appendChild(im)
          document.body.appendChild(el)
          return el
        }
        const box = (el: HTMLElement) => {
          const r = el.getBoundingClientRect()
          return { left: r.left, top: r.top, width: r.width, height: r.height }
        }

        const observer = Observer.create({
          target: window,
          type: 'wheel,touch',
          wheelSpeed: -1,
          tolerance: 10,
          preventDefault: true,
          onUp: () => input(1),
          onDown: () => input(-1),
        })
        observer.disable()

        // one swipe or wheel spin sends a stream of events: count the stream as
        // ONE gesture, but let steady scrolling keep turning pages at a calm
        // rhythm (a fresh turn at most every 0.45s, one queued at most)
        let lastEvt = 0
        let lastAccept = 0
        function input(dir: 1 | -1) {
          const now = performance.now()
          const gap = now - lastEvt
          lastEvt = now
          if (gap < 160 && now - lastAccept < 450) return
          lastAccept = now
          turn(dir)
        }

        function openAt(k: number) {
          if (open || busy) return
          open = true
          busy = true
          index = k
          holdScroll(true)
          observer.enable()
          const st = spiral.scrollTrigger!
          const go = () => {
            spiral.progress(0)
            spread(k)
            hud()
            gsap.set(viewer, { autoAlpha: 1 })
            gsap.set(rightPage, { autoAlpha: 0 })
            gsap.set(leftPage, { rotationY: 100, autoAlpha: 1 })
            const fly = flyer(k)
            gsap.set(fly, box(tiles[k]))
            gsap
              .timeline({ onComplete: settle })
              .to([head, hint], { autoAlpha: 0, y: -30, duration: 0.4 }, 0)
              .to(spiralEl, { autoAlpha: 0, scale: 0.85, duration: 0.6, ease: 'power2.in' }, 0)
              .to(fly, { ...box(rightPage), duration: 0.85, ease: 'power3.inOut' }, 0.05)
              .add(() => {
                gsap.set(rightPage, { autoAlpha: 1 })
                fly.remove()
              })
              // the book swings open from the spine
              .to(leftPage, { rotationY: 0, duration: 0.9, ease: 'power3.out' })
              .to(closeBtn, { autoAlpha: 1, duration: 0.3 }, '<')
          }
          // bring the stage to the top of the screen first
          if (Math.abs(window.scrollY - (st.start + 2)) < 6) go()
          else glide(st.start + 2, { duration: 0.7, ease: 'power2.inOut', onComplete: go })
        }

        function close() {
          if (!open) return
          busy = true
          queued = 0
          const k = index
          gsap
            .timeline({
              onComplete: () => {
                open = false
                busy = false
                observer.disable()
                holdScroll(false)
                counter.textContent = 'Gallery'
                gsap.set(bar, { scaleX: 0 })
              },
            })
            .to(closeBtn, { autoAlpha: 0, duration: 0.2 }, 0)
            // the book folds shut
            .to(leftPage, { rotationY: 100, duration: 0.55, ease: 'power3.in' }, 0)
            .add(() => {
              const fly = flyer(k)
              gsap.set(fly, box(rightPage))
              gsap.set(viewer, { autoAlpha: 0 })
              // the wall comes back while the photo flies home into it
              gsap.set(spiralEl, { autoAlpha: 1, scale: 1 })
              gsap.from(spiralEl, { scale: 0.85, autoAlpha: 0, duration: 0.6, ease: 'power2.out' })
              gsap.to(fly, { ...box(tiles[k]), duration: 0.85, ease: 'power3.inOut', onComplete: () => fly.remove() })
            })
            .to([head, hint], { autoAlpha: 1, y: 0, duration: 0.5 }, '+=0.45')
        }

        // click a photo (or the reel) to open the book; the closing card stays a link
        const clicks = tiles.slice(0, N + 1).map((tile, i) => {
          const fn = () => openAt(i < N ? i : 0)
          tile.addEventListener('click', fn)
          return () => tile.removeEventListener('click', fn)
        })
        closeBtn.addEventListener('click', close)
        const onKey = (e: KeyboardEvent) => {
          if (!open) return
          if (e.key === 'Escape') {
            e.preventDefault()
            close()
          } else if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) {
            e.preventDefault()
            turn(1)
          } else if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) {
            e.preventDefault()
            turn(-1)
          }
        }
        window.addEventListener('keydown', onKey)

        ScrollTrigger.refresh()

        return () => {
          clicks.forEach((off) => off())
          closeBtn.removeEventListener('click', close)
          window.removeEventListener('keydown', onKey)
          observer.kill()
          holdScroll(false)
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-label="Photo gallery" className="relative h-[100svh] overflow-hidden border-t border-fg/15 bg-paper">
      {/* heading + counter — below the sticky site header (64px) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-6xl items-start justify-between gap-6 px-5 pt-20 sm:px-8 sm:pt-24">
        <div data-head>
          <p className="eyebrow">Gallery</p>
          <h2 className="display mt-3 text-3xl leading-tight sm:text-4xl">The faces behind the work.</h2>
        </div>
        <div className="flex items-center gap-3">
          <p data-counter className="display text-2xl tabular-nums text-accent" aria-live="polite">
            Gallery
          </p>
          <button
            data-close
            type="button"
            aria-label="Close the photo book"
            data-cursor="CLOSE"
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-fg/25 bg-paper/80 text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* the wall */}
      <div data-spiral className="absolute inset-0 flex items-center justify-center pt-24 [perspective:1600px]">
        <div data-wall className="gallery-wall relative grid will-change-transform">
          {plates.map((p, i) => (
            <figure key={p.src} data-tile data-cursor="VIEW" className="relative cursor-pointer">
              <div data-tile-inner className="absolute inset-0 overflow-hidden bg-mist">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 200px, 30vw" className="photo-bw object-cover" priority={i === 0} />
              </div>
            </figure>
          ))}
          <div data-tile data-cursor="VIEW" className="relative cursor-pointer">
            <div data-tile-inner className="h-full w-full">
              <FilmReel compact className="h-full w-full" />
            </div>
          </div>
          <div data-tile className="relative">
            <Link
              data-tile-inner
              href="/life"
              data-cursor="MORE"
              // type is sized from the tile width (--t), so it always fits the box
              className="group flex h-full w-full flex-col justify-between overflow-hidden border border-fg/20 bg-accent/10 transition-colors hover:border-fg"
              style={{ padding: 'calc(var(--t) * 0.09)' }}
            >
              <span className="eyebrow" style={{ fontSize: 'calc(var(--t) * 0.065)' }}>
                Fin.
              </span>
              <span>
                <span className="display block leading-[1.1]" style={{ fontSize: 'calc(var(--t) * 0.125)' }}>
                  The years that made me.
                </span>
                <span className="mt-1 inline-flex items-center gap-1 font-semibold text-accent" style={{ fontSize: 'calc(var(--t) * 0.075)' }}>
                  Chapters <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* the photo book — caption page on the left, photograph on the right */}
      <div data-viewer className="invisible absolute inset-0 z-20 flex flex-col items-center justify-center pt-16">
        <div className="[perspective:2200px]">
          <div data-book className="photo-book relative [transform-style:preserve-3d]">
            {/* spine shadow */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 z-[5] hidden w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/25 to-transparent md:block" />

            {/* left: caption pages */}
            <div data-left className="book-page absolute left-0 top-0 hidden overflow-hidden rounded-l-[6px] bg-mist md:block">
              {plates.map((p, i) => (
                <div key={p.src} data-l className="invisible absolute inset-0">
                  <CaptionPage i={i} />
                </div>
              ))}
            </div>

            {/* right: photo pages */}
            <div data-right className="book-page absolute top-0 overflow-hidden rounded-r-[6px] bg-mist max-md:left-0 max-md:rounded-[6px] md:left-1/2">
              {plates.map((p) => (
                <div key={p.src} data-r className="invisible absolute inset-0">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 420px, 85vw" className="object-cover" />
                </div>
              ))}
              <div data-shade-under aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 to-transparent opacity-0" />
            </div>

            {/* the leaf that turns: photo on its front, the next caption on its back */}
            <div data-leaf className="book-page invisible absolute top-0 [transform-style:preserve-3d] max-md:left-0 md:left-1/2">
              <div className="absolute inset-0 overflow-hidden rounded-r-[6px] bg-mist [backface-visibility:hidden]">
                {plates.map((p) => (
                  <div key={p.src} data-lf className="invisible absolute inset-0">
                    <Image src={p.src} alt="" fill sizes="(min-width: 768px) 420px, 85vw" className="object-cover" />
                  </div>
                ))}
                <div data-shade-front aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/70 to-black/10 opacity-0" />
              </div>
              <div className="absolute inset-0 overflow-hidden rounded-l-[6px] bg-mist [backface-visibility:hidden] [transform:rotateY(180deg)]">
                {plates.map((p, i) => (
                  <div key={p.src} data-lb className="invisible absolute inset-0">
                    <CaptionPage i={i} />
                  </div>
                ))}
                <div data-shade-back aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 to-black/10 opacity-0" />
              </div>
            </div>
          </div>
        </div>
        {/* phones show one page at a time: the caption sits under it */}
        <p data-mcap className="mt-5 px-6 text-center text-sm font-semibold text-fg/75 md:hidden" />
      </div>

      {/* hint + progress */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 mx-auto w-full max-w-6xl px-5 pb-5 sm:px-8">
        <p data-hint className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-fg/65">
          Click a photo to open the book
        </p>
        <div className="h-px w-full bg-fg/15">
          <div data-bar className="h-px origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </section>
  )
}

/** The left-hand page of a spread: plate number, title, place and a line. */
function CaptionPage({ i }: { i: number }) {
  const p = plates[i]
  return (
    <div className="flex h-full flex-col justify-between p-[8%]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fg/50">
        Plate {String(i + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
      </p>
      <div>
        <p className="display text-[clamp(2rem,4.2vw,3.6rem)] leading-[0.95] text-fg">{p.tag}</p>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-accent">{p.place}</p>
        <p className="mt-5 max-w-[22ch] text-[15px] leading-relaxed text-fg/65">{p.alt}.</p>
      </div>
      <p className="font-display text-[clamp(4rem,9vw,8rem)] font-bold leading-none tracking-[-0.06em] text-fg/[0.07]">{String(i + 1).padStart(2, '0')}</p>
    </div>
  )
}
