import { leadership, honors } from '@/data/community'
import { Reveal, Section, SubHead } from '@/components/ui/Editorial'

/**
 * Community — leadership roles as three ruled columns, then the honor
 * roll as a dated list.
 */
export function Community() {
  return (
    <Section
      id="community"
      index={6}
      label="Leadership & community"
      tone="mist"
      title={[{ text: 'Leading and ' }, { text: 'volunteering.', accent: true }]}
    >
      <div className="grid gap-x-8 border-t border-fg/15 md:grid-cols-3">
        {leadership.map((l, i) => (
          <Reveal key={l.org} delay={i * 70} className="border-b border-fg/15 py-6 md:border-b-0 md:pb-0">
            <p className="meta tabular-nums">{l.period}</p>
            <h3 className="display mt-2 text-2xl leading-tight">{l.role}</h3>
            <p className="mt-1 text-[15px] font-semibold text-accent">{l.org}</p>
            <p className="prose-body mt-3 text-[15px]">{l.body}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14">
        <SubHead>Honors</SubHead>
        <ul className="mt-4 divide-y divide-fg/15 border-y border-fg/15">
          {honors.map((h) => (
            <li key={h.title} className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-4 py-3.5">
              <span className="text-sm tabular-nums text-fg/65">{h.year}</span>
              <span className="text-[15px] text-fg/85">{h.title}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
