'use client'

import { useEffect } from 'react'

/**
 * TouchFx — mobile-first touch feedback: a soft halo, an expanding ripple
 * ring, and accent sparks flung outward on tap.
 * Respects prefers-reduced-motion.
 */
export function TouchFx() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: coarse)').matches) return

    const layer = document.createElement('div')
    layer.className = 'scrollfx-layer'
    layer.setAttribute('aria-hidden', 'true')
    document.body.appendChild(layer)

    let lastTouch = 0

    const spawn = (x: number, y: number) => {
      const now = Date.now()
      if (now - lastTouch < 90) return
      lastTouch = now

      const halo = document.createElement('div')
      halo.className = 'touch-halo'
      halo.style.left = `${x}px`
      halo.style.top = `${y}px`
      layer.appendChild(halo)

      const ripple = document.createElement('div')
      ripple.className = 'touch-ripple'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      layer.appendChild(ripple)

      const count = 4 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const spark = document.createElement('div')
        spark.className = 'touch-spark'
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6
        const dist = 18 + Math.random() * 22
        spark.style.left = `${x}px`
        spark.style.top = `${y}px`
        spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
        spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`)
        layer.appendChild(spark)
      }

      layer.addEventListener('animationend', (e) => {
        const el = e.target as HTMLElement
        if (el !== layer) el.remove()
      })
    }

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) spawn(t.clientX, t.clientY)
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      layer.remove()
    }
  }, [])

  // Photographs: there is no hover on a touch screen, so a finger resting on
  // a photo (or its frame) brings its colour back, and it fades back to
  // black & white shortly after the finger lifts. Not motion — always on.
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return
    const HOST = 'figure, a, [data-shot], [data-tile], [data-shutter], [data-photo]'
    let lit: Element[] = []
    let timer = 0

    const release = () => {
      const was = lit
      lit = []
      window.clearTimeout(timer)
      timer = window.setTimeout(() => was.forEach((el) => el.classList.remove('is-colour')), 900)
    }

    const onStart = (e: TouchEvent) => {
      const target = e.target as Element | null
      if (!target || !(target instanceof Element)) return
      const host = target.closest(HOST)
      const photos = host
        ? Array.from(host.querySelectorAll('.photo-bw'))
        : target.classList.contains('photo-bw')
          ? [target]
          : []
      if (!photos.length) return
      window.clearTimeout(timer)
      lit.forEach((el) => { if (!photos.includes(el)) el.classList.remove('is-colour') })
      photos.forEach((el) => el.classList.add('is-colour'))
      lit = photos
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', release, { passive: true })
    window.addEventListener('touchcancel', release, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', release)
      window.removeEventListener('touchcancel', release)
    }
  }, [])

  return null
}