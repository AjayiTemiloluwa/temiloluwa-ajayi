'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger, prefersReducedMotion, lowPower } from '@/lib/gsap'

/**
 * LiquidPortrait — the hero photo as a living surface (three.js shader).
 *
 *   · Move over it  → a liquid ripple trail follows the pointer/finger,
 *                      warping the photo and bleeding its colour back in.
 *   · Flick fast    → it shatters into neon-edged shards that spring back.
 *   · Tap / click   → it flips over in 3D to the next photograph.
 *   · Leave it be   → it blinks… then melts into a neon blob, wobbles,
 *                      and snaps back into the photo.
 *   · Scroll hard   → it glitches with the speed of the page.
 *
 * The plain image below is the fallback (no WebGL, reduced motion) and
 * what search engines and screen readers get.
 */

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform sampler2D uTrail;
uniform vec2 uRes;
uniform float uImgAspect, uTime, uShatter, uBlob, uBlink, uGlitch, uColorAll;
uniform vec2 uShatterDir;
uniform vec3 uC1, uC2, uC3;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 hash2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }

vec2 cover(vec2 uv) {
  float ca = uRes.x / uRes.y;
  vec2 s = ca > uImgAspect ? vec2(1.0, uImgAspect / ca) : vec2(ca / uImgAspect, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// cell id + distance to the nearest cell edge (crack lines)
vec3 voronoi(vec2 x) {
  vec2 n = floor(x), f = fract(x), mg = vec2(0.0), mr = vec2(0.0);
  float md = 8.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 r = g + hash2(n + g) - f;
    float d = dot(r, r);
    if (d < md) { md = d; mr = r; mg = g; }
  }
  md = 8.0;
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    vec2 g = mg + vec2(float(i), float(j));
    vec2 r = g + hash2(n + g) - f;
    if (dot(mr - r, mr - r) > 0.00001) md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
  }
  return vec3(n + mg, md);
}

