import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { studies } from '@/data/research'
import { countWord } from '@/lib/words'
import { Reveal, Section } from '@/components/ui/Editorial'

/**
 * Research — the home-page index of the manuscript ledger: every study
 * as one ruled row linking to its full entry on /research (method,
 * findings, draft download). The areas of inquiry, the long-form entries
 * and the road to grad school live on /research only.
 */
export function Research() {
  return (
    <Section
      id="research"
      index={2}
      label="Research"
      tone="mist"
      title={[{ text: 'Machine learning for ' }, { text: 'energy.', accent: true }]}
      lede={`${countWord(studies.length, true)} draft manuscripts on well-kick detection, gas-flaring analytics and fracturing-fluid design.`}
      aside={
        <Link href="/research" data-cursor="SEE ALL" className="link">
          Methods, results &amp; drafts
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    >
      <ol className="border-t border-fg/15">
        {studies.map((study, i) => (
          <Reveal as="li" key={study.id} delay={(i % 3) * 60} className="border-b border-fg/15">
            <Link
              href={`/research#${study.id}`}
              data-cursor="READ"
              className="group grid grid-cols-[2rem_1fr_auto] items-start gap-x-4 py-6 transition-colors hover:bg-fg/[0.03] sm:gap-x-6 sm:px-2"
            >
              <span className="pt-1.5 text-sm tabular-nums text-fg/55">{String(i + 1).padStart(2, '0')}</span>
              <span className="min-w-0">
                <span className="display block text-xl leading-snug transition-colors group-hover:text-accent sm:text-2xl">
                  {study.title}
                </span>
                <span className="meta mt-2 block">
                  {study.venue} · {study.year} · {study.kind}
                </span>
                <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.12em] text-accent">{study.field}</span>
              </span>
              <ArrowUpRight className="mt-1.5 h-5 w-5 text-fg/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
            </Link>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
