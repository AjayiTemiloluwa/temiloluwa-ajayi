import { profile, pillars } from '@/data/resume'
import { education } from '@/data/experience'
import { Reveal, Ruled, Section, SubHead } from '@/components/ui/Editorial'

/**
 * About — the opening spread: the story set large in the display face,
 * then education as a ruled record, then the four disciplines as a
 * numbered two-by-two.
 */
export function About() {
  return (
    <Section
      id="about"
      index={1}
      label="About"
      title={[{ text: 'About ' }, { text: 'me.', accent: true }]}
    >
      <Reveal>
        <p data-scrub-words className="display text-2xl leading-[1.3] sm:text-[2rem]">
          I&apos;m {profile.name}. I trained in petroleum engineering, I now build AI and automation systems, and
          I&apos;m studying for an M.Sc in financial engineering at WorldQuant University.
        </p>
        <div className="prose-body mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          <p>
            What connects them is using data on real operations. Energy and climate come first for me, and I want
            to understand how the energy transition gets financed.
          </p>
          <p>
            I&apos;ve also done freelance data science, interned at SLB, taught Python to learners on four
            continents, led student logistics and IT teams, and volunteered with Junior Achievers.
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-14">
        <SubHead>Education</SubHead>
        <Ruled className="mt-4">
          {education.map((e) => (
            <li key={e.degree} className="grid gap-x-6 gap-y-1 py-5 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="display text-xl sm:text-2xl">{e.degree}</p>
                <p className="meta mt-1">
                  {e.school} · {e.place}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm tabular-nums text-fg/70">{e.period}</p>
                <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.14em] ${e.current ? 'text-accent' : 'text-fg/65'}`}>
                  {e.current ? 'In progress' : 'Completed'}
                </p>
              </div>
            </li>
          ))}
        </Ruled>
      </Reveal>

      <div className="mt-14">
        <SubHead>What I do</SubHead>
        <div className="mt-4 grid gap-x-10 border-t border-fg/15 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 70} className="border-b border-fg/15 py-6">
              <div className="flex items-baseline gap-4">
                <span className="text-sm tabular-nums text-fg/65">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="display text-2xl italic">{p.title}</h3>
                  <p className="prose-body mt-2 text-[15px]">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  )
}
