'use client'

import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger, SplitText, useGSAP, hasFinePointer, prefersReducedMotion, glide } from '@/lib/gsap'

/**
 * TextFx — site-wide GSAP behaviours, applied by convention so pages
 * stay plain markup. Re-runs on every route change, and everything it
 * creates is reverted when the route changes.
 *
 *  · `.eyebrow` labels (plain text only) decode with ScrambleText as
 *    they scroll into view.
 *  · `[data-count]` figures count up from zero on view ("35%" keeps its
 *    suffix; text without a leading number is left alone).
 *  · `[data-scrub-words]` paragraphs light up word by word as you scroll
 *    through them (SplitText + a scrubbed ScrollTrigger).
 *  · `[data-reveal-lines]` paragraphs rise in line by line.
 *  · Buttons (`.btn-primary`, `.btn-ghost`, `[data-magnetic]`) are
 *    magnetic: they lean toward the cursor and spring back.
 *  · Same-page links (#contact, #top …) glide there with ScrollToPlugin.
 */
export function TextFx() {
  const pathname = usePathname()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const skip = (el: Element) => !!el.closest('[data-no-fx]')

      // decoding labels
      document.querySelectorAll<HTMLElement>('.eyebrow').forEach((el) => {
        if (skip(el) || el.children.length || el.closest('[data-head]') || el.hasAttribute('data-role')) return
        const text = (el.textContent ?? '').trim()
        if (!text || text.length > 48) return
        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: () =>
            gsap.to(el, { duration: Math.min(1.4, 0.4 + text.length * 0.03), scrambleText: { text, chars: 'upperCase', speed: 0.6, revealDelay: 0.1 } }),
        })
      })

      // counting figures
      document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        if (skip(el)) return
        const m = (el.textContent ?? '').trim().match(/^(\d+)(.*)$/)
        if (!m) return
        const to = Number(m[1])
        const suffix = m[2]
        const obj = { v: 0 }
        el.textContent = `0${suffix}`
        gsap.to(obj, {
          v: to,
          duration: 1.6,
          ease: 'power3.out',
          onUpdate: () => (el.textContent = `${Math.round(obj.v)}${suffix}`),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      })

      // word-by-word scrub
      document.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
        if (skip(el)) return
        SplitText.create(el, {
          type: 'words',
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.14 },
              { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true } },
            ),
        })
      })

      // line-by-line rise
      document.querySelectorAll<HTMLElement>('[data-reveal-lines]').forEach((el) => {
        if (skip(el)) return
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 1,
              ease: 'silk',
              stagger: 0.08,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }),
        })
      })

      // footer reveal: see FooterCurtain (Contact)

      // 3D chips: each list flips its chips up into place, one after another
      document.querySelectorAll<HTMLElement>('[data-chips]').forEach((list) => {
        if (skip(list)) return
        gsap.from(list.querySelectorAll('[data-chip]'), {
          rotationX: -95,
          y: 24,
          autoAlpha: 0,
          transformPerspective: 700,
          transformOrigin: '50% 100%',
          duration: 0.9,
          ease: 'back.out(1.8)',
          stagger: 0.06,
          scrollTrigger: { trigger: list, start: 'top 88%', once: true },
        })
      })

      const cleanups: (() => void)[] = []

      // physical cards: they tilt toward the pointer (or a pressing finger) in
      // 3D, with a light glare that follows it (cards with their own tilt
      // — the home feature cards — and fading-in .reveal blocks are skipped)
      {
        document.querySelectorAll<HTMLElement>('.card:not(.reveal):not([data-card]), [data-tilt]').forEach((el) => {
          if (skip(el)) return
          if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
          let glare = el.querySelector<HTMLElement>(':scope > .tilt-glare')
          if (!glare) {
            glare = document.createElement('span')
            glare.className = 'tilt-glare'
            glare.setAttribute('aria-hidden', 'true')
            el.appendChild(glare)
          }
          const small = el.offsetWidth < 260
          const k = small ? 1.6 : 1
          gsap.set(el, { transformPerspective: small ? 500 : 900 })
          const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' })
          const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' })
          const lift = gsap.quickTo(el, 'z', { duration: 0.5, ease: 'power3.out' })
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width
            const py = (e.clientY - r.top) / r.height
            rx(-(py - 0.5) * 9 * k)
            ry((px - 0.5) * 12 * k)
            lift(small ? 18 : 24)
            el.style.setProperty('--gx', `${px * 100}%`)
            el.style.setProperty('--gy', `${py * 100}%`)
            el.setAttribute('data-tilting', '')
          }
          const leave = () => {
            rx(0)
            ry(0)
            lift(0)
            el.removeAttribute('data-tilting')
          }
          el.addEventListener('pointermove', move)
          el.addEventListener('pointerdown', move)
          el.addEventListener('pointerleave', leave)
          // touch: the tilt follows the finger while pressed, and settles on lift
          el.addEventListener('pointerup', leave)
          el.addEventListener('pointercancel', leave)
          cleanups.push(() => {
            el.removeEventListener('pointermove', move)
            el.removeEventListener('pointerdown', move)
            el.removeEventListener('pointerleave', leave)
            el.removeEventListener('pointerup', leave)
            el.removeEventListener('pointercancel', leave)
            glare?.remove()
          })
        })
      }

      // magnetic buttons
      if (hasFinePointer()) {
        document.querySelectorAll<HTMLElement>('.btn-primary, .btn-ghost, [data-magnetic]').forEach((el) => {
          if (skip(el)) return
          const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
          const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            xTo((e.clientX - (r.left + r.width / 2)) * 0.3)
            yTo((e.clientY - (r.top + r.height / 2)) * 0.4)
          }
          const leave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)', overwrite: true })
          }
          el.addEventListener('pointermove', move)
          el.addEventListener('pointerleave', leave)
          cleanups.push(() => {
            el.removeEventListener('pointermove', move)
            el.removeEventListener('pointerleave', leave)
          })
        })
      }

      // in-page links glide to their target (ScrollToPlugin). Smooth scroll
      // is paused for the jump so the two never pull against each other.
      const onClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
        const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
        if (!a) return
        const url = new URL(a.href, window.location.href)
        if (url.pathname !== window.location.pathname || !url.hash) return
        const target = document.querySelector<HTMLElement>(url.hash)
        if (!target) return
        // runs in the capture phase: take the click before Next's <Link> does
        e.preventDefault()
        e.stopPropagation()
        // Contact opens at its own top (clamped to the page end when shorter
        // than the screen); other sections leave room for the sticky header
        // (a plain number, measured now, clamped to the page end)
        const offsetY = url.hash === '#contact' || url.hash === '#top' ? 0 : 72
        const max = document.documentElement.scrollHeight - window.innerHeight
        const y = url.hash === '#top' ? 0 : Math.min(max, Math.round(target.getBoundingClientRect().top + window.scrollY - offsetY))
        // flag the jump so pinned sections it flies past (the gallery) let it through
        const html = document.documentElement
        html.dataset.jumping = '1'
        glide(y, {
          duration: 1.4,
          ease: 'power3.inOut',
          onComplete: () => {
            delete html.dataset.jumping
            history.replaceState(null, '', url.hash)
          },
        })
      }
      document.addEventListener('click', onClick, true)
      cleanups.push(() => document.removeEventListener('click', onClick, true))

      // late layout (fonts, images, pins) — measure everything again
      const id = requestAnimationFrame(() => ScrollTrigger.refresh())
      return () => {
        cancelAnimationFrame(id)
        cleanups.forEach((fn) => fn())
      }
    },
    { dependencies: [pathname], revertOnUpdate: true },
  )

  return null
}
