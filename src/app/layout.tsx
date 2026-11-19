import { paletteBootScript, paletteCss } from "@/lib/palettes";
import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { ScrollRipples } from "@/components/ui/ScrollRipples";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { TouchFx } from "@/components/ui/TouchFx";
import { TextFx } from "@/components/ui/TextFx";
import { PageTransition } from "@/components/ui/PageTransition";
import { profile } from "@/data/resume";
import "./globals.css";

// Two families: Inter for running copy and labels, Inter Tight (a
// heavy, tightly spaced grotesk) for everything set at display scale.
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const siteTitle = `${profile.name} — AI, Energy & Finance`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  // Sub-pages set a short title ("Work") and inherit the name from here.
  title: { default: siteTitle, template: `%s — ${profile.name}` },
  description: profile.statement,
  keywords: [
    "Temiloluwa Ajayi",
    "Climate Fintech",
    "Sustainable Energy",
    "AI",
    "Energy Transition",
    "Well Control",
    "Machine Learning",
    "SPE",
    "Financial Engineering",
    "Gas Flaring",
    "Lagos",
    "Portfolio",
  ],
  openGraph: {
    title: siteTitle,
    description: profile.statement,
    type: "website",
    siteName: profile.name,
    locale: "en_NG",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e100f" },
    { media: "(prefers-color-scheme: dark)", color: "#0e100f" },
  ],
};

/**
 * Runs before first paint: apply the saved theme, else the system one.
 * Kept tiny and dependency-free so it can be inlined.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`;

/** Structured data — who this is, and where else to find him. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  url: profile.siteUrl,
  sameAs: [profile.github, profile.linkedin],
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Ibadan" },
    { "@type": "CollegeOrUniversity", name: "WorldQuant University" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: paletteBootScript }} />
        <style dangerouslySetInnerHTML={{ __html: paletteCss() }} />
      </head>
      <body className="min-h-full bg-paper font-sans text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <CursorGlow />
        <ScrollRipples />
        <SmoothScroll />
        <TouchFx />
        <TextFx />
        <PageTransition />
        {children}
      </body>
    </html>
  );
}