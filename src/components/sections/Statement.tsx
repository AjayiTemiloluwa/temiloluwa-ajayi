import { StatementLines } from '@/components/anim/StatementLines'
import { education } from '@/data/experience'
import { CONTAINER, Reveal } from '@/components/ui/Editorial'

/**
 * Statement — who I am and what I care about, in three short lines that
 * rise out of their masks as they scroll in, one plain paragraph, then the
 * four UN Sustainable Development Goals my work and interests line up with
 * (each tied to something on the record), and the education pills.
 */

const SDGS = [
  {
    n: 7,
    name: 'Affordable and clean energy',
    color: '#FCC30B',
    body: 'My draft research uses machine learning on drilling and gas-flaring data from oil and gas operations.',
  },
  {
    n: 13,
    name: 'Climate action',
    color: '#3F7E44',
    body: 'Gas flaring is a large source of avoidable emissions. One draft paper estimates flared volumes from satellite records.',
  },
  {
    n: 9,
    name: 'Industry, innovation and infrastructure',
    color: '#FD6925',
    body: 'At work I build automation and compliance systems that run every day.',
  },
  {
    n: 4,
    name: 'Quality education',
    color: '#C5192D',
    body: 'I taught Python and data analysis to learners in Africa, Asia, Europe and North America.',
  },
] as const

export function Statement() {
  return (
    <section id="about" className="relative scroll-mt-16">
      <div className={`${CONTAINER} py-24 sm:py-36`}>
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <p className="eyebrow lg:col-span-12">About me</p>
          <h2 className="display leading-[1.02] lg:col-span-12" style={{ fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}>
            <StatementLines
              lines={[
                { text: 'Sustainability.', tone: 'text-fg' },
                { text: 'Artificial intelligence & technology.', tone: 'text-accent' },
                { text: 'Finance.', tone: 'text-lilac' },
              ]}
            />
          </h2>
          <p data-reveal-lines className="max-w-xl text-lg leading-relaxed text-fg/70 lg:col-span-6 lg:col-start-7">
            My work sits across these three. I&apos;m an AI and automation analyst in Lagos with a degree in petroleum
            engineering, and I&apos;m studying financial engineering. It lines up with four of the UN Sustainable
            Development Goals.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SDGS.map((g, i) => (
            <Reveal key={g.n} delay={i * 80} className="card group relative overflow-hidden p-6 sm:p-7">
              <span
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: g.color }}
              />
              <span
                className="inline-flex h-12 min-w-12 items-center justify-center rounded-xl px-2 text-lg font-bold text-white"
                style={{ background: g.color }}
                aria-label={`Sustainable Development Goal ${g.n}`}
              >
                {g.n}
              </span>
              <h3 className="display mt-5 text-2xl leading-tight">{g.name}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-fg/70">{g.body}</p>
            </Reveal>
          ))}
        </div>

        <ul className="mt-10 flex flex-wrap gap-3">
          {education.map((e) => (
            <li key={e.degree} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-fg/12 px-5 py-2.5 text-sm">
              <span className={`h-2 w-2 rounded-full ${e.current ? 'bg-accent' : 'bg-fg/40'}`} aria-hidden="true" />
              <span className="font-semibold">{e.degree}</span>
              <span className="text-fg/60">
                {e.school} · {e.period}
              </span>
              {e.current && <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">In progress</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
