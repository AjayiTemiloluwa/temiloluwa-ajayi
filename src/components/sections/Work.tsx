import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { work, type WorkItem } from '@/data/work'
import { countWord } from '@/lib/words'
import { CONTAINER, Reveal, Section, Tags } from '@/components/ui/Editorial'
import { Cited } from '@/components/ui/Cited'

/** How many projects the home page previews before handing off to /work. */
const HOME_PREVIEW = 3

/**
 * Work — the work ledger as ruled entries: number, title and client on
 * the left, the story and stack in the middle, the headline figure set
 * large on the right. The home page previews the first three and links
 * to /work; /work (`embedded`) lists every project.
 */

function Entry({ item, index }: { item: WorkItem; index: number }) {
  return (
    <article className="grid gap-x-8 gap-y-4 py-8 sm:grid-cols-12">
      <div className="sm:col-span-8">
        <p className="meta flex flex-wrap items-baseline gap-x-3">
          <span className="tabular-nums text-fg/65">{String(index + 1).padStart(2, '0')}</span>
          <span>
            {item.org} · {item.year}
          </span>
          {item.featured && <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Featured</span>}
        </p>
        <h3 className="display mt-2 text-2xl leading-tight sm:text-[2rem]">{item.title}</h3>
        <Cited cite={item.cite} className="prose-body mt-3 max-w-xl">
          {item.summary}
        </Cited>
        <Tags items={item.stack} className="mt-4" />
      </div>
      {item.metric && (
        <div className="sm:col-span-4 sm:text-right">
          <p data-count className="display text-5xl leading-none text-accent sm:text-6xl">{item.metric.value}</p>
          <p className="meta mt-2">{item.metric.label}</p>
        </div>
      )}
    </article>
  )
}

function Entries({ items }: { items: readonly WorkItem[] }) {
  return (
    <ol className="border-t border-fg/15">
      {items.map((item, i) => (
        <Reveal as="li" key={item.title} delay={(i % 3) * 60} className="border-b border-fg/15">
          <Entry item={item} index={i} />
        </Reveal>
      ))}
    </ol>
  )
}

export function Work({ embedded = false }: { embedded?: boolean }) {
  if (embedded) {
    return (
      <section id="work" className={`${CONTAINER} py-12 sm:py-16`}>
        <h2 className="sr-only">Projects</h2>
        <Entries items={work} />
      </section>
    )
  }

  return (
    <Section
      id="work"
      index={3}
      label="Selected work"
      title={[{ text: 'Things I’ve ' }, { text: 'built.', accent: true }]}
      lede="A compliance platform, a daily reminder system and data pipelines, newest first."
      aside={
        work.length > HOME_PREVIEW && (
          <Link href="/work" data-cursor="SEE ALL" className="link">
            All {countWord(work.length)} projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )
      }
    >
      <Entries items={work.slice(0, HOME_PREVIEW)} />
    </Section>
  )
}
