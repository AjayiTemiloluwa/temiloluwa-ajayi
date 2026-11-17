import { interests } from '@/data/interests'
import { PageShell } from '@/components/PageShell'
import { ToolkitList } from '@/components/sections/Skills'
import { InterestShelf } from '@/components/ui/InterestShelf'
import { CONTAINER, Section } from '@/components/ui/Editorial'

/**
 * /interests — every interest as a card with a Flip-animated filter
 * (All / The work / Off the clock), then the toolkit (skill groups from
 * the CV).
 */
export const metadata = {
  title: 'Interests',
  description:
    'The interests behind my work (AI, energy, finance, teaching and data) and life outside it: cooking, calisthenics, gaming, electrical work and sound engineering.',
}

export default function InterestsPage() {
  return (
    <PageShell
      kicker="Interests"
      title={[{ text: 'What I’m ' }, { text: 'into.', accent: true }]}
      blurb="The interests behind my work, and what I do when I’m not working."
    >
      <section className={`${CONTAINER} pb-16 sm:pb-24`}>
        <h2 className="sr-only">Interests</h2>
        <InterestShelf items={interests} />
      </section>

      <Section label="Skills">
        <ToolkitList />
      </Section>
    </PageShell>
  )
}
