'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { profile } from '@/data/resume'
import { NAV_ROUTES } from '@/data/routes'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

/**
 * Nav — the running head: name on the left set in the display face,
 * section links in the middle (same order the home page tells the
 * story, current page underlined), availability and Contact on the
 * right. Shared by the home page and every sub-page (via PageShell).
 * Below `md` the links fold into a menu panel. On the home page the
 * name and Contact are in-page anchors; on a sub-page they route to "/".
 */
/** Home first, then the sub-pages in story order. */
const LINKS = [{ href: '/', label: 'Home' }, ...NAV_ROUTES] as const

export function Nav() {
  const pathname = usePathname()
  const home = pathname === '/'
  const [open, setOpen] = useState(false)

  // Close the menu on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-fg/15 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href={home ? '#top' : '/'}
          aria-label={`${profile.name} — home`}
          className="font-display text-xl leading-none tracking-tight text-fg"
        >
          {profile.firstName} <span className="italic text-accent">{profile.lastName}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {LINKS.map(({ href, label }) => {
            const current = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`relative py-3 text-sm transition-colors hover:text-fg ${
                  current ? 'font-semibold text-fg after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-accent' : 'text-fg/65'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-2 text-[13px] text-fg/65 lg:inline-flex">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-accent" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            {profile.availability}
          </span>
          <ThemeToggle />
          <Link
            href={home ? '#contact' : '/#contact'}
            data-cursor="SAY HELLO"
            className="inline-flex h-9 items-center justify-center rounded-full bg-fg px-5 text-[13px] font-semibold text-paper transition hover:bg-accent"
          >
            Contact
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="icon-btn md:hidden"
          >
            {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* mobile menu — the same links, set large */}
      {open && (
        <nav id="mobile-menu" aria-label="Primary" className="border-t border-fg/15 bg-paper md:hidden">
          <ul className="mx-auto w-full max-w-6xl px-5 pb-4 pt-1 sm:px-8">
            {LINKS.map(({ href, label }, i) => {
              const current = pathname === href
              return (
                <li key={href} className="border-b border-fg/15 last:border-b-0">
                  <Link
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-3.5"
                  >
                    <span className="text-xs tabular-nums text-fg/55">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`font-display text-2xl ${current ? 'italic text-accent' : 'text-fg'}`}>{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
