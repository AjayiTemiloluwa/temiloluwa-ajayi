'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight, X } from 'lucide-react'
import { skillEvidence } from '@/data/skillEvidence'
import { gsap, holdScroll, prefersReducedMotion } from '@/lib/gsap'

/**
 * SkillModal — tap a skill and it opens up into a panel: the skill's name,
 * its group, and every project, draft paper, role and credential on the
 * site where it shows up (from the site's own records, never invented).
 *
 * The panel grows out of the spot that was tapped (FLIP by hand), the page
 * behind dims and blurs, and the entries flip up one by one. Esc, the ×,
 * or a tap outside closes it and it shrinks back to where it came from.
 * Focus moves into the panel and returns to the drum afterwards.
 */

const KIND_TONE: Record<string, string> = {
  Project: 'bg-lilac',
  Research: 'bg-accent',
  Role: 'bg-orange',
  Credential: 'bg-pink',
}

export function SkillModal({ skill, from, onClose }: { skill: string; from: DOMRect | null; onClose: () => void }) {
  const root = useRef<HTMLDivElement | null>(null)
  const closing = useRef(false)
  const { group, items } = skillEvidence(skill)

  const close = () => {
    if (closing.current) return
    closing.current = true
    const el = root.current!
    const panel = el.querySelector<HTMLElement>('[data-panel]')!
    const reduce = prefersReducedMotion()
    const tl = gsap.timeline({ onComplete: onClose })
    if (!reduce && from) {
      const r = panel.getBoundingClientRect()
      tl.to(panel, {
        x: from.left + from.width / 2 - (r.left + r.width / 2),
        y: from.top + from.height / 2 - (r.top + r.height / 2),
        scale: Math.max(0.08, from.width / r.width),
        autoAlpha: 0,
        rotationX: 20,
        duration: 0.5,
        ease: 'power3.in',
      })
    } else tl.to(panel, { autoAlpha: 0, duration: 0.2 })
    tl.to(el.querySelector('[data-backdrop]'), { autoAlpha: 0, duration: 0.35 }, '<0.1')
  }

  useEffect(() => {
    const el = root.current!
    const panel = el.querySelector<HTMLElement>('[data-panel]')!
    const back = el.querySelector<HTMLElement>('[data-backdrop]')!
    const prev = document.activeElement as HTMLElement | null
    holdScroll(true)
    el.querySelector<HTMLElement>('[data-close]')?.focus({ preventScroll: true })

    if (!prefersReducedMotion()) {
      const r = panel.getBoundingClientRect()
      const tl = gsap.timeline()
      tl.fromTo(back, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0)
      if (from) {
        tl.from(panel, {
          x: from.left + from.width / 2 - (r.left + r.width / 2),
          y: from.top + from.height / 2 - (r.top + r.height / 2),
          scale: Math.max(0.08, from.width / r.width),
          rotationX: -25,
          autoAlpha: 0,
          duration: 0.75,
          ease: 'expo.out',
        }, 0)
      } else tl.from(panel, { autoAlpha: 0, scale: 0.9, duration: 0.4 }, 0)
      tl.from(el.querySelector('[data-name]'), { yPercent: 100, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, 0.25)
        .to(el.querySelector('[data-name]'), { duration: 0.6, scrambleText: { text: skill, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: 0.7 } }, 0.25)
        .from(el.querySelectorAll('[data-item]'), { rotationX: -80, y: 30, autoAlpha: 0, transformPerspective: 700, transformOrigin: '50% 0%', duration: 0.7, ease: 'back.out(1.6)', stagger: 0.06 }, 0.4)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
      // keep Tab inside the panel
      if (e.key === 'Tab') {
        const f = [...panel.querySelectorAll<HTMLElement>('a[href], button')]
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      holdScroll(false)
      prev?.focus({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={root} className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="skill-modal-title">
      <div data-backdrop className="absolute inset-0 bg-[rgb(14_16_15/0.72)] backdrop-blur-md" onClick={close} />
      <div
        data-panel
        className="card relative max-h-[86svh] w-full max-w-2xl overflow-y-auto overscroll-contain p-6 shadow-2xl sm:p-10"
        style={{ boxShadow: '0 40px 120px -30px rgb(var(--accent-rgb) / 0.45)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow">{group || 'Skill'}</p>
          <button
            data-close
            type="button"
            onClick={close}
            aria-label="Close"
            className="icon-btn -mr-2 -mt-2 shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <h2 id="skill-modal-title" className="display mt-3 overflow-hidden text-4xl leading-[1.05] sm:text-6xl">
          <span data-name className="block">
            {skill}
          </span>
        </h2>
        <p className="mt-4 text-[15px] text-fg/65">
          {items.length
            ? `Where it shows up: ${items.length} ${items.length === 1 ? 'record' : 'records'} from my work, research and certificates.`
            : 'Listed on my CV. There is no separate project or certificate for it on this site.'}
        </p>

        {items.length > 0 && (
          <ul className="mt-6 space-y-2.5">
            {items.map((it) => (
              <li key={it.kind + it.title} data-item>
                <Link
                  href={it.href}
                  onClick={() => holdScroll(false)}
                  className="group flex items-center gap-4 rounded-2xl border border-fg/10 bg-paper/40 px-4 py-3.5 transition-colors hover:border-accent"
                >
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[rgb(14_16_15)] ${KIND_TONE[it.kind]}`}>{it.kind}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug">{it.title}</span>
                    <span className="mt-0.5 block text-[13px] text-fg/60">{it.meta}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-fg/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
