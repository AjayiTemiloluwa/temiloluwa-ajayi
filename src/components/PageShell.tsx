import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import type { MaskSegment } from '@/components/anim/MaskText'
import { FluidTitle } from '@/components/anim/FluidTitle'
import { HeaderObject, type HeaderShape } from '@/components/ui/HeaderObject'
import { Nav } from '@/components/Nav'
import { SiteFooter } from '@/components/SiteFooter'
import { CONTAINER } from '@/components/ui/Editorial'

/**
 * PageShell — shared chrome for the sub-pages (/research, /work,
 * /credentials, /interests, /life): the same Nav as home, a title page
 * (kicker, display-scale title, standfirst) closed by a rule, and the
 * footer bar. The title ripples away from the cursor and the finger,
 * like the hero name (FluidTitle). Each page has its own real-time 3D
 * companion (HeaderObject) that travels behind the content as you scroll. Content renders as children between them.
 */
/** each page's 3D header object: its form and colour */
const OBJECTS: { match: string; shape: HeaderShape; tone: string }[] = [
  { match: 'research', shape: 'blob', tone: '--accent-rgb' },
  { match: 'work', shape: 'knot', tone: '--lilac-rgb' },
  { match: 'credential', shape: 'medal', tone: '--orange-rgb' },
  { match: 'interest', shape: 'orbit', tone: '--pink-rgb' },
  { match: 'life', shape: 'gyro', tone: '--blue-rgb' },
]

export function PageShell({
  kicker,
  title,
  blurb,
  children,
}: {
  kicker: string
  title: MaskSegment[]
  blurb: string
  children: React.ReactNode
}) {
  const o = OBJECTS.find((x) => kicker.toLowerCase().includes(x.match))
  return (
    <>
    {/* the page's 3D companion: fixed behind the content, travelling with the scroll */}
    {o && <HeaderObject shape={o.shape} tone={o.tone} />}
    <div id="top" className="relative z-[1] min-h-svh">
      <Nav />

      <main>
        <section className={`${CONTAINER} relative pb-12 pt-10 sm:pb-16 sm:pt-14`}>
          <div className="relative z-10 flex items-center justify-between gap-6 border-b border-fg/15 pb-4">
            <p className="eyebrow">{kicker}</p>
            <Link href="/" data-cursor="HOME" className="inline-flex h-9 items-center gap-2 rounded-full border border-fg/30 px-4 text-[13px] font-semibold text-fg transition-colors hover:border-fg hover:bg-fg hover:text-paper">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back home
            </Link>
          </div>
          <h1 className="display pointer-events-none relative z-10 mt-8 max-w-4xl leading-[0.98] sm:mt-12" style={{ fontSize: 'clamp(2.75rem, 7vw + 0.5rem, 6.5rem)' }}>
            <FluidTitle segments={title} />
          </h1>
          <p className="relative z-10 mt-6 max-w-xl text-xl leading-snug text-fg/70 sm:text-2xl">{blurb}</p>
        </section>

        {children}
      </main>

      <footer className="mt-8">
        <SiteFooter
          action={
            <Link href="/#contact" data-cursor="SAY HELLO" className="link">
              Say hello <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      </footer>
    </div>
    </>
  )
}
