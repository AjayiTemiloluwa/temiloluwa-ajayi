import type { ReactNode } from 'react'
import { profile } from '@/data/resume'
import { GithubIcon, LinkedinIcon } from '@/components/ui/BrandIcons'

/**
 * SiteFooter — the one footer bar: name, social marks, the copyright
 * line, and a slot on the right for the page's closing action
 * (back-to-top on home, "Say hello" on sub-pages).
 */
export function SiteFooter({ action, className = '' }: { action: ReactNode; className?: string }) {
  const year = new Date().getFullYear()
  const social = [
    { href: profile.github, label: 'GitHub profile', Icon: GithubIcon },
    { href: profile.linkedin, label: 'LinkedIn profile', Icon: LinkedinIcon },
  ]
  return (
    <div className={`border-t border-fg/15 ${className}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-5 sm:flex-row sm:px-8 sm:py-7">
        <div className="flex items-center gap-4">
          <span className="font-display text-lg text-fg">{profile.name}</span>
          <span className="flex items-center gap-1.5">
            {social.map(({ href, label, Icon }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="icon-btn">
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </span>
        </div>
        <p className="text-[13px] text-fg/65">
          © {year} · {profile.location}
        </p>
        {action}
      </div>
    </div>
  )
}
