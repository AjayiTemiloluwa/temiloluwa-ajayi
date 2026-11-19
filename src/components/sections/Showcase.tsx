'use client'

import { useRef, useState } from 'react'
import { SkillModal } from '@/components/ui/SkillModal'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { skillGroups } from '@/data/skills'
import { work } from '@/data/work'
import { CONTAINER } from '@/components/ui/Editorial'
import { gsap, Draggable, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/**
 * Showcase — left, a 3D drum of every skill on the CV that turns on its
 * own, spins with the scroll's speed, and can be grabbed and flung
 * (Draggable + Inertia); the skill facing you lights up. Right, the work
 * as a ruled showcase list, newest first.
 */

const SKILLS = skillGroups.flatMap((g) => g.skills)
const N = SKILLS.length
const STEP = 360 / N

export function Showcase() {
  const root = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState<{ skill: string; from: DOMRect | null } | null>(null)
  const openRef = useRef(setOpen)
  openRef.current = setOpen

  useGSAP(
    () => {
      const drum = root.current!.querySelector<HTMLElement>('[data-drum]')!
      const items = gsap.utils.toArray<HTMLElement>('[data-skill]', drum)
      const place = () => {
        const h = items[0].offsetHeight
        const r = h / 2 / Math.tan(Math.PI / N)
        // each face turns about the drum's axis, r behind the screen
        items.forEach((el, i) => gsap.set(el, { rotationX: -i * STEP, transformOrigin: `50% 50% ${-r}px` }))
        gsap.set(drum, { transformPerspective: 1200, transformOrigin: `50% 50% ${-r}px` })
        return r
      }
      place()
      const state = { rot: 0, spin: 0.12 }
      let active = -1
      const render = () => {
        gsap.set(drum, { rotationX: state.rot })
        const idx = ((Math.round(state.rot / STEP) % N) + N) % N
        if (idx !== active) {
          active = idx
          items.forEach((el, i) => el.toggleAttribute('data-active', i === idx))
        }
        items.forEach((el, i) => {
          const a = ((i * -STEP + state.rot) % 360 + 540) % 360 - 180
          el.style.opacity = String(Math.max(0.06, Math.cos((a * Math.PI) / 180)))
        })
      }
      render()
      if (prefersReducedMotion()) return

      let dragging = false
      const tick = () => {
        if (!dragging) state.rot += state.spin
        render()
      }
      gsap.ticker.add(tick)

      // scroll speed spins the drum, then it eases back to its idle turn
      const st = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 600)
            if (Math.abs(v) > 0.3) {
              state.spin = v
              gsap.to(state, { spin: 0.12, duration: 1.6, ease: 'power2.out', overwrite: true })
            }
          },
        },
      })

      // grab and fling
      const proxy = document.createElement('div')
      let start = 0
      const drag = Draggable.create(proxy, {
        type: 'y',
        trigger: drum.parentElement,
        inertia: true,
        onPress() {
          dragging = true
          start = state.rot
          gsap.killTweensOf(state)
          gsap.set(proxy, { y: 0 })
          this.update()
        },
        onDrag() {
          state.rot = start - this.y * 0.5
        },
        onThrowUpdate() {
          state.rot = start - this.y * 0.5
        },
        onRelease() {
          if (!this.isThrowing) dragging = false
        },
        // a tap (no drag): bring the tapped skill to the front and open it
        onClick(e: PointerEvent) {
          dragging = false
          const hit = (e.target as Element | null)?.closest?.('[data-skill]') as HTMLElement | null
          const i = hit ? items.indexOf(hit) : ((Math.round(state.rot / STEP) % N) + N) % N
          const target = Math.round(state.rot / STEP) * STEP + ((((i - Math.round(state.rot / STEP)) % N) + N + N / 2) % N - N / 2) * STEP
          gsap.to(state, {
            rot: target,
            duration: 0.5,
            ease: 'power3.out',
            onComplete: () => openRef.current({ skill: SKILLS[i], from: items[i].getBoundingClientRect() }),
          })
        },
        onThrowComplete() {
          dragging = false
          // settle on the nearest skill
          gsap.to(state, { rot: Math.round(state.rot / STEP) * STEP, duration: 0.6, ease: 'back.out(2)' })
        },
      })[0]

      return () => {
        gsap.ticker.remove(tick)
        st.kill()
        drag.kill()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} id="showcase" className="scroll-mt-16 border-t border-fg/10">
      <div className={`${CONTAINER} grid gap-x-12 gap-y-14 py-24 sm:py-32 lg:grid-cols-12`}>
        <div className="lg:col-span-5">
          <p className="eyebrow">Skills</p>
          <h2 className="display mt-4 text-5xl leading-[0.95] sm:text-6xl">
            What I <span className="text-lilac">work with.</span>
          </h2>
          <p className="mt-5 max-w-sm text-fg/65">Every skill from my CV. Spin the wheel, then tap a skill to see where I have used it.</p>

          <div className="card relative mt-10 h-[22rem] cursor-grab touch-pan-x select-none overflow-hidden active:cursor-grabbing" data-cursor="SPIN">
            {/* the window: a lit band where the front skill sits */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-1/2 z-10 h-14 -translate-y-1/2 rounded-full border border-lilac/50 bg-lilac/10" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-mist to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-mist to-transparent" />
            <ul data-drum className="absolute inset-x-0 top-1/2 -mt-7 h-14 [transform-style:preserve-3d]" aria-label="Skills">
              {SKILLS.map((s) => (
                <li
                  key={s}
                  data-skill
                  className="reel-item absolute inset-0 flex items-center justify-center text-2xl font-semibold tracking-[-0.03em] text-fg/80 transition-colors duration-300 data-[active]:text-lilac sm:text-3xl"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ul className="border-t border-fg/12">
            {work.map((w, i) => (
              <li key={w.title} className="border-b border-fg/12">
                <Link href="/work" data-cursor="OPEN" className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-6 transition-colors">
                  <span className="text-sm tabular-nums text-fg/65">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <span className="display block text-2xl leading-tight transition-[color,transform] duration-500 group-hover:translate-x-2 group-hover:text-accent sm:text-3xl">
                      {w.title}
                    </span>
                    <span className="mt-1 block text-[13px] text-fg/65">
                      {w.org} · {w.year}
                      {w.metric ? ` · ${w.metric.value} ${w.metric.label}` : ''}
                    </span>
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-fg/15 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-[rgb(14_16_15)]">
                    <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {open && <SkillModal skill={open.skill} from={open.from} onClose={() => setOpen(null)} />}
    </section>
  )
}
