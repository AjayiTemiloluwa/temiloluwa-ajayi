'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, Quote } from 'lucide-react'
import { DOCS, citeHref, citeLabel, type Cite } from '@/data/sources'

/**
 * Cited — a claim with its receipt. The text is followed by a small source
 * chip ("p. 11", "CV"); pressing it unfolds a card underneath with the
 * document, the place in it, the document's own words, and a link that
 * opens the PDF at that page. Works the same with a finger, a mouse or a
 * keyboard (Esc folds it away again).
 */
export function Cited({ cite, children, className = '' }: { cite: Cite; children?: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const doc = DOCS[cite.doc]
  const where = [cite.page ? `page ${cite.page}` : null, cite.where].filter(Boolean).join(' · ')

  return (
    <span className={`block ${className}`}>
      {children}
      {children ? ' ' : null}
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        data-cursor="SOURCE"
        className={`cite-chip ${open ? 'is-open' : ''}`}
        title={`Source: ${doc.title}${where ? `, ${where}` : ''}`}
      >
        <span className="sr-only">Show source: </span>
        {citeLabel(cite)}
      </button>
      <span id={id} hidden={!open} className="cite-card" role="note">
        <span className="flex items-start gap-2.5">
          <Quote className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="min-w-0">
            <q className="block text-[14px] italic leading-relaxed text-fg/85">{cite.quote}</q>
            <span className="mt-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-fg/65">
              {doc.title}
              {where && <span className="font-normal normal-case tracking-normal"> · {where}</span>}
            </span>
            <a href={citeHref(cite)} target="_blank" rel="noopener" className="link mt-2 !text-[13px]">
              {doc.kind === 'PDF' && cite.page ? `Open page ${cite.page}` : `Open the ${doc.kind}`}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </span>
        </span>
      </span>
    </span>
  )
}
