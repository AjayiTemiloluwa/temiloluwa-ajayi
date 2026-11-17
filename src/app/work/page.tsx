import { Work } from '@/components/sections/Work'
import { PageShell } from '@/components/PageShell'

/**
 * /work — the full work ledger, every project; the home page previews
 * the first three and links here.
 */
export const metadata = {
  title: 'Work',
  description: 'A compliance platform, automation and data pipelines I built at Sankore Investment, SLB Nigeria and GOLEARN Africa.',
}

export default function WorkPage() {
  return (
    <PageShell
      kicker="Selected work"
      title={[{ text: 'Things I’ve ' }, { text: 'built.', accent: true }]}
      blurb="Projects from Sankore, SLB, GOLEARN Africa and freelance work, newest first."
    >
      <Work embedded />
    </PageShell>
  )
}
