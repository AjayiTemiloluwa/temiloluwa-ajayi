import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { profile } from '@/data/resume'
import { FooterCurtain } from '@/components/anim/FooterCurtain'
import { FluidText } from '@/components/effects/fluid'
import { SiteFooter } from '@/components/SiteFooter'
import { CopyEmail } from '@/components/ui/CopyEmail'
import { CONTAINER, Reveal } from '@/components/ui/Editorial'

/**
 * Contact — the closing page, and the FOOTER REVEAL: it sits underneath
 * the opaque content above, which wipes upward off it like a curtain as
 * you scroll (FooterCurtain). The headline ripples away from the cursor
 * and the finger, like the hero name (FluidText).
 * Not sticky, so the whole page can be read on any screen height. It inverts the
 * palette (ink ground, paper type): a giant closing line, what the door
 * is open to, then every way to reach out as one ruled list.
 */

type ContactLink = {
  href: string
  cursor: string
  label: string
  value: string
  external?: boolean
  download?: boolean
}

const LINKS: ContactLink[] = [
  { href: `mailto:${profile.email}`, cursor: 'SAY HELLO', label: 'Email', value: profile.email },
  { href: profile.linkedin, cursor: 'OPEN', label: 'LinkedIn', value: profile.linkedinLabel, external: true },
  { href: profile.github, cursor: 'GITHUB', label: 'GitHub', value: profile.githubLabel, external: true },
  { href: profile.cvPath, cursor: 'DOWNLOAD', label: 'CV', value: 'Download the CV (PDF)', download: true },
]

const OPEN_TO = [
  'Climate fintech & sustainable-finance roles',
  'Engineering roles in energy AI & climate tech',
  'Graduate & PhD research positions',
  'Fellowships & research programs',
]

export function Contact() {
  return (
    <FooterCurtain id="contact" className="theme-ink">
      <div className="flex min-h-[100svh] flex-col justify-between">
      <div className={`${CONTAINER} grid gap-x-10 gap-y-8 pt-14 sm:pt-20 lg:grid-cols-12`}>
        <div className="lg:col-span-7">
          <p data-curtain-rise className="eyebrow">Say hello</p>
          <h2 data-curtain-title className="display mt-4 leading-[0.98]" style={{ fontSize: 'clamp(2.5rem, 5.5vw + 0.5rem, 5.5rem)' }}>
            <FluidText text="Let’s" strength={24} radius={170} />{' '}
            <span className="italic text-accent">
              <FluidText text="talk." strength={24} radius={170} />
            </span>
          </h2>
          <p data-curtain-rise className="prose-body mt-6 hidden max-w-md sm:block sm:text-lg">
            Email is the quickest way to reach me, whether it’s about a role, a project or a question.
          </p>
          <div data-curtain-rise className="mt-6">
            <CopyEmail email={profile.email} />
          </div>
          <div data-curtain-rise className="mt-8 hidden sm:block">
            <p className="eyebrow !text-fg/65">I’m open to</p>
            <ul className="mt-3 space-y-1.5 text-[15px] text-fg/75">
              {OPEN_TO.map((o) => (
                <li key={o} className="flex gap-3">
                  <span className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Reveal className="lg:col-span-5 lg:pt-10">
          <ul className="divide-y divide-fg/15 border-y border-fg/15">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  {...(l.download ? { download: true } : {})}
                  data-cursor={l.cursor}
                  className="group grid grid-cols-[5rem_1fr_auto] items-baseline gap-x-4 py-4 sm:py-5"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-fg/65">{l.label}</span>
                  <span className="min-w-0 break-words text-base text-fg transition-colors group-hover:text-accent sm:text-lg">{l.value}</span>
                  <ArrowUpRight className="h-4 w-4 self-center text-fg/35 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <SiteFooter
        className="mt-10 sm:mt-16"
        action={
          <a href="#top" data-cursor="TO TOP" className="icon-btn" aria-label="Back to top">
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </a>
        }
      />
      </div>
    </FooterCurtain>
  )
}
