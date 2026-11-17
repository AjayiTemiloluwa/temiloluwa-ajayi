'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { studies } from '@/data/research'
import { work } from '@/data/work'
import { credentialStats } from '@/data/certifications'
import { chapters } from '@/data/chapters'
import { CONTAINER } from '@/components/ui/Editorial'
import { gsap, useGSAP, prefersReducedMotion, hasFinePointer } from '@/lib/gsap'

/**
 * ToolCards — four doors into the site, each with a live mini-animation:
 *   Research    a chart line draws itself and a dot rides it (DrawSVG + MotionPath)
 *   Work        pulses travel a little pipeline of nodes (MotionPath)
 *   Credentials certificates shuffle in a stack
 *   Life        the years flip by, 2021 → 2026
 * Hover tilts the card toward the pointer and plays its animation at speed.
 */

const CARDS = [
  {
    key: 'research',
    href: '/research',
    tone: 'accent',
    title: 'Research',
    stat: `${studies.length} draft manuscripts`,
    body: 'Machine learning for well-kick detection, gas flaring and fracturing fluids.',
  },
  {
    key: 'work',
    href: '/work',
    tone: 'lilac',
    title: 'Work',
    stat: `${work.length} projects`,
    body: 'A compliance platform, a reminder system that runs daily, and data pipelines.',
  },
  {
    key: 'credentials',
    href: '/credentials',
    tone: 'orange',
    title: 'Credentials',
    stat: `${credentialStats.total} credentials`,
    body: 'Courses, certificates and awards. Most can be verified online.',
  },
  {
    key: 'life',
    href: '/life',
    tone: 'pink',
    title: 'Life',
    stat: `${chapters.length} chapters`,
    body: 'Year by year, newest first: every role, paper and award.',
  },
] as const

const TONE: Record<string, { text: string; bg: string; rgb: string }> = {
  accent: { text: 'text-accent', bg: 'bg-accent', rgb: 'var(--accent-rgb)' },
  lilac: { text: 'text-lilac', bg: 'bg-lilac', rgb: 'var(--lilac-rgb)' },
  orange: { text: 'text-orange', bg: 'bg-orange', rgb: 'var(--orange-rgb)' },
  pink: { text: 'text-pink', bg: 'bg-pink', rgb: 'var(--pink-rgb)' },
}

const YEARS = [...chapters].map((c) => c.year).reverse()

