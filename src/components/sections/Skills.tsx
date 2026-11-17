import { skillGroups } from '@/data/skills'
import { Reveal, Section } from '@/components/ui/Editorial'

/**
 * Toolkit list — each skill group as a ruled row: the group name in a
 * narrow column, the skills as 3D chips that flip up into place in a
 * stagger as the row scrolls in (TextFx) and tilt under the pointer. Shared by the home
 * Toolkit section and /interests.
 */
export function ToolkitList() {
  return (
    <dl className="border-t border-fg/15">
      {skillGroups.map((g, i) => (
        <Reveal key={g.label} delay={i * 60} className="grid gap-x-8 gap-y-2 border-b border-fg/15 py-6 sm:grid-cols-[13rem_1fr]">
          <dt className="eyebrow pt-1.5">{g.label}</dt>
          <dd>
            <ul data-chips className="flex flex-wrap gap-2.5 [perspective:900px]">
              {g.skills.map((s) => (
                <li
                  key={s}
                  data-chip
                  data-tilt
                  className="relative rounded-2xl border border-fg/12 bg-mist px-4 py-2.5 text-lg font-semibold tracking-[-0.02em] transition-colors hover:border-accent hover:text-accent sm:text-xl"
                >
                  {s}
                </li>
              ))}
            </ul>
          </dd>
        </Reveal>
      ))}
    </dl>
  )
}

export function Skills() {
  return (
    <Section
      id="skills"
      index={7}
      label="Skills"
      title={[{ text: 'Tools and ' }, { text: 'skills.', accent: true }]}
    >
      <ToolkitList />
    </Section>
  )
}
