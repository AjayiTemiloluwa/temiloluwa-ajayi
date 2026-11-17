import { Certifications } from '@/components/sections/Certifications'
import { PageShell } from '@/components/PageShell'

/**
 * /credentials — the full credentials ledger, row by row; the home page
 * shows the summary and links here. Mirrors the /work pattern: one
 * component, an `embedded` toggle.
 */
export const metadata = {
  title: 'Credentials',
  description:
    'Google Data Analytics, Dataquest, the Aspire Leaders Program, and recognition from SPE and NHEF, each with its issuer, date and proof.',
}

export default function CredentialsPage() {
  return (
    <PageShell
      kicker="Credentials"
      title={[{ text: 'Courses, certificates ' }, { text: 'and awards.', accent: true }]}
      blurb="Each one lists the issuer and date, with a link to verify it, the PDF, or a photo of the framed award."
    >
      <Certifications embedded />
    </PageShell>
  )
}
