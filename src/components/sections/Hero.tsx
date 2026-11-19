'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import { profile, focusAxes } from '@/data/resume'
import { plates } from '@/data/photos'
import { credentialsStrip } from '@/data/certifications'
import { CONTAINER } from '@/components/ui/Editorial'
import { RotatingWord } from '@/components/ui/RotatingWord'
import { FluidText } from '@/components/effects/fluid'
import { HeroShapes } from '@/components/ui/HeroShapes'
import { LiquidPortrait } from '@/components/ui/LiquidPortrait'
import { OrbitText } from '@/components/ui/OrbitText'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * Hero — a stage, not a masthead.
 *
 *  · Behind: the neon worm and four throwable shapes (HeroShapes).
 *  · The name, set huge: each word rises and un-tilts into place, and its
 *    glyphs ripple away from the cursor or finger (FluidText).
 *  · Below: what the work sits across (typewriter), the aim, the actions
 *    and the credential line — and the live portrait (LiquidPortrait),
 *    ringed by the four fields spinning with the scroll (OrbitText).
 *  · On scroll the name drifts up and fades while the portrait counter-drifts.
 */

const PORTRAIT_PHOTOS = [
  { src: '/images/portrait.png', w: 599, h: 786 },
  ...[6, 0, 2, 1].map((i) => ({ src: plates[i].src, w: plates[i].w, h: plates[i].h })),
]

export function Hero() {
  const root = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)

      const tl = gsap.timeline({ defaults: { ease: 'silk' } })
      tl.from(q('.fluid-word'), { yPercent: 120, rotate: 10, autoAlpha: 0, duration: 1.4, stagger: 0.12 }, 0.2)
        .from(q('[data-pill]'), { autoAlpha: 0, y: -16, duration: 0.8 }, 0.1)
        .from(q('[data-rise]'), { autoAlpha: 0, y: 34, stagger: 0.1, duration: 1.1 }, 0.8)
        .from(q('[data-portrait]'), { autoAlpha: 0, y: 60, rotate: 4, duration: 1.4 }, 0.9)
        .from(q('[data-orbit]'), { scale: 0, rotate: -160, autoAlpha: 0, duration: 1.4, ease: 'back.out(1.6)' }, 1.6)

      gsap.to(q('[data-name]'), {
        yPercent: -30,
        autoAlpha: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to(q('[data-portrait]'), {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="relative overflow-hidden">
      <HeroShapes />

      <div className={`${CONTAINER} relative pb-20 pt-10 sm:pb-28 sm:pt-14`}>
        <p data-pill className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-mist/70 px-4 py-1.5 text-[13px] font-medium text-fg/80 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          {profile.role} · {profile.location}
        </p>

        {/* the name */}
        <h1
          data-name
          className="display relative mt-8 leading-[0.86] sm:mt-10"
          style={{ fontSize: 'clamp(3.6rem, 13.2vw, 12.5rem)', letterSpacing: '-0.06em' }}
        >
          <FluidText text={profile.firstName} strength={26} radius={180} />
          <br />
          <span className="text-accent">
            <FluidText text={`${profile.middleName} ${profile.lastName}`} strength={26} radius={180} />
          </span>
        </h1>

        <div className="mt-14 grid items-end gap-x-12 gap-y-14 sm:mt-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p data-rise className="text-sm font-semibold uppercase tracking-[0.16em] text-fg/65">
              Right now I’m working on
            </p>
            <p data-rise className="display mt-3 min-h-[2.3em] text-3xl leading-[1.08] sm:text-5xl">
              <RotatingWord />
            </p>

            <p data-rise className="mt-6 max-w-xl text-lg leading-relaxed text-fg/70 sm:text-xl">
              {profile.mission}
            </p>

            <div data-rise className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/research" data-cursor="RESEARCH" className="btn-primary !h-14 !px-8 !text-base">
                View research
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href={profile.cvPath} download className="btn-ghost !h-14 !px-8 !text-base">
                <Download className="h-4 w-4" aria-hidden="true" />
                Download CV
              </a>
            </div>

            <ul data-rise className="mt-10 flex flex-wrap items-center gap-2 text-[13px] text-fg/70">
              {credentialsStrip.slice(0, 3).map((c) => (
                <li key={c} className="rounded-full border border-fg/12 px-3 py-1">
                  {c}
                </li>
              ))}
              <li>
                <Link href="/credentials" className="link !text-[13px]">
                  All credentials →
                </Link>
              </li>
            </ul>
          </div>

          {/* the live portrait */}
          <figure data-portrait className="relative mx-auto w-full max-w-[22rem] lg:col-span-5 lg:max-w-[26rem]">
            <LiquidPortrait photos={PORTRAIT_PHOTOS} alt={`Portrait of ${profile.name}`} />
            <div data-orbit className="absolute -left-8 -top-10 z-20 h-28 w-28 sm:-left-12 sm:h-36 sm:w-36">
              <OrbitText words={focusAxes} className="h-full w-full" />
            </div>
          </figure>
        </div>
      </div>
    </section>
  )
}
