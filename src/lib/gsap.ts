'use client'

/**
 * GSAP, registered once for the whole site.
 *
 * Every animated component imports gsap and its plugins from here, so
 * plugins are registered exactly once, in the browser only, before any
 * component uses them. All of GSAP's plugins ship in the public `gsap`
 * package (3.13+).
 *
 * Where each plugin is used:
 *   ScrollTrigger  — gallery pin, hero exit, reveals, counters, marquee speed
 *   Observer       — one-photo-per-gesture gallery stepping     · PhotoGallery
 *   ScrollTo       — in-page links (Contact, back to top)      · TextFx
 *   SplitText      — headings, scrubbed paragraph, gallery captions
 *   ScrambleText   — labels that decode as they scroll in        · TextFx
 *   TextPlugin     — the hero's typewriter line                 · RotatingWord
 *   DrawSVG        — the Experience timeline line               · Experience
 *   MotionPath     — the dot that rides that line               · Experience
 *   MorphSVG       — moon ⇄ sun theme toggle                    · ThemeToggle
 *   Flip           — Interests filter                           · InterestShelf
 *   Observer       — grab-and-drag marquee                      · Marquee
 *   Physics2D      — confetti from "Copy email"                 · CopyEmail
 *   PhysicsProps   — the confetti's spin and drag               · CopyEmail
 *   CustomEase     — the site's "silk" ease
 *   Draggable      — throwable hero shapes, the skill reel        · HeroShapes, SkillReel
 *   Inertia        — the throw's glide and the reel's spin
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { TextPlugin } from 'gsap/TextPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Flip } from 'gsap/Flip'
import { Observer } from 'gsap/Observer'
import { Physics2DPlugin } from 'gsap/Physics2DPlugin'
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    SplitText,
    ScrambleTextPlugin,
    TextPlugin,
    DrawSVGPlugin,
    MotionPathPlugin,
    MorphSVGPlugin,
    Flip,
    Observer,
    Physics2DPlugin,
    PhysicsPropsPlugin,
    CustomEase,
    Draggable,
    InertiaPlugin,
    useGSAP,
  )
  // the site's signature ease — fast out, long soft settle
  CustomEase.create('silk', 'M0,0 C0.22,1 0.36,1 1,1')
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

type LenisLike = {
  scrollTo: (
    y: number,
    o: { duration?: number; easing?: (t: number) => number; lock?: boolean; force?: boolean; onComplete?: () => void },
  ) => void
}

/**
 * Glide the page to `y`. With smooth scrolling on, Lenis does the glide
 * itself (locked against wheel input until it lands), so the two never pull
 * against each other; otherwise GSAP's ScrollToPlugin does it.
 */
export function glide(y: number, { duration = 1, ease = 'power2.inOut', onComplete }: { duration?: number; ease?: string; onComplete?: () => void } = {}) {
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis
  if (lenis) {
    lenis.scrollTo(y, { duration, easing: gsap.parseEase(ease), lock: true, force: true, onComplete: () => onComplete?.() })
  } else {
    gsap.to(window, { scrollTo: { y, autoKill: false }, duration, ease, overwrite: true, onComplete })
  }
}

/** Hold the page still (wheel ignored by smooth scroll), or let it go. */
export const holdScroll = (on: boolean) => document.documentElement.toggleAttribute('data-scroll-hold', on)

export { gsap, ScrollTrigger, SplitText, Flip, Observer, Draggable, useGSAP }