function Mini({ kind }: { kind: string }) {
  if (kind === 'research')
    return (
      <svg viewBox="0 0 240 120" className="h-full w-full">
        <path d="M10,110 H230 M10,10 V110" stroke="rgb(var(--fg-rgb) / 0.15)" strokeWidth="1.5" fill="none" />
        <path data-line d="M12,98 C40,90 52,60 78,66 S120,96 142,58 S190,20 228,16" fill="none" stroke="rgb(var(--accent-rgb))" strokeWidth="4" strokeLinecap="round" />
        <circle data-dot r="7" fill="rgb(var(--accent-rgb))" />
      </svg>
    )
  if (kind === 'work')
    return (
      <svg viewBox="0 0 240 120" className="h-full w-full">
        <path data-link d="M40,60 C80,10 120,10 120,60" fill="none" stroke="rgb(var(--fg-rgb) / 0.2)" strokeWidth="2" />
        <path data-link d="M120,60 C120,110 160,110 200,60" fill="none" stroke="rgb(var(--fg-rgb) / 0.2)" strokeWidth="2" />
        {[40, 120, 200].map((x) => (
          <circle key={x} cx={x} cy="60" r="14" fill="rgb(var(--mist-rgb))" stroke="rgb(var(--lilac-rgb))" strokeWidth="3" />
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={i} data-pulse r="5" fill="rgb(var(--lilac-rgb))" />
        ))}
      </svg>
    )
  if (kind === 'credentials')
    return (
      <div className="relative h-full w-full">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            data-cert
            className="absolute left-1/2 top-1/2 h-[70%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-orange bg-mist p-3"
            style={{ zIndex: 3 - i }}
          >
            <div className="h-2 w-1/2 rounded-full bg-orange" />
            <div className="mt-2 h-1.5 w-3/4 rounded-full bg-fg/15" />
            <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-fg/15" />
            <div className="absolute bottom-3 right-3 h-6 w-6 rounded-full border-2 border-orange" />
          </div>
        ))}
      </div>
    )
  return (
    <div className="flex h-full items-center justify-center overflow-hidden">
      <div className="relative h-[1.1em] overflow-hidden text-6xl font-bold tracking-[-0.05em] text-pink tabular-nums">
        <div data-years>
          {[...YEARS, YEARS[0]].map((y, i) => (
            <div key={i} className="h-[1.1em] leading-[1.1em]">
              {y}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ToolCards() {
  const root = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root.current)
      cards.forEach((card) => {
        const kind = card.dataset.card!
        const q = gsap.utils.selector(card)
        const tl = gsap.timeline({ repeat: -1, paused: true })
        if (kind === 'research') {
          tl.fromTo(q('[data-line]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.8, ease: 'power2.inOut' })
            .to(q('[data-dot]'), { motionPath: { path: q('[data-line]')[0] as unknown as SVGPathElement, align: q('[data-line]')[0] as unknown as SVGPathElement, alignOrigin: [0.5, 0.5] }, duration: 1.8, ease: 'power2.inOut' }, 0)
            .to({}, { duration: 0.8 })
        } else if (kind === 'work') {
          const links = q('[data-link]') as unknown as SVGPathElement[]
          ;(q('[data-pulse]') as unknown as SVGCircleElement[]).forEach((p, i) => {
            const path = links[i % 2]
            tl.fromTo(p, { autoAlpha: 1 }, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 1.1, ease: 'none', immediateRender: true }, i * 0.45)
          })
        } else if (kind === 'credentials') {
          const certs = q('[data-cert]')
          certs.forEach((_, i) => {
            tl.to(certs, {
              y: (k) => ((k - i + 3) % 3) * 10 - 10,
              x: (k) => ((k - i + 3) % 3) * 8 - 8,
              rotation: (k) => (((k - i + 3) % 3) - 1) * 4,
              zIndex: (k) => 3 - ((k - i + 3) % 3),
              duration: 0.6,
              ease: 'back.inOut(2)',
            }).to({}, { duration: 0.6 })
          })
        } else {
          const n = YEARS.length
          for (let i = 1; i <= n; i++) tl.to(q('[data-years]'), { yPercent: (-100 / (n + 1)) * i, duration: 0.5, ease: 'power3.inOut' }, '+=0.55')
          tl.set(q('[data-years]'), { yPercent: 0 })
        }
        if (reduce) {
          tl.progress(0.5).pause()
          return
        }
        tl.play()

        // hover: tilt toward the pointer, and the animation races
        if (hasFinePointer()) {
          const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' })
          const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' })
          gsap.set(card, { transformPerspective: 800 })
          card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect()
            ry(((e.clientX - r.left) / r.width - 0.5) * 12)
            rx(-((e.clientY - r.top) / r.height - 0.5) * 10)
          })
          card.addEventListener('pointerenter', () => gsap.to(tl, { timeScale: 2.6, duration: 0.4 }))
          card.addEventListener('pointerleave', () => {
            rx(0)
            ry(0)
            gsap.to(tl, { timeScale: 1, duration: 0.6 })
          })
        }
      })

      if (!reduce) {
        gsap.from(cards, {
          y: 80,
          rotate: (i) => (i % 2 ? 4 : -4),
          autoAlpha: 0,
          duration: 1.1,
          ease: 'silk',
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        })
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} id="explore" className="scroll-mt-16">
      <div className={`${CONTAINER} pb-24 sm:pb-36`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display text-5xl leading-[0.95] sm:text-7xl">
            Have a look <span className="text-accent">around.</span>
          </h2>
          <p className="max-w-sm text-fg/65">My research, projects, certificates and the years so far, each with its own page.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => {
            const t = TONE[c.tone]
            return (
              <Link
                key={c.key}
                href={c.href}
                data-card={c.key}
                data-cursor="EXPLORE"
                className="card group relative flex min-h-[26rem] flex-col overflow-hidden p-6 transition-[border-color,box-shadow] duration-500 hover:border-transparent will-change-transform"
                style={{ ['--glow' as string]: t.rgb }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ boxShadow: `inset 0 0 0 2px rgb(${t.rgb}), 0 30px 80px -30px rgb(${t.rgb} / 0.55)` }}
                />
                <div className="h-36 sm:h-40">
                  <Mini kind={c.key} />
                </div>
                <p className={`mt-auto text-xs font-semibold uppercase tracking-[0.16em] ${t.text}`}>{c.stat}</p>
                <h3 className="display mt-2 text-4xl">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fg/65">{c.body}</p>
                <span className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[rgb(14_16_15)] ${t.bg}`}>
                  Explore {c.title.toLowerCase()} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
