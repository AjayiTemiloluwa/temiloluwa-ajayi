import { chapters } from '@/data/chapters'
import { countWord } from '@/lib/words'
import { PageShell } from '@/components/PageShell'
import { CONTAINER, Reveal } from '@/components/ui/Editorial'

/**
 * /life — the years that made me, newest first: each year set large in
 * the margin with everything on record for it listed beside it (work,
 * study, research, projects, credentials, awards, community).
 *
 * Only the story lives here. The photos are in the home-page gallery and
 * the off-the-clock interests on /interests, so nothing is shown twice.
 */
export const metadata = {
  title: 'Life',
  description: 'Year by year from 2026 back to 2021: every role, project, manuscript, credential and award.',
}

export default function LifePage() {
  return (
    <PageShell
      kicker="Life"
      title={[{ text: 'Year by ' }, { text: 'year.', accent: true }]}
      blurb={`${countWord(chapters.length, true)} years, newest first, from ${chapters[0].year} back to ${chapters[chapters.length - 1].year}. I started in petroleum engineering and moved into data, automation and finance.`}
    >
      <section className={`${CONTAINER} pb-16 sm:pb-24`}>
        <ol className="border-t border-fg/15">
          {chapters.map((chapter, i) => (
            <Reveal as="li" key={chapter.year} delay={(i % 2) * 60} className="grid gap-x-10 gap-y-3 border-b border-fg/15 py-10 lg:grid-cols-12">
              <p className="display text-6xl leading-none text-accent tabular-nums sm:text-7xl lg:col-span-4">{chapter.year}</p>
              <div className="lg:col-span-8">
                <h2 className="display text-3xl leading-tight sm:text-4xl">{chapter.title}</h2>
                <p className="prose-body mt-3 max-w-2xl sm:text-lg">{chapter.body}</p>
                <ul className="mt-6 divide-y divide-fg/15 border-y border-fg/15">
                  {chapter.entries.map((entry) => (
                    <li key={entry.text} className="grid gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[6.5rem_1fr] sm:items-baseline">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{entry.kind}</span>
                      <span className="text-[15px] leading-relaxed text-fg/85">{entry.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>
    </PageShell>
  )
}
