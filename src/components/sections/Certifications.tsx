import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, FileDown } from 'lucide-react'
import {
  allCertifications,
  credentialGroups,
  recognition,
  credentialsStrip,
  credentialStats,
} from '@/data/certifications'
import { profile } from '@/data/resume'
import { CONTAINER, Reveal, Section, SubHead } from '@/components/ui/Editorial'

/**
 * Certifications — the credentials ledger. Four derived figures, the
 * flagship certificate, the framed awards; and on /credentials
 * (`embedded`) every credential as a ruled table grouped by track, with
 * verify / download links. The home page links through instead.
 */

const STATS = [
  { v: credentialStats.total, l: 'credentials & awards' },
  { v: credentialStats.issuers, l: 'issuers, from Google to SPE' },
  { v: credentialStats.verifiable, l: 'verifiable online' },
  { v: credentialStats.framed, l: 'framed awards' },
]

function Summary() {
  const featured = allCertifications.find((c) => c.featured)
  return (
    <>
      {/* the figures */}
      <Reveal>
        <dl className="grid grid-cols-2 gap-x-8 border-y border-fg/15 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="py-6">
              <dd data-count className="display text-5xl leading-none text-accent sm:text-6xl">{s.v}</dd>
              <dt className="meta mt-3 max-w-[11rem]">{s.l}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* the flagship */}
      {featured && (
        <Reveal className="mt-12">
          <p className="eyebrow">Main certificate</p>
          <h3 className="display mt-3 text-3xl leading-tight sm:text-4xl">{featured.title}</h3>
          <p className="meta mt-2">
            {featured.issuer} · {featured.date}
          </p>
          <p className="prose-body mt-4 max-w-xl">
            Eight courses covering spreadsheets, SQL, Tableau and R, ending with a case study. Each course
            certificate is listed on the credentials page with its own verification link.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {featured.verify && (
              <a href={featured.verify} target="_blank" rel="noopener noreferrer" data-cursor="VERIFY" className="btn-primary">
                Verify on Coursera
              </a>
            )}
            {featured.file && (
              <a href={featured.file} download data-cursor="DOWNLOAD" className="btn-ghost">
                <FileDown className="h-4 w-4" aria-hidden="true" />
                Certificate PDF
              </a>
            )}
          </div>
          <p className="meta mt-6 border-t border-fg/15 pt-4">Also: {credentialsStrip.slice(1).join(' · ')}</p>
        </Reveal>
      )}
    </>
  )
}

function Ledger() {
  const rows = allCertifications.filter((c) => !c.featured)
  return (
    <div className="space-y-12">
      {credentialGroups.map((g) => {
        const group = rows.filter((c) => c.group === g.label)
        if (!group.length) return null
        return (
          <Reveal key={g.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="display text-2xl">{g.label}</h3>
              <p className="meta">{g.blurb}</p>
            </div>
            <ul className="mt-4 divide-y divide-fg/15 border-y border-fg/15">
              {group.map((c) => (
                <li key={c.id} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium leading-snug text-fg">{c.title}</p>
                    <p className="meta mt-0.5">{c.issuer}</p>
                  </div>
                  <div className="flex items-center gap-5 text-[13px]">
                    <span className="tabular-nums text-fg/65">{c.date}</span>
                    {c.verify && (
                      <a href={c.verify} target="_blank" rel="noopener noreferrer" data-cursor="VERIFY" className="link !text-[13px]">
                        Verify ↗
                      </a>
                    )}
                    {c.file && (
                      <a href={c.file} download data-cursor="DOWNLOAD" className="link !text-[13px]">
                        PDF ↓
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        )
      })}
    </div>
  )
}

function Awards() {
  return (
    <div>
      <SubHead>Framed awards</SubHead>
      <div className="mt-5 grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {recognition.map((r, i) => (
          <Reveal as="figure" key={r.id} delay={i * 80}>
            <div className="overflow-hidden bg-mist">
              <Image
                src={r.image}
                alt={r.alt}
                width={r.w}
                height={r.h}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="photo-bw h-auto w-full object-cover"
              />
            </div>
            <figcaption className="mt-4">
              <p className="display text-xl leading-snug">{r.title}</p>
              <p className="meta mt-1">
                {r.issuer} · {r.date}
              </p>
              <p className="prose-body mt-2 text-[15px]">{r.note}</p>
            </figcaption>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

function Originals() {
  return (
    <p className="meta mt-12 border-t border-fg/15 pt-5">
      I keep the originals.{' '}
      <a href={profile.cvPath} download className="link !text-[13px]">
        Download the CV
      </a>{' '}
      or ask me for any certificate PDF.
    </p>
  )
}

export function Certifications({ embedded = false }: { embedded?: boolean }) {
  if (embedded) {
    return (
      <section id="credentials" className={`${CONTAINER} py-12 sm:py-16`}>
        <h2 className="sr-only">All credentials</h2>
        <Summary />
        <div className="mt-16">
          <Ledger />
        </div>
        <div className="mt-16">
          <Awards />
        </div>
        <Originals />
      </section>
    )
  }

  return (
    <Section
      id="credentials"
      index={5}
      label="Credentials"
      title={[{ text: 'Courses, certificates ' }, { text: 'and awards.', accent: true }]}
      aside={
        <Link href="/credentials" data-cursor="SEE ALL" className="link">
          See all {credentialStats.total}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    >
      <Summary />
      <div className="mt-14">
        <Awards />
      </div>
    </Section>
  )
}
