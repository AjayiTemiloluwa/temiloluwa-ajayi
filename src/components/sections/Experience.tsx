import { experience } from '@/data/experience'
import { Reveal, Section, Tags } from '@/components/ui/Editorial'
import { TimelineTrack } from '@/components/ui/TimelineTrack'
import { Cited } from '@/components/ui/Cited'

/**
 * Experience — the record, newest first. Each role is a ruled row: dates
 * and place in a narrow column, the role, employer and outcomes beside it.
 */
export function Experience() {
  return (
    <Section
      id="experience"
      index={4}
      label="Experience"
      tone="mist"
      title={[{ text: 'Where I’ve ' }, { text: 'worked.', accent: true }]}
    >
      <TimelineTrack>
      <ol className="border-t border-fg/15">
        {experience.map((role, i) => (
          <Reveal as="li" key={`${role.org}-${role.period}`} delay={(i % 3) * 60} className="grid gap-x-8 gap-y-3 border-b border-fg/15 py-8 sm:grid-cols-[11rem_1fr]">
            <div>
              <p className="text-sm tabular-nums text-fg/75">{role.period}</p>
              <p className="meta mt-1">{role.place}</p>
              {role.current && (
                <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                    <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-accent" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  Current
                </p>
              )}
            </div>
            <div>
              <h3 className="display text-2xl leading-tight sm:text-[1.75rem]">{role.title}</h3>
              <p className="mt-1 text-[15px] font-semibold text-accent">{role.org}</p>
              <ul className="prose-body mt-4 space-y-2 text-[15px]">
                {role.bullets.map((b) => (
                  <li key={b.text} className="flex gap-3">
                    <span className="mt-[0.7em] h-px w-3 shrink-0 bg-fg/40" aria-hidden="true" />
                    <Cited cite={b.cite}>{b.text}</Cited>
                  </li>
                ))}
              </ul>
              <Tags items={role.tags} className="mt-4" />
            </div>
          </Reveal>
        ))}
      </ol>
      </TimelineTrack>
    </Section>
  )
}
