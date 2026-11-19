import type { ReactNode } from 'react'
import { MaskText, type MaskSegment } from '@/components/anim/MaskText'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Editorial primitives — the page grid every section sits on.
 *
 * <Section> is the magazine spread: a ruled band with the heading in a
 * narrow left column (it stays pinned while the right column scrolls on
 * desktop) and the content in the wide right column. Sections are
 * numbered so the page reads like a table of contents.
 */

export const CONTAINER = 'mx-auto w-full max-w-6xl px-5 sm:px-8'

export function Section({
  id,
  index,
  label,
  title,
  lede,
  aside,
  tone = 'paper',
  children,
}: {
  id?: string
  /** Running number shown beside the label ("02"). Omit on sub-pages. */
  index?: number
  label: string
  title?: MaskSegment[]
  lede?: ReactNode
  /** Extra content under the heading, in the left column (a link, a note). */
  aside?: ReactNode
  tone?: 'paper' | 'mist'
  children: ReactNode
}) {
  return (
    <section id={id} className={`hairline-top scroll-mt-16 ${tone === 'mist' ? 'bg-mist/35' : ''}`}>
      <div className={`${CONTAINER} grid gap-x-10 gap-y-10 py-16 sm:py-24 lg:grid-cols-12`}>
        <header className="self-start lg:sticky lg:top-24 lg:col-span-4">
          {/* a section without a display title uses its label as the heading, so
              headings never skip a level (h1 → h2 → h3) */}
          {(() => {
            const Label = title ? 'p' : 'h2'
            return (
              <Label className="eyebrow flex items-baseline gap-3">
            {index !== undefined && <span className="tabular-nums text-fg/65">{String(index).padStart(2, '0')}</span>}
            {label}
          </Label>
            )
          })()}
          {title && (
            <h2 className="display mt-4 text-4xl leading-[1.05] sm:text-5xl">
              <MaskText segments={title} />
            </h2>
          )}
          {lede && <p className="prose-body mt-5 max-w-sm">{lede}</p>}
          {aside && <div className="mt-6">{aside}</div>}
        </header>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  )
}

/** A ruled list — rows separated by hairlines, closed top and bottom. */
export function Ruled({ children, as: Tag = 'ul', className = '' }: { children: ReactNode; as?: 'ul' | 'ol' | 'dl' | 'div'; className?: string }) {
  return <Tag className={`divide-y divide-fg/15 border-y border-fg/15 ${className}`}>{children}</Tag>
}

/** Inline tag list — "Python · SQL · Tableau" instead of a row of pills. */
export function Tags({ items, className = '' }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-fg/65 ${className}`}>
      {items.map((t, i) => (
        <li key={t} className="flex items-center gap-2">
          {i > 0 && <span className="text-fg/30" aria-hidden="true">·</span>}
          {t}
        </li>
      ))}
    </ul>
  )
}

/** Sub-heading inside a section's right column. */
export function SubHead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-xs font-semibold uppercase tracking-[0.14em] text-fg/65 ${className}`}>{children}</h3>
}

export { Reveal }
