'use client'

import { useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

/**
 * CopyEmail — copies the address to the clipboard and celebrates with a
 * burst of confetti driven by real physics: Physics2D launches each
 * piece at a random angle and speed under gravity, PhysicsProps spins it
 * with friction so it tumbles and slows. Pieces are removed when done.
 */
export function CopyEmail({ email }: { email: string }) {
  const btn = useRef<HTMLButtonElement | null>(null)
  const [copied, setCopied] = useState(false)

  const burst = () => {
    if (prefersReducedMotion() || !btn.current) return
    const r = btn.current.getBoundingClientRect()
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim()
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('span')
      const size = gsap.utils.random(5, 10)
      Object.assign(p.style, {
        position: 'fixed',
        left: `${r.left + r.width / 2}px`,
        top: `${r.top + r.height / 2}px`,
        width: `${size}px`,
        height: `${size * gsap.utils.random(0.4, 1)}px`,
        background: i % 3 === 0 ? 'rgb(var(--fg-rgb))' : `rgb(${accent})`,
        borderRadius: i % 4 === 0 ? '999px' : '1px',
        pointerEvents: 'none',
        zIndex: '90',
      })
      document.body.appendChild(p)
      gsap.to(p, {
        duration: gsap.utils.random(1.2, 2),
        physics2D: { velocity: gsap.utils.random(260, 620), angle: gsap.utils.random(-160, -20), gravity: 900 },
        physicsProps: { rotation: { velocity: gsap.utils.random(-900, 900), friction: 0.15 } },
        opacity: 0,
        ease: 'power2.in',
        onComplete: () => p.remove(),
      })
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      burst()
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // clipboard blocked — fall back to opening the mail client
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <button ref={btn} type="button" onClick={copy} data-magnetic data-cursor={copied ? 'COPIED' : 'COPY'} className="btn-ghost !h-10 !px-5">
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy email'}</span>
    </button>
  )
}
