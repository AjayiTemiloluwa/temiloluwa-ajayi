import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/anim/ScrollProgress";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Statement } from "@/components/sections/Statement";
import { ToolCards } from "@/components/sections/ToolCards";
import { Showcase } from "@/components/sections/Showcase";
import { PhotoGallery } from "@/components/sections/PhotoGallery";
import { Experience } from "@/components/sections/Experience";
import { Certifications } from "@/components/sections/Certifications";
import { Community } from "@/components/sections/Community";
import { Contact } from "@/components/sections/Contact";

/**
 * Temiloluwa Samuel Ajayi — digital resume.
 * v2, night-studio layout: a stage-like hero (giant name, neon worm,
 * throwable shapes, live portrait), a scroll-lit statement, four feature
 * cards with live mini-animations, a showcase with a 3D skill drum, the
 * pinned photo gallery, then the ledgers and a neon closing page.
 *
 * The home page is the summary: Research, Work and Credentials each show
 * a preview here and hand off to their own page for the full ledger, so
 * nothing is told twice. The nav lists those pages in this same order.
 *
 * Footer reveal: the content layer is opaque with z-10 and acts as a
 * curtain; Contact sits under it (z-0) and holds still while the curtain
 * wipes up off it (FooterCurtain). Never sticky, so it is never cut off
 * on short screens.
 */
export default function Home() {
  return (
    <>
      <ScrollProgress />
      <div data-scroll-content className="relative isolate">
        {/* ink behind the curtain: when its bottom corners round off during
            the footer reveal, the cut-outs show the dark Contact page, not paper */}
        <div aria-hidden="true" className="theme-ink absolute inset-x-0 bottom-0 -z-10 h-[200svh] bg-paper" />
        <div className="relative z-10 bg-paper">
          <Nav />
          <main>
            <Hero />
            <Marquee />
            <Statement />
            <ToolCards />
            <Showcase />
            <PhotoGallery />
            <Experience />
            <Certifications />
            <Community />
          </main>
        </div>
        <Contact />
      </div>
    </>
  );
}