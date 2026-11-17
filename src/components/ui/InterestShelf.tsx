'use client'

import { useRef, useState } from 'react'
import type { Interest } from '@/data/interests'
import { InterestIcon } from '@/components/ui/InterestIcon'
import { gsap, Flip, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * InterestShelf — every interest as a card, with a filter. Changing the
 * filter is animated with GSAP Flip: cards that stay glide to their new
 * places, cards that leave shrink away, cards that arrive grow in — the
 * layout itself is what animates.
 *
 * Only the LEAVING cards are lifted out of the layout during the move
 * (absoluteOnLeave), so the grid always keeps its real height and the
 * section below never slides up under the cards. A click mid-animation
 * first finishes the running one.
 */
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'work', label: 'Work' },
  { key: 'life', label: 'Off the clock' },
] as const
type Key = (typeof FILTERS)[number]['key']

export function InterestShelf({ items }: { items: readonly Interest[] }) {
  const grid = useRef<HTMLDivElement | null>(null)
  const [filter, setFilter] = useState<Key>('all')
  const running = useRef<gsap.core.Timeline | null>(null)

  const apply = (key: Key) => {
    if (key === filter || !grid.current) return
    running.current?.progress(1)
    const cards = gsap.utils.toArray<HTMLElement>('[data-card]', grid.current)
    const state = Flip.getState(cards)
    cards.forEach((c) => {
      c.style.display = key === 'all' || c.dataset.kind === key ? '' : 'none'
    })
    setFilter(key)
    if (prefersReducedMotion()) return ScrollTrigger.refresh()
    running.current = Flip.from(state, {
      duration: 0.75,
      ease: 'power3.inOut',
      absoluteOnLeave: true,
      scale: true,
      stagger: 0.03,
      // the page below moved: re-measure every scroll animation
      onComplete: () => ScrollTrigger.refresh(),
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.4 }),
    })
  }

  return (
    <div>
      <div role="group" aria-label="Filter interests" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => apply(f.key)}
            aria-pressed={filter === f.key}
            data-magnetic
            className={`h-10 rounded-full border px-5 text-sm font-semibold transition-colors ${
              filter === f.key ? 'border-fg bg-fg text-paper' : 'border-fg/30 text-fg hover:border-fg'
            }`}
          >
            {f.label}
            <span className="ml-2 tabular-nums opacity-60">
              {f.key === 'all' ? items.length : items.filter((i) => i.kind === f.key).length}
            </span>
          </button>
        ))}
      </div>

      <div ref={grid} className="relative mt-8 grid gap-4 [overflow:clip] sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <article key={it.title} data-card data-tilt data-kind={it.kind} className="card p-6 transition-colors hover:border-accent/60">
            <div className="flex items-center justify-between">
              <InterestIcon icon={it.icon} className="h-5 w-5 text-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg/65">
                {it.kind === 'work' ? 'Work' : 'Off the clock'}
              </span>
            </div>
            <h3 className="display mt-4 text-2xl leading-tight">{it.title}</h3>
            <p className="prose-body mt-2 text-[15px]">{it.blurb}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
