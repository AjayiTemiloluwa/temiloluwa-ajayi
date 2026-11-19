import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import { researchAreas, studies, gradPath } from '@/data/research'
import { countWord } from '@/lib/words'
import { PageShell } from '@/components/PageShell'
import { CONTAINER, Reveal, Section, Tags } from '@/components/ui/Editorial'
import { Cited } from '@/components/ui/Cited'

/**
 * /research — the manuscript ledger: the areas of inquiry, each study as
 * a long-form entry (facts and draft in the margin; method and findings
 * in the column), then the road to grad school. Every claim traces to
 * the manuscripts themselves.
 */
export const metadata = {
  title: 'Research',
  description:
    'Four draft manuscripts on machine learning for well-kick detection, gas-flaring analytics and fracturing-fluid design, with methods, results, limits and the drafts to download.',
}

export default function ResearchPage() {
  return (
    <PageShell
      kicker="Research"
      title={[{ text: 'Machine learning for ' }, { text: 'energy problems.', accent: true }]}
      blurb={`${countWord(studies.length, true)} draft manuscripts, none published yet. Each entry covers the method, results and limits, with a source chip on every claim that opens the draft at that page.`}
    >
      <Section label="Research areas" tone="mist">
        <div className="grid gap-x-10 border-t border-fg/15 sm:grid-cols-2">
          {researchAreas.map((area, i) => (
            <Reveal key={area.id} delay={i * 60} className="border-b border-fg/15 py-6">
              <div className="flex items-baseline gap-4">
                <span className="text-sm tabular-nums text-fg/65">{area.id}</span>
                <div>
                  <h3 className="display text-2xl leading-tight">{area.title}</h3>
                  <p className="prose-body mt-2 text-[15px]">{area.blurb}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* the studies — one long-form entry each */}
      <section className={`${CONTAINER} border-t border-fg/15`}>
        {studies.map((study, i) => (
          <Reveal as="article" key={study.id} className="grid scroll-mt-20 gap-x-10 gap-y-8 border-b border-fg/15 py-14 last:border-b-0 sm:py-20 lg:grid-cols-12">
            {/* margin — the facts */}
            <aside id={study.id} className="scroll-mt-24 self-start lg:sticky lg:top-24 lg:col-span-4">
              <p className="display text-6xl leading-none text-accent">{String(i + 1).padStart(2, '0')}</p>
              <dl className="mt-6 divide-y divide-fg/15 border-y border-fg/15 text-[13px]">
                {[
                  ['Venue', study.venue],
                  ['Year', study.year],
                  ['Status', study.kind],
                  ['Field', study.field],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[4.5rem_1fr] gap-x-3 py-2.5">
                    <dt className="font-semibold uppercase tracking-[0.12em] text-fg/65">{k}</dt>
                    <dd className="text-fg/80">{v}</dd>
                  </div>
                ))}
              </dl>
              <a href={study.file} download data-cursor="DOWNLOAD" className="btn-ghost mt-6 !h-11 !px-5">
                <Download className="h-4 w-4" aria-hidden="true" />
                Download draft · {study.fileKind}
              </a>
              <p className="meta mt-3">Draft, not for citation.</p>
            </aside>

            {/* column — the study */}
            <div className="lg:col-span-8">
              <h2 className="display text-3xl leading-[1.12] sm:text-[2.5rem]">{study.title}</h2>

              <p className="eyebrow mt-8">Method</p>
              <Cited cite={study.methodCite} className="prose-body mt-3 sm:text-lg">
                {study.method}
              </Cited>

              <p className="eyebrow mt-8">Findings</p>
              <ol className="mt-3 divide-y divide-fg/15 border-y border-fg/15">
                {study.findings.map((f, j) => (
                  <li key={f.text} className="grid grid-cols-[2rem_1fr] gap-x-3 py-4">
                    <span className="pt-0.5 text-sm tabular-nums text-fg/65">{j + 1}</span>
                    <Cited cite={f.cite} className="text-base leading-relaxed text-fg/80">
                      {f.text}
                    </Cited>
                  </li>
                ))}
              </ol>

              {study.limits.length > 0 && (
                <>
                  <p className="eyebrow mt-8">Limits</p>
                  <ul className="mt-3 space-y-2">
                    {study.limits.map((l) => (
                      <li key={l.text} className="flex gap-3 text-[15px] leading-relaxed text-fg/75">
                        <span className="mt-[0.75em] h-px w-3 shrink-0 bg-fg/40" aria-hidden="true" />
                        <Cited cite={l.cite}>{l.text}</Cited>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <Tags items={study.stack} className="mt-6" />

              <Link href={`/research/${study.id}`} data-cursor="READ" className="link mt-6">
                {study.demo ? 'Full page, what I’d change, and a game with its results' : 'Full page and what I’d do differently'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        ))}
      </section>

      <Section label="Toward grad school" tone="mist">
        <div className="grid gap-x-10 border-y border-fg/15 sm:grid-cols-2 sm:divide-x sm:divide-fg/15">
          {[
            { tag: 'Now', ...gradPath.current },
            { tag: 'Next', ...gradPath.target },
          ].map((step, i) => (
            <div key={step.tag} className={`py-6 ${i === 1 ? 'border-t border-fg/15 sm:border-t-0 sm:pl-10' : ''}`}>
              <p className="eyebrow">{step.tag}</p>
              <p className="display mt-2 text-xl leading-snug">{step.label}</p>
              <p className="prose-body mt-2 text-[15px]">{step.detail}</p>
            </div>
          ))}
        </div>
        <p className="display mt-8 max-w-2xl text-xl leading-snug text-fg/80 sm:text-2xl">{gradPath.statement}</p>
      </Section>
    </PageShell>
  )
}
