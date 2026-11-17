'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * HeaderObject — each page's 3D companion (three.js), living in a fixed
 * canvas BEHIND the page content and playing with it.
 *
 * Physically based glossy material (clearcoat + iridescence) lit by a
 * studio environment map. Each page has its own form and colour:
 *   blob (Research) · knot (Work) · medal (Credentials) · orbit, eleven
 *   moons (Interests) · gyro, three turning rings (Life)
 *
 * How it plays with the page:
 *  · Scroll  — it glides from section to section, settling beside each
 *    one on alternating sides, arcing and spinning faster mid-flight.
 *    Cards are drawn over it, so it passes behind them.
 *  · Hover   — point at any card, chip, entry or heading and it flies over
 *    to sit beside it and turns toward it.
 *  · Field   — anything near it lights up in its colour (--halo) and is
 *    nudged gently away from it (the CSS translate property, so it never fights the
 *    GSAP transforms the cards already use).
 *  · Click   — clicking a card makes it pulse and sends a ring out of it.
 *  · Grab    — press on it anywhere it floats and spin it with momentum.
 *  · A coloured halo of light travels with it.
 */

export type HeaderShape = 'blob' | 'knot' | 'medal' | 'orbit' | 'gyro'

export function HeaderObject({ shape, tone, className = '' }: { shape: HeaderShape; tone: string; className?: string }) {
  const host = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = host.current
    if (!el || prefersReducedMotion()) return
    let disposed = false
    let cleanup = () => {}

    Promise.all([
      import('three'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
      import('three/examples/jsm/utils/BufferGeometryUtils.js'),
    ]).then(([THREE, { RoomEnvironment }, { mergeVertices }]) => {
      if (disposed) return
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
      } catch {
        return
      }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.domElement.className = 'absolute inset-0 h-full w-full'
      el.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(renderer)
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      scene.environment = env
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
      camera.position.set(0, 0, 6.2)
      const key = new THREE.DirectionalLight(0xffffff, 1.4)
      key.position.set(3, 4, 5)
      scene.add(key)

      const css = getComputedStyle(document.documentElement).getPropertyValue(tone).trim().split(/\s+/).map(Number)
      const color = css.length === 3 && css.every((n) => !Number.isNaN(n)) ? new THREE.Color(css[0] / 255, css[1] / 255, css[2] / 255) : new THREE.Color('#0ae448')
      const glossy = (c = color) =>
        new THREE.MeshPhysicalMaterial({
          color: c,
          metalness: 0.2,
          roughness: 0.14,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          iridescence: 0.55,
          iridescenceIOR: 1.4,
          envMapIntensity: 1.25,
        })
      const chrome = new THREE.MeshPhysicalMaterial({ color: 0xf2f0e6, metalness: 1, roughness: 0.16, envMapIntensity: 1.3 })

      const group = new THREE.Group()
      scene.add(group)
      const disposables: { dispose: () => void }[] = [pmrem, env, chrome]
      const add = (geo: ConstructorParameters<typeof THREE.Mesh>[0] & { dispose: () => void }, mat: InstanceType<typeof THREE.Material>) => {
        disposables.push(geo, mat)
        const m = new THREE.Mesh(geo, mat)
        group.add(m)
        return m
      }

      // per-frame animation of the chosen form
      let animate: (t: number) => void = () => {}

      if (shape === 'blob') {
        // welded (indexed) so the recomputed normals are smooth, not faceted
        const raw = new THREE.IcosahedronGeometry(1.25, 28)
        raw.deleteAttribute('normal')
        raw.deleteAttribute('uv')
        const geo = mergeVertices(raw)
        raw.dispose()
        geo.computeVertexNormals()
        const pos = geo.attributes.position as InstanceType<typeof THREE.BufferAttribute>
        const base = Float32Array.from(pos.array as Float32Array)
        add(geo, glossy())
        const v = new THREE.Vector3()
        animate = (t) => {
          for (let i = 0; i < pos.count; i++) {
            v.set(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]).normalize()
            const r = 1.25 * (1 + 0.12 * Math.sin(v.x * 3.1 + t * 1.2) * Math.cos(v.y * 2.7 + t * 0.9) + 0.06 * Math.sin(v.z * 5 - t * 1.7))
            pos.setXYZ(i, v.x * r, v.y * r, v.z * r)
          }
          pos.needsUpdate = true
          geo.computeVertexNormals()
        }
      } else if (shape === 'knot') {
        add(new THREE.TorusKnotGeometry(0.95, 0.32, 260, 40, 2, 3), glossy())
      } else if (shape === 'medal') {
        add(new THREE.TorusGeometry(1.15, 0.3, 48, 140), glossy())
        const disc = add(new THREE.CylinderGeometry(0.72, 0.72, 0.16, 96), chrome)
        disc.rotation.x = Math.PI / 2
        animate = (t) => {
          disc.rotation.z = t * 0.8
        }
      } else if (shape === 'orbit') {
        add(new THREE.IcosahedronGeometry(0.72, 6), glossy())
        const moons: InstanceType<typeof THREE.Mesh>[] = []
        const moonGeo = new THREE.SphereGeometry(0.15, 32, 32)
        disposables.push(moonGeo)
        for (let i = 0; i < 11; i++) {
          const m = new THREE.Mesh(moonGeo, i % 3 === 0 ? chrome : glossy(color.clone().offsetHSL((i / 11) * 0.5, 0, 0)))
          if (i % 3) disposables.push(m.material as InstanceType<typeof THREE.Material>)
          group.add(m)
          moons.push(m)
        }
        animate = (t) =>
          moons.forEach((m, i) => {
            const a = t * (0.5 + (i % 4) * 0.12) + (i / 11) * Math.PI * 2
            const tilt = (i % 3) * 0.6 - 0.6
            const r = 1.45 + (i % 2) * 0.25
            m.position.set(Math.cos(a) * r, Math.sin(a) * r * Math.sin(tilt) + Math.sin(a * 2) * 0.1, Math.sin(a) * r * Math.cos(tilt))
          })
      } else {
        const rings = [1.35, 1.05, 0.75].map((R, i) => add(new THREE.TorusGeometry(R, 0.09 + i * 0.02, 32, 160), i === 1 ? chrome : glossy()))
        const core = add(new THREE.SphereGeometry(0.34, 48, 48), glossy())
        void core
        animate = (t) => {
          rings[0].rotation.set(t * 0.5, t * 0.3, 0)
          rings[1].rotation.set(-t * 0.4, 0, t * 0.6)
          rings[2].rotation.set(0, t * 0.9, t * 0.35)
        }
      }

      // ── the stage: one fixed, full-screen canvas behind the page content ──
      const size = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      }
      size()
      const viewH = () => 2 * camera.position.z * Math.tan(((camera.fov / 2) * Math.PI) / 180)
      const pxPerUnit = () => window.innerHeight / viewH()
      const mobile = () => window.innerWidth < 768
      const BASE = () => (mobile() ? 0.42 : 0.6) // world scale at s = 1
      const radiusPx = (s: number) => 1.45 * BASE() * s * pxPerUnit()

      document.documentElement.style.setProperty('--halo-rgb', `var(${tone})`)
      const halo = document.createElement('div')
      halo.className = 'companion-halo'
      el.appendChild(halo)

      // ── where it rests: one anchor per section, alternating sides ──
      type Anchor = { at: number; x: number; y: number; s: number }
      let anchors: Anchor[] = []
      let targets: HTMLElement[] = []
      const TARGETS = '.card, [data-chip], main article, main li, main h2, main h3, main dt'
      const measure = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        const m = mobile()
        anchors = [{ at: 0, x: m ? 0.8 : 0.8, y: m ? 0.28 : 0.42, s: 1 }]
        const secs = [...document.querySelectorAll<HTMLElement>('main > section')].slice(1)
        secs.forEach((sec, i) => {
          const top = sec.getBoundingClientRect().top + window.scrollY
          anchors.push({ at: gsap.utils.clamp(1, max - 1, top - window.innerHeight * 0.4), x: i % 2 ? (m ? 0.16 : 0.1) : m ? 0.84 : 0.9, y: 0.56, s: 0.6 })
        })
        anchors.push({ at: max, x: 0.5, y: 0.6, s: 0.55 })
        anchors.sort((a, b) => a.at - b.at)
        targets = [...document.querySelectorAll<HTMLElement>(TARGETS)].filter((t) => !t.closest('header, footer, nav'))
        // padded boxes (cards, chips) get a glowing outline; everything else glows on its text
        targets.forEach((t) => t.setAttribute(t.matches('.card, [data-chip]') ? 'data-lit' : 'data-lit-text', ''))
      }
      measure()
      const remeasure = () => {
        size()
        measure()
      }
      window.addEventListener('resize', remeasure)
      ScrollTrigger.addEventListener('refresh', measure)
      const late = window.setTimeout(measure, 1200)

      // ── state: where it is (screen px), where it wants to be, how it turns ──
      const cur = { x: window.innerWidth * 0.8, y: window.innerHeight * 0.42, s: 1 }
      const spin = { x: 0, y: 0.25 }
      const idleSpin = 0.25
      let focus: HTMLElement | null = null
      let dragging = false
      let last = { x: 0, y: 0, t: 0 }
      let lastScroll = window.scrollY
      const pointer = { x: -1, y: -1 }

      const goal = () => {
        // 1) the pointer is on a piece of content: fly over beside it
        if (focus && document.contains(focus)) {
          const r = focus.getBoundingClientRect()
          if (r.bottom > 0 && r.top < window.innerHeight) {
            const s = 0.42
            const rad = radiusPx(s)
            const roomRight = window.innerWidth - r.right
            const roomLeft = r.left
            let x: number
            if (roomRight > rad * 1.6) x = r.right + rad * 1.1
            else if (roomLeft > rad * 1.6) x = r.left - rad * 1.1
            else x = Math.min(window.innerWidth - rad, r.right - rad * 0.4) // perch on its corner
            const y = roomRight > rad * 1.6 || roomLeft > rad * 1.6 ? r.top + Math.min(r.height / 2, 160) : r.top - rad * 0.2
            return { x, y: gsap.utils.clamp(rad, window.innerHeight - rad * 0.6, y), s, travel: 0 }
          }
        }
        // 2) otherwise: follow the scroll from anchor to anchor
        const p = window.scrollY
        let i = 0
        while (i < anchors.length - 2 && p > anchors[i + 1].at) i++
        const a = anchors[i]
        const b = anchors[Math.min(i + 1, anchors.length - 1)]
        const t = b.at > a.at ? gsap.utils.clamp(0, 1, (p - a.at) / (b.at - a.at)) : 0
        const e = t * t * (3 - 2 * t)
        const travel = Math.sin(e * Math.PI) // 0 at rest, 1 mid-flight
        return {
          x: (a.x + (b.x - a.x) * e) * window.innerWidth,
          y: (a.y + (b.y - a.y) * e - travel * 0.14) * window.innerHeight,
          s: a.s + (b.s - a.s) * e - travel * 0.08,
          travel,
        }
      }

      // ── content interplay: hover pulls it over; clicks make it pulse ──
      const onOver = (e: PointerEvent) => {
        const t = (e.target as Element | null)?.closest?.(TARGETS) as HTMLElement | null
        if (t && !t.closest('header, footer, nav')) focus = t
      }
      const onOut = (e: PointerEvent) => {
        const to = (e.relatedTarget as Element | null)?.closest?.(TARGETS)
        if (!to) focus = null
      }
      const ringAt = (x: number, y: number) => {
        const ring = document.createElement('div')
        ring.className = 'companion-ring'
        ring.style.left = `${x}px`
        ring.style.top = `${y}px`
        el.appendChild(ring)
        window.setTimeout(() => ring.remove(), 1000)
      }
      const onClick = (e: MouseEvent) => {
        const t = (e.target as Element | null)?.closest?.(TARGETS)
        if (!t) return
        spin.y += 9
        gsap.fromTo(group.scale, { x: BASE() * cur.s * 1.3, y: BASE() * cur.s * 1.3, z: BASE() * cur.s * 1.3 }, { x: BASE() * cur.s, y: BASE() * cur.s, z: BASE() * cur.s, duration: 0.9, ease: 'elastic.out(1, 0.35)', overwrite: true })
        ringAt(cur.x, cur.y)
      }

      // ── grab it anywhere it floats and spin it ──
      const onDown = (e: PointerEvent) => {
        const hitT = (e.target as Element | null)?.closest?.('a, button, input, textarea, select, [data-tilt], .card')
        if (hitT) return
        if (Math.hypot(e.clientX - cur.x, e.clientY - cur.y) > radiusPx(cur.s)) return
        dragging = true
        last = { x: e.clientX, y: e.clientY, t: performance.now() }
        document.documentElement.style.cursor = 'grabbing'
      }
      const onMove = (e: PointerEvent) => {
        pointer.x = e.clientX
        pointer.y = e.clientY
        if (!dragging) return
        const now = performance.now()
        const dt = Math.max(8, now - last.t) / 1000
        spin.y = ((e.clientX - last.x) / dt) * 0.006
        spin.x = ((e.clientY - last.y) / dt) * 0.006
        group.rotation.y += (e.clientX - last.x) * 0.012
        group.rotation.x += (e.clientY - last.y) * 0.012
        last = { x: e.clientX, y: e.clientY, t: now }
      }
      const onUp = () => {
        if (!dragging) return
        dragging = false
        document.documentElement.style.cursor = ''
      }
      document.addEventListener('pointerover', onOver)
      document.addEventListener('pointerout', onOut)
      document.addEventListener('click', onClick)
      window.addEventListener('pointerdown', onDown)
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerup', onUp)

      // entrance: it swells out of nothing, spinning
      let entrance = 0.001
      gsap.to({ v: 0.001 }, { v: 1, duration: 1.6, ease: 'elastic.out(1, 0.55)', delay: 0.35, onUpdate() { entrance = this.targets()[0].v } })
      gsap.from(group.rotation, { y: -Math.PI * 1.5, duration: 2, ease: 'power3.out', delay: 0.35 })

      // ── the loop ──
      let raf = 0
      let prev = performance.now()
      let time = 0
      let frame = 0
      const lit = new Set<HTMLElement>()
      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - prev) / 1000)
        prev = now
        time += dt
        frame++

        // glide toward the goal (a soft spring); speed sets the roll
        const g = goal()
        const k = Math.min(1, dt * (focus ? 3.2 : 2.4))
        const vx = (g.x - cur.x) * k
        cur.x += vx
        cur.y += (g.y - cur.y) * k
        cur.s += (g.s - cur.s) * k
        const [wx, wy] = [(cur.x / window.innerWidth - 0.5) * viewH() * camera.aspect, -(cur.y / window.innerHeight - 0.5) * viewH()]
        group.position.set(wx, wy + Math.sin(time * 0.9) * 0.05, 0)
        if (!gsap.isTweening(group.scale)) group.scale.setScalar(BASE() * cur.s * entrance)

        // the scroll's speed and the flight between sections spin it
        const sv = window.scrollY - lastScroll
        lastScroll = window.scrollY
        if (!dragging) {
          spin.y += gsap.utils.clamp(-0.6, 0.6, sv * 0.01) + g.travel * 0.02
          spin.y += (idleSpin - spin.y) * Math.min(1, dt * 1.2)
          spin.x += (0 - spin.x) * Math.min(1, dt * 1.6)
          group.rotation.y += spin.y * dt
          group.rotation.x += spin.x * dt
        }
        group.rotation.z += (-vx * 0.02 - group.rotation.z) * Math.min(1, dt * 3)
        // it turns to look at what it is visiting, or at the pointer
        const lookX = focus ? 0 : pointer.x < 0 ? 0 : (pointer.y - cur.y) / window.innerHeight
        if (!dragging) group.rotation.x += (lookX * 0.6 - group.rotation.x) * Math.min(1, dt * 0.8)
        animate(time)
        renderer.render(scene, camera)

        // the halo follows it
        const hr = radiusPx(cur.s) * 3.2
        halo.style.transform = `translate(${cur.x - hr / 2}px, ${cur.y - hr / 2}px)`
        halo.style.width = halo.style.height = `${hr}px`
        halo.style.opacity = String((focus ? 1 : 0.75) * Math.min(1, entrance))

        // content near it lights up and is nudged away, as if by a field
        if (frame % 2 === 0) {
          const R = radiusPx(cur.s) * 2.4
          const seen = new Set<HTMLElement>()
          for (const t of targets) {
            const r = t.getBoundingClientRect()
            if (r.bottom < -50 || r.top > window.innerHeight + 50) continue
            const nx = gsap.utils.clamp(r.left, r.right, cur.x)
            const ny = gsap.utils.clamp(r.top, r.bottom, cur.y)
            const d = Math.hypot(nx - cur.x, ny - cur.y)
            const f = t === focus ? 1 : Math.max(0, 1 - d / R)
            if (f > 0.01) {
              const cx = r.left + r.width / 2 - cur.x
              const cy = r.top + r.height / 2 - cur.y
              const len = Math.hypot(cx, cy) || 1
              const push = (t === focus ? 0.4 : 1) * f * (t.hasAttribute('data-lit-text') ? 4 : 7)
              t.style.setProperty('--halo', f.toFixed(3))
              t.style.translate = `${((cx / len) * push).toFixed(1)}px ${((cy / len) * push).toFixed(1)}px`
              seen.add(t)
            }
          }
          lit.forEach((t) => {
            if (!seen.has(t)) {
              t.style.setProperty('--halo', '0')
              t.style.translate = ''
            }
          })
          lit.clear()
          seen.forEach((t) => lit.add(t))
        }
        raf = document.hidden ? 0 : requestAnimationFrame(loop)
      }
      const wake = () => {
        if (!raf && !document.hidden && !disposed) {
          prev = performance.now()
          raf = requestAnimationFrame(loop)
        }
      }
      document.addEventListener('visibilitychange', wake)
      wake()

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.clearTimeout(late)
        window.removeEventListener('resize', remeasure)
        ScrollTrigger.removeEventListener('refresh', measure)
        document.removeEventListener('visibilitychange', wake)
        document.removeEventListener('pointerover', onOver)
        document.removeEventListener('pointerout', onOut)
        document.removeEventListener('click', onClick)
        window.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        gsap.killTweensOf([group.scale, group.rotation])
        lit.forEach((t) => {
          t.style.removeProperty('--halo')
          t.style.translate = ''
        })
        targets.forEach((t) => {
          t.removeAttribute('data-lit')
          t.removeAttribute('data-lit-text')
        })
        document.documentElement.style.removeProperty('--halo-rgb')
        disposables.forEach((d) => d.dispose())
        renderer.dispose()
        renderer.domElement.remove()
        halo.remove()
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [shape, tone])

  return <div ref={host} aria-hidden="true" className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`} />
}
