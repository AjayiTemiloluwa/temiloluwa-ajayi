> **v2 (night-studio)** — a separate copy of the site with a new design: near-black stage, neon accents, heavy grotesk type. Home: stage hero (giant name, morphing neon worm, throwable shapes, live LiquidPortrait shader: liquid colour trail · flick to shatter · tap to flip · idle blink-and-melt), scroll-lit statement, four feature cards with live mini-animations, a 3D skill drum showcase, the photo gallery (scroll past and it spirals away; click a photo and it flies into a 3D photo book whose pages turn one per gesture), the ledgers and a neon-green closing page. Every page change plays a curtain transition (PageTransition). Runs on port 3002 (`npm run dev`). v1 lives on unchanged in ../tajayi-portfolio.

# Temiloluwa Samuel Ajayi — Digital Resume

A portfolio built around one position: **sustainable energy and climate fintech** —
AI systems that make energy operations safer and cleaner, and the financial
infrastructure that funds the transition.

Next.js (App Router) · React 19 · Tailwind CSS · Motion · Lenis.

## How the site is organized

The home page is the summary. Research, Work and Credentials each show a preview
there and hand off to their own page for the full ledger, so nothing is told twice.
The nav lists the sub-pages in the same order the home page tells the story.

### Home (`/`)

1. **Hero** — masthead line, display-scale name, rotating intersection line, a live 3D portrait (three.js: ~34k points fly in and assemble the photo, which tilts toward the cursor or finger, parts under it and turns to colour, then disperses on scroll), an Energy × Climate × AI × Finance ring that spins with the scroll, credentials strip
2. **Marquee** — infinite craft ticker
3. **About** — the story, education, four indexed pillars (Build · Model · Teach · Lead)
4. **Research** — one row per manuscript, each linking to its full entry on `/research` (the road to grad school lives there)
5. **PhotoGallery** — tiles fly in and assemble into a tilted wall; the stage pins and the camera dives into the first photo; each wheel notch or swipe then shows exactly the next photo (GSAP Observer), wiping in over the last; after the tenth, the camera pulls back out to the wall, where a WebGL film reel and the closing card wait, and the page carries on
6. **Selected Work** — the first three projects, linking to `/work`
7. **Experience** — the full timeline, all five roles
8. **Credentials** — flagship certificate, derived counts, framed awards, link to `/credentials`
9. **Community** — leadership cards + honor roll
10. **Toolkit** — skill groups
11. **Contact** — curtain reveal: the page wipes up off the inverted ink Contact page beneath it (rounded edge, shadow, veil lifting), never cut off on short screens: email, LinkedIn, GitHub, phone, CV

### Sub-pages

| Route | What it holds |
| --- | --- |
| `/research` | Areas of inquiry, every study with method, findings and draft download, the road to grad school |
| `/work` | The full work ledger — all projects |
| `/credentials` | Every credential row by row, grouped by track, with verify links and PDFs |
| `/interests` | The curiosity shelf (work lenses + off the clock) and the toolkit |
| `/life` | Year-by-year chapters, newest first — every role, project, manuscript, credential and award |

## Where things live

```
src/
  app/            routes, layout (metadata, fonts, global effects), sitemap, robots
  components/
    Nav.tsx         shared header — desktop links, mobile menu, current-page marker
    PageShell.tsx   shared chrome for every sub-page
    SiteFooter.tsx  the one footer bar (home + sub-pages)
    sections/       home-page sections (Work and Certifications also render their full page via `embedded`)
    ui/Editorial.tsx     the page grid: Section, Ruled, Tags, SubHead
    anim/ ui/ effects/   motion primitives and pointer effects
  data/           every fact on the site — edit here, the pages follow
  lib/            small helpers
public/           CV, certificate PDFs, manuscript drafts, optimized photos
```

**Data is the single source of truth.** Counts shown on the page (credentials,
issuers, manuscripts, chapters, lenses) are derived from the data files, and the
nav, sitemap and photo lists each come from one array — add a row and every
place that shows it updates.

| File | Holds |
| --- | --- |
| `resume.ts` | Profile, contact, site URL, focus axes, marquee, pillars |
| `routes.ts` | Sub-page list (nav + sitemap) |
| `experience.ts` | Roles and education |
| `work.ts` | Projects |
| `research.ts` | Research areas, studies, grad path |
| `certifications.ts` | Credential ledger, groups, framed awards, derived stats |
| `community.ts` | Leadership and honors |
| `skills.ts` | Toolkit groups |
| `interests.ts` | Curiosity shelf (`kind: 'work' \| 'life'`) |
| `chapters.ts` | Life timeline |
| `photos.ts` | Photo plates (the home-page gallery and its reel) |

## Design

Editorial: warm paper, ink type, one evergreen accent, and a closing page that inverts to ink. A light and a dark theme, switched from the header.

| Element | Detail |
| --- | --- |
| Tokens | `paper` (ground), `fg` (ink — text and rules), `mist` (tinted band), `accent` (evergreen), `ember` — RGB-triplet CSS variables in `globals.css`, mapped in `tailwind.config.js`. `:root[data-theme=dark]` redefines them for the dark theme, and `.theme-ink` swaps them for a subtree (the Contact page). |
| Type | Newsreader (serif, display scale: headings, figures, pull quotes) and Inter (running copy, labels). Emphasis is italic in the accent colour. |
| Grid | `<Section>` in `components/ui/Editorial.tsx`: numbered label and heading pinned in a 4-column margin, content in the 8-column body. Lists are hairline-ruled rows, not cards. |
| Vocabulary | `.eyebrow`, `.meta`, `.display`, `.prose-body`, `.btn-primary`, `.btn-ghost`, `.link`, `.icon-btn` — defined once in `globals.css`. |
| Photos | Black & white (`.photo-bw`), colour returns on hover, captioned beneath like plates. |
| Motion | Lenis smooth scroll (no page tilt, so scroll-linked motion stays steady), masked word reveals, the hero name that ripples away from the cursor, cursor hint labels, the footer reveal. |
| three.js | The hero portrait scene (PortraitStage): points, depth relief, pointer parting, colour on hover. |
| Mobile | Folded nav menu, single-column sections, touch feedback. |
| Theme | `ThemeToggle` flips `<html data-theme>` and saves the choice; an inline script in the layout applies the saved (or system) theme before first paint, so there is no flash. |
| A11y | `prefers-reduced-motion` stills every effect; decorative layers are `aria-hidden`; visible keyboard focus; quiet text never drops below 65% ink, which keeps it at 4.5:1 contrast or better in both themes. |

## Copy rules

Every statement on the site must be traceable to the CV (`public/Temiloluwa-Ajayi-CV.pdf`), a certificate in `public/certificates`, or a manuscript in `public/downloads`. State results as results and aims as aims. Research entries list their limits next to their findings.

## Run

```bash
npm install
npm run dev        # http://localhost:3001
npm run typecheck  # tsc --noEmit
npm run build      # production build
```