void main() {
  vec2 uv = vUv;

  // liquid trail: bend along the trail's slope, plus travelling ripples
  float t = texture2D(uTrail, uv).r;
  float e = 0.012;
  float tx = texture2D(uTrail, uv + vec2(e, 0.0)).r - texture2D(uTrail, uv - vec2(e, 0.0)).r;
  float ty = texture2D(uTrail, uv + vec2(0.0, e)).r - texture2D(uTrail, uv - vec2(0.0, e)).r;
  uv -= vec2(tx, ty) * 0.07;
  uv += sin(t * 16.0 - uTime * 5.0) * 0.006 * t;

  // shatter: every shard slides out on its own vector
  float edge = 1.0;
  if (uShatter > 0.001) {
    vec2 grid = vec2(5.0, 6.5);
    vec3 v = voronoi(vUv * grid);
    vec2 r = hash2(v.xy) - 0.5;
    vec2 c = (v.xy + 0.5) / grid - 0.5;
    uv -= (r * 0.22 + c * 0.32 + uShatterDir * 0.14 * hash(v.xy)) * uShatter;
    edge = smoothstep(0.0, 0.03, v.z);
  }

  vec2 iuv = cover(uv);

  // glitch: RGB split on random bands
  float band = step(0.72, hash(vec2(floor(vUv.y * 26.0), floor(uTime * 18.0))));
  float g = uGlitch * (0.006 + 0.03 * band);
  vec3 col = vec3(
    texture2D(uTex, iuv + vec2(g, 0.0)).r,
    texture2D(uTex, iuv).g,
    texture2D(uTex, iuv - vec2(g, 0.0)).b
  );

  // black & white, with colour wherever the trail has passed
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float amt = clamp(t * 2.2 + uColorAll, 0.0, 1.0);
  vec3 o = mix(vec3(lum * 1.04), col, amt);
  // a neon rim where the liquid is thinnest
  o += uC1 * smoothstep(0.02, 0.0, abs(t - 0.12)) * step(0.02, t) * 0.35;

  // shatter cracks glow neon
  o = mix(uC1, o, mix(1.0, edge, clamp(uShatter * 1.5, 0.0, 1.0)));

  float a = step(0.0, iuv.x) * step(iuv.x, 1.0) * step(0.0, iuv.y) * step(iuv.y, 1.0);

  // blink: an eyelid closing from top and bottom
  float lid = abs(vUv.y - 0.5) - (1.0 - uBlink) * 0.5;
  a *= 1.0 - step(0.0001, lid);

  // melt into a neon blob
  if (uBlob > 0.001) {
    vec2 p = vUv - 0.5;
    p.x *= uRes.x / uRes.y;
    float ang = atan(p.y, p.x);
    float rr = mix(0.95, 0.3, uBlob) + uBlob * (0.045 * sin(ang * 3.0 + uTime * 2.2) + 0.03 * sin(ang * 5.0 - uTime * 3.1));
    float m = smoothstep(rr, rr - 0.012, length(p));
    vec3 neon = mix(mix(uC1, uC2, smoothstep(-0.4, 0.4, p.x + sin(uTime * 1.3) * 0.2)), uC3, smoothstep(-0.3, 0.5, p.y + cos(uTime) * 0.15));
    o = mix(o, neon, smoothstep(0.25, 0.8, uBlob));
    a *= mix(1.0, m, smoothstep(0.0, 0.45, uBlob));
  }

  gl_FragColor = vec4(o * a, a);
}
`

export function LiquidPortrait({
  photos,
  alt,
}: {
  /** first is the portrait; a tap flips through the rest */
  photos: { src: string; w: number; h: number }[]
  alt: string
}) {
  const host = useRef<HTMLDivElement | null>(null)
  const tilt = useRef<HTMLDivElement | null>(null)
  const glare = useRef<HTMLDivElement | null>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = host.current
    const card = tilt.current
    if (!el || !card || prefersReducedMotion() || lowPower()) return
    let disposed = false
    let cleanup = () => {}

    import('three').then((THREE) => {
      if (disposed) return
      const canvas = document.createElement('canvas')
      canvas.className = 'absolute inset-0 h-full w-full'
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      } catch {
        return
      }
      card.appendChild(canvas)
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      renderer.setPixelRatio(dpr)
      renderer.setClearColor(0x000000, 0)
      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      // the trail map: a small 2D canvas the pointer paints into, fading every frame
      const trail = document.createElement('canvas')
      const TW = 128
      const aspect = photos[0].w / photos[0].h
      trail.width = TW
      trail.height = Math.round(TW / aspect)
      const tctx = trail.getContext('2d')!
      tctx.fillStyle = '#000'
      tctx.fillRect(0, 0, trail.width, trail.height)
      const trailTex = new THREE.CanvasTexture(trail)

      const neon = (name: string, fb: [number, number, number]) => {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).map(Number)
        const c = v.length === 3 && v.every((n) => !Number.isNaN(n)) ? v : fb
        return new THREE.Vector3(c[0] / 255, c[1] / 255, c[2] / 255)
      }
      const uniforms = {
        uTex: { value: null as unknown as InstanceType<typeof THREE.Texture> },
        uTrail: { value: trailTex },
        uRes: { value: new THREE.Vector2(1, 1) },
        uImgAspect: { value: aspect },
        uTime: { value: 0 },
        uShatter: { value: 0 },
        uShatterDir: { value: new THREE.Vector2(0, 0) },
        uBlob: { value: 0 },
        uBlink: { value: 0 },
        uGlitch: { value: 0 },
        uColorAll: { value: 0 },
        uC1: { value: neon('--accent-rgb', [10, 228, 72]) },
        uC2: { value: neon('--lilac-rgb', [157, 149, 255]) },
        uC3: { value: neon('--orange-rgb', [255, 135, 9]) },
      }
      const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true })
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))

      const size = () => {
        const w = card.clientWidth
        const h = card.clientHeight
        if (!w || !h) return
        renderer.setSize(w, h, false)
        uniforms.uRes.value.set(w, h)
      }
      const ro = new ResizeObserver(size)
      ro.observe(card)
      size()

      // photographs — loaded lazily, one at a time
      const loader = new THREE.TextureLoader()
      const texs: (InstanceType<typeof THREE.Texture> | null)[] = photos.map(() => null)
      const load = (i: number) =>
        new Promise<InstanceType<typeof THREE.Texture>>((res) => {
          if (texs[i]) return res(texs[i]!)
          loader.load(photos[i].src, (t) => {
            t.minFilter = THREE.LinearFilter
            t.generateMipmaps = false
            texs[i] = t
            res(t)
          })
        })
      let current = 0
      const show = (i: number) => {
        const t = texs[i]
        if (!t) return
        uniforms.uTex.value = t
        uniforms.uImgAspect.value = photos[i].w / photos[i].h
      }

      // ── render loop (only while on screen and visible) ──
      let raf = 0
      let onScreen = true
      let last = 0
      const pending: { x: number; y: number; r: number }[] = []
      const frame = (now: number) => {
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
        last = now
        uniforms.uTime.value += dt
        // fade the trail, then paint new strokes
        tctx.globalCompositeOperation = 'source-over'
        tctx.fillStyle = 'rgba(0,0,0,0.035)'
        tctx.fillRect(0, 0, trail.width, trail.height)
        tctx.globalCompositeOperation = 'lighter'
        for (const p of pending.splice(0)) {
          const g = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
          g.addColorStop(0, 'rgba(255,255,255,0.45)')
          g.addColorStop(1, 'rgba(255,255,255,0)')
          tctx.fillStyle = g
          tctx.beginPath()
          tctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          tctx.fill()
        }
        trailTex.needsUpdate = true
        renderer.render(scene, camera)
        raf = onScreen && !document.hidden ? requestAnimationFrame(frame) : 0
        if (!raf) last = 0
      }
      const wake = () => {
        if (!raf && onScreen && !document.hidden && !disposed) raf = requestAnimationFrame(frame)
      }
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting
        if (onScreen) wake()
        else idle.pause()
      })
      io.observe(el)
      const onVis = () => wake()
      document.addEventListener('visibilitychange', onVis)

      // ── tilt + glare (CSS 3D on the card) ──
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
      gsap.set(card, { transformPerspective: 900, transformStyle: 'preserve-3d' })

      // ── wonders ── (the flip turns the outer frame, the tilt the inner card,
      // so the two never fight over one property)
      let busy = false // a shatter or flip is playing
      const shatter = (vx: number, vy: number) => {
        if (busy) return
        busy = true
        const len = Math.hypot(vx, vy) || 1
        uniforms.uShatterDir.value.set(vx / len, -vy / len)
        gsap
          .timeline({ onComplete: () => { busy = false } })
          .to(uniforms.uShatter, { value: 1, duration: 0.16, ease: 'power3.out' })
          .to(uniforms.uGlitch, { value: 1, duration: 0.1 }, 0)
          .to(uniforms.uGlitch, { value: 0, duration: 0.8 }, 0.15)
          .to(uniforms.uShatter, { value: 0, duration: 1.6, ease: 'elastic.out(1, 0.32)' }, 0.35)
      }
      const flip = async () => {
        if (busy) return
        busy = true
        const next = (current + 1) % photos.length
        const tex = load(next)
        await new Promise<void>((r) => gsap.to(el, { rotationY: 90, transformPerspective: 900, duration: 0.32, ease: 'power2.in', onComplete: () => r() }))
        await tex
        current = next
        show(current)
        gsap.set(el, { rotationY: -90 })
        gsap.to(uniforms.uColorAll, { value: 1, duration: 0.01 })
        gsap.to(uniforms.uColorAll, { value: 0, duration: 1.6, delay: 0.5, ease: 'power2.inOut' })
        gsap.to(el, { rotationY: 0, duration: 0.75, ease: 'back.out(1.8)', onComplete: () => { busy = false } })
      }
      // the idle surprise — a blink, then the melt
      const idle = gsap
        .timeline({ paused: true, onComplete: () => schedule(14) })
        .to(uniforms.uBlink, { value: 1, duration: 0.09, ease: 'power2.in' })
        .to(uniforms.uBlink, { value: 0, duration: 0.12, ease: 'power2.out' })
        .to(uniforms.uBlink, { value: 1, duration: 0.09, ease: 'power2.in' }, '+=0.35')
        .to(uniforms.uBlink, { value: 0, duration: 0.12, ease: 'power2.out' })
        .to(uniforms.uBlob, { value: 1, duration: 1.2, ease: 'power3.inOut' }, '+=0.5')
        .to(card, { scale: 1.04, duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' }, '<0.6')
        .to(uniforms.uBlob, { value: 0, duration: 1.3, ease: 'elastic.out(1, 0.4)' }, '+=0.4')
      let idleCall: gsap.core.Tween | null = null
      function schedule(sec: number) {
        idleCall?.kill()
        idleCall = gsap.delayedCall(sec, () => onScreen && idle.restart())
      }
      const interrupt = () => {
        if (idle.isActive()) {
          idle.pause()
          gsap.to(uniforms.uBlob, { value: 0, duration: 0.6, ease: 'back.out(2)' })
          gsap.to(uniforms.uBlink, { value: 0, duration: 0.2 })
          gsap.to(card, { scale: 1, duration: 0.4 })
        }
        schedule(7)
      }

      // ── pointer / finger ──
      let lx = 0
      let ly = 0
      let lt = 0
      let down: { x: number; y: number; t: number } | null = null
      let entered = false
      const move = (cx: number, cy: number) => {
        const r = el.getBoundingClientRect()
        const u = (cx - r.left) / r.width
        const v = (cy - r.top) / r.height
        const now = performance.now()
        const dt = Math.max(1, now - lt)
        const vx = (cx - lx) / dt
        const vy = (cy - ly) / dt
        const speed = Math.hypot(vx, vy)
        // paint the trail between the last point and this one
        const steps = lt ? Math.min(12, Math.ceil(Math.hypot(cx - lx, cy - ly) / 8)) : 1
        for (let s = 1; s <= steps; s++) {
          const k = s / steps
          const pu = ((lx + (cx - lx) * k) - r.left) / r.width
          const pv = ((ly + (cy - ly) * k) - r.top) / r.height
          if (lt) pending.push({ x: pu * trail.width, y: pv * trail.height, r: 9 + Math.min(14, speed * 6) })
        }
        if (!lt) pending.push({ x: u * trail.width, y: v * trail.height, r: 10 })
        lx = cx
        ly = cy
        lt = now
        ry((u - 0.5) * 22)
        rx(-(v - 0.5) * 16)
        if (glare.current) gsap.set(glare.current, { '--gx': `${u * 100}%`, '--gy': `${v * 100}%`, opacity: 1 })
        if (speed > 2.0) shatter(vx, vy)
        interrupt()
        wake()
      }
      const onEnter = () => {
        if (!entered && Math.random() < 0.35) {
          gsap.fromTo(uniforms.uGlitch, { value: 0.9 }, { value: 0, duration: 0.7, ease: 'power2.out' })
        }
        entered = true
      }
      const onMove = (e: PointerEvent) => move(e.clientX, e.clientY)
      const onDown = (e: PointerEvent) => {
        down = { x: e.clientX, y: e.clientY, t: performance.now() }
        lt = 0
        move(e.clientX, e.clientY)
      }
      const onUp = (e: PointerEvent) => {
        if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8 && performance.now() - down.t < 400) flip()
        down = null
      }
      const onLeave = () => {
        entered = false
        lt = 0
        rx(0)
        ry(0)
        if (glare.current) gsap.to(glare.current, { opacity: 0, duration: 0.5 })
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          flip()
        }
      }
      el.addEventListener('pointerenter', onEnter)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerdown', onDown)
      el.addEventListener('pointerup', onUp)
      el.addEventListener('pointerleave', onLeave)
      el.addEventListener('keydown', onKey)

      // hard scrolling glitches it
      const gq = gsap.quickTo(uniforms.uGlitch, 'value', { duration: 0.35, ease: 'power2.out' })
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (s) => {
          const v = Math.abs(s.getVelocity())
          if (!busy) gq(Math.min(0.8, v / 5000))
        },
      })

      // first photo, then an entrance: it pours in from a blob
      load(0).then((t) => {
        if (disposed) return
        show(0)
        setLive(true)
        uniforms.uBlob.value = 1
        gsap.to(uniforms.uBlob, { value: 0, duration: 1.8, ease: 'elastic.out(1, 0.45)', delay: 0.9 })
        schedule(8)
        void t
        wake()
        // warm the next photo for the first flip
        if (photos.length > 1) load(1)
      })

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        io.disconnect()
        st.kill()
        idle.kill()
        idleCall?.kill()
        document.removeEventListener('visibilitychange', onVis)
        el.removeEventListener('pointerenter', onEnter)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerdown', onDown)
        el.removeEventListener('pointerup', onUp)
        el.removeEventListener('pointerleave', onLeave)
        el.removeEventListener('keydown', onKey)
        texs.forEach((t) => t?.dispose())
        trailTex.dispose()
        mat.dispose()
        renderer.dispose()
        canvas.remove()
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [photos])

  const first = photos[0]
  return (
    <div>
      <div
        ref={host}
        role="button"
        tabIndex={0}
        aria-label={`${alt}. Press to flip to another photo.`}
        data-cursor="PLAY"
        className="relative cursor-pointer select-none outline-none [touch-action:pan-y]"
        style={{ aspectRatio: `${first.w} / ${first.h}` }}
      >
        <div ref={tilt} className="absolute inset-0 overflow-hidden rounded-[28px] will-change-transform">
          <Image
            src={first.src}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 420px, 80vw"
            className={`photo-bw object-cover transition-opacity duration-500 ${live ? 'opacity-0' : ''}`}
          />
          <div
            ref={glare}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 opacity-0 mix-blend-screen"
            style={{ background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgb(255 255 255 / 0.18), transparent 45%)' }}
          />
        </div>
      </div>
    </div>
  )
}
