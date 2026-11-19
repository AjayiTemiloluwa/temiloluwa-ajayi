import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Download } from 'lucide-react'
import { studies, studyById } from '@/data/research'
import { PageShell } from '@/components/PageShell'
import { CONTAINER, Reveal, Section, Tags } from '@/components/ui/Editorial'
import { Cited } from '@/components/ui/Cited'
import { FlareDemo } from '@/components/research/FlareDemo'

/**
 * /research/[id] — one page per paper: the facts, the method, what it
 * found and what it doesn't show, each with a source chip that opens the
 * manuscript at the page it comes from; then "what I'd do differently",
 * every point tied to the line in the draft that prompted it. The
 * gas-flaring paper also gets its playable results (FlareDemo).
 */

export function generateStaticParams() {
  return studies.map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const study = studyById((await params).id)
  if (!study) return {}
  return { title: study.short, description: study.method.slice(0, 155) }
}

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const study = studyById(id)
  if (!study) notFound()
  const n = studies.indexOf(study)
  const prev = studies[(n - 1 + studies.length) % studies.length]
  const next = studies[(n + 1) % studies.length]

  return (
    <PageShell
      kicker={`Research · Paper ${String(n + 1).padStart(2, '0')}`}
      title={[{ text: `${study.short.split(' ').slice(0, -1).join(' ')} ` }, { text: `${study.short.split(' ').slice(-1)[0]}.`, accent: true }]}
      blurb={study.title}
    >
      <section className={`${CONTAINER} grid gap-x-10 gap-y-10 border-t border-fg/15 py-12 sm:py-16 lg:grid-cols-12`}>
        {/* margin — the facts */}
        <aside className="self-start lg:sticky lg:top-24 lg:col-span-4">
          <dl className="divide-y divide-fg/15 border-y border-fg/15 text-[13px]">
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
          <p className="meta mt-6 max-w-xs">
            Every statement on this page has a <span className="cite-chip pointer-events-none">p.</span> chip. Press it to read the
            paper’s own words and open the page they’re on.
          </p>
        </aside>

        {/* column — the study */}
        <div className="lg:col-span-8">
          <Reveal>
            <p className="eyebrow">Method</p>
            <Cited cite={study.methodCite} className="prose-body mt-3 sm:text-lg">
              {study.method}
            </Cited>
          </Reveal>

          <Reveal>
            <p className="eyebrow mt-10">What it found</p>
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
          </Reveal>

          <Reveal>
            <p className="eyebrow mt-10">What it doesn’t show yet</p>
            <ul className="mt-3 space-y-3">
              {study.limits.map((l) => (
                <li key={l.text} className="flex gap-3 text-[15px] leading-relaxed text-fg/75">
                  <span className="mt-[0.75em] h-px w-3 shrink-0 bg-fg/40" aria-hidden="true" />
                  <Cited cite={l.cite}>{l.text}</Cited>
                </li>
              ))}
            </ul>
          </Reveal>

          <Tags items={study.stack} className="mt-8" />
        </div>
      </section>

      {study.demo === 'flare' && (
        <Section label="Try it" tone="mist">
          <h2 className="display max-w-2xl text-3xl leading-tight sm:text-4xl">Can you guess a flare better than the model?</h2>
          <p className="prose-body mt-3 max-w-2xl">
            Five flares the model never saw in training. For each one you get its prediction, you make your own guess, then see the
            measured volume.
          </p>
          <div className="mt-8">
            <FlareDemo />
          </div>
        </Section>
      )}

      <Section label="What I’d do differently" tone={study.demo ? undefined : 'mist'}>
        <p className="prose-body max-w-2xl">
          Re-reading the draft now, these are the changes I’d make before it goes to review. Each one starts from a line in the paper.
        </p>
        <ol className="mt-8 border-t border-fg/15">
          {study.rethink.map((r, j) => (
            <Reveal as="li" key={r.text} delay={j * 60} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-fg/15 py-6">
              <span className="display text-3xl leading-none text-accent">{j + 1}</span>
              <div>
                <p className="text-[17px] leading-relaxed text-fg/85">{r.text}</p>
                <Cited cite={r.because} className="meta mt-2">
                  What prompted it:
                </Cited>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* the other papers */}
      <nav aria-label="Other papers" className={`${CONTAINER} grid gap-4 border-t border-fg/15 py-10 sm:grid-cols-2`}>
        <Link href={`/research/${prev.id}`} data-cursor="PREVIOUS" className="group rounded-xl border border-fg/15 p-5 transition hover:border-fg/40">
          <span className="meta inline-flex items-center gap-2">
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" aria-hidden="true" /> Previous paper
          </span>
          <span className="display mt-2 block text-xl leading-snug group-hover:text-accent">{prev.short}</span>
        </Link>
        <Link href={`/research/${next.id}`} data-cursor="NEXT" className="group rounded-xl border border-fg/15 p-5 text-right transition hover:border-fg/40">
          <span className="meta inline-flex items-center gap-2">
            Next paper <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="display mt-2 block text-xl leading-snug group-hover:text-accent">{next.short}</span>
        </Link>
        <Link href="/research" className="link sm:col-span-2">
          All research
        </Link>
      </nav>
    </PageShell>
  )
}
