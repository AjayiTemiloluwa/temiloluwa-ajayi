'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * PortraitStage — the hero portrait as a live 3D scene (three.js).
 *
 * The photo is rebuilt from ~34,000 points, one per sample of the image,
 * each raised off the plane by its brightness, so the face has real relief.
 *
 *   · Opening shot — the points fly in out of the dark behind the screen,
 *     swirling, and settle into the portrait (one GSAP tween drives it).
 *   · Pointer / finger — the whole portrait tilts toward it in 3D, the
 *     points under it part and lift toward the viewer, and the black &
 *     white bleeds into full colour.
 *   · Scroll — as the hero scrolls away the portrait disperses into depth.
 *
 * The plain <img> underneath stays as the fallback (no WebGL, reduced
 * motion, before the scene is ready) and for search engines.
 */

const VERT = /* glsl */ `
uniform sampler2D uTex;
uniform float uTime, uProgress, uHover, uScroll, uSize, uDist;
uniform vec2 uMouse;
attribute vec2 aUv;
attribute vec4 aRand;
varying vec2 vUv;
varying float vAlpha;
varying float vLift;

void main() {
  vUv = aUv;
  vec3 tex = texture2D(uTex, aUv).rgb;
  float lum = dot(tex, vec3(0.299, 0.587, 0.114));

  // resting place: on the plane, raised by brightness, breathing slightly
  vec3 base = position;
  base.z = (lum - 0.5) * 0.32;
  base.z += sin(base.x * 3.0 + uTime * 1.1) * 0.012 + cos(base.y * 4.0 + uTime * 0.9) * 0.012;

  // opening shot: from a scatter deep behind the screen, each point on its own delay
  vec3 scatter = vec3(aRand.x * 2.6, aRand.y * 3.2, -5.0 + aRand.z * 4.0);
  float t = clamp(uProgress * 1.7 - aRand.w * 0.7, 0.0, 1.0);
  t = 1.0 - pow(1.0 - t, 3.0);
  vec3 p = mix(scatter, base, t);
  float ang = (1.0 - t) * 5.0 * (aRand.w - 0.5);
  p.xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xy;

  // the pointer parts the points and lifts them toward the viewer
  vec2 d = p.xy - uMouse;
  float dist = length(d);
  float f = smoothstep(0.3, 0.0, dist) * uHover;
  p.xy += normalize(d + 1e-5) * f * 0.09;
  p.z += f * 0.38;
  vLift = f;

  // scrolling away disperses it into depth
  p += aRand.xyz * uScroll * vec3(1.4, 1.4, 3.0);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (uDist / -mv.z) * (1.0 + f * 0.6);
  vAlpha = t * (1.0 - uScroll);
}
`

const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uColor;
uniform vec3 uAccent;
varying vec2 vUv;
varying float vAlpha;
varying float vLift;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (dot(c, c) > 0.25) discard;
  vec3 col = texture2D(uTex, vUv).rgb;
  float g = (dot(col, vec3(0.299, 0.587, 0.114)) - 0.5) * 1.05 + 0.5;
  vec3 o = mix(vec3(g), col, uColor);
  // the parted ring catches a little of the site's accent
  o = mix(o, uAccent, vLift * 0.25);
  gl_FragColor = vec4(o, vAlpha);
}
`

// the canvas overhangs the frame so tilt and scatter are never clipped
const BLEED = 1.24

export function PortraitStage({ src, aspect }: { src: string; aspect: number }) {
  const host = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrap = host.current
    if (!wrap || prefersReducedMotion()) return
    let disposed = false
    let cleanup = () => {}

    import('three').then((THREE) => {
      if (disposed) return
      const canvas = document.createElement('canvas')
      canvas.className = 'pointer-events-none absolute'
      Object.assign(canvas.style, {
        left: `${(-(BLEED - 1) / 2) * 100}%`,
        top: `${(-(BLEED - 1) / 2) * 100}%`,
        width: `${BLEED * 100}%`,
        height: `${BLEED * 100}%`,
      })
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' })
      } catch {
        return // no WebGL: the image stays
      }
      wrap.appendChild(canvas)
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      renderer.setPixelRatio(dpr)
      renderer.setClearColor(0x000000, 0)

      const scene = new THREE.Scene()
      const FOV = 35
      const DIST = (BLEED * 1) / Math.tan((FOV / 2) * (Math.PI / 180))
      const camera = new THREE.PerspectiveCamera(FOV, 1 / aspect, 0.1, 50)
      camera.position.z = DIST

      // the point grid — the plane is 2 units tall
      const COLS = 160
      const ROWS = Math.round(COLS / aspect)
      const W = 2 * aspect
      const count = COLS * ROWS
      const pos = new Float32Array(count * 3)
      const uv = new Float32Array(count * 2)
      const rnd = new Float32Array(count * 4)
      for (let y = 0, k = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++, k++) {
          const u = (x + 0.5) / COLS
          const v = (y + 0.5) / ROWS
          pos.set([(u - 0.5) * W, (v - 0.5) * 2, 0], k * 3)
          uv.set([u, v], k * 2)
          rnd.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random()], k * 4)
        }
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('aUv', new THREE.BufferAttribute(uv, 2))
      geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))

      const accent = () => {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim().split(/\s+/).map(Number)
        return v.length === 3 && v.every((n) => !Number.isNaN(n)) ? new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255) : new THREE.Vector3(0.2, 0.5, 0.4)
      }
      const uniforms = {
        uTex: { value: null as unknown as InstanceType<typeof THREE.Texture> },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uHover: { value: 0 },
        uColor: { value: 0 },
        uScroll: { value: 0 },
        uSize: { value: 2 },
        uDist: { value: DIST },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uAccent: { value: accent() },
      }
      const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false })
      const points = new THREE.Points(geo, mat)
      const group = new THREE.Group()
      group.add(points)
      scene.add(group)

      // invisible plane for finding where the pointer sits on the portrait
      const hitPlane = new THREE.Mesh(new THREE.PlaneGeometry(W * 3, 6), new THREE.MeshBasicMaterial({ visible: false }))
      group.add(hitPlane)
      const ray = new THREE.Raycaster()
      const ndc = new THREE.Vector2()

      const size = () => {
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        if (!w || !h) return
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        // one point covers its grid cell, with a little overlap
        uniforms.uSize.value = ((h / BLEED) / ROWS) * dpr * 1.45
      }
      const ro = new ResizeObserver(size)
      ro.observe(wrap)
      size()

      // pointer state
      const target = { rx: 0, ry: 0, hover: 0, colour: 0 }
      let inside = false
      let releaseTimer = 0
      const point = (cx: number, cy: number) => {
        const r = canvas.getBoundingClientRect()
        const fr = wrap.getBoundingClientRect()
        ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1)
        // tilt toward the pointer wherever it is on screen, gently
        const nx = gsap.utils.clamp(-1, 1, (cx - (fr.left + fr.width / 2)) / (window.innerWidth / 2))
        const ny = gsap.utils.clamp(-1, 1, (cy - (fr.top + fr.height / 2)) / (window.innerHeight / 2))
        target.ry = nx * 0.42
        target.rx = ny * 0.3
        const m = 24 // px of grace around the frame
        inside = cx > fr.left - m && cx < fr.right + m && cy > fr.top - m && cy < fr.bottom + m
        target.hover = inside ? 1 : 0
        target.colour = inside ? 1 : 0
        if (inside) {
          ray.setFromCamera(ndc, camera)
          const hit = ray.intersectObject(hitPlane)[0]
          if (hit) {
            const local = group.worldToLocal(hit.point.clone())
            uniforms.uMouse.value.set(local.x, local.y)
          }
        }
        wake()
      }
      const onPointer = (e: PointerEvent) => {
        window.clearTimeout(releaseTimer)
        point(e.clientX, e.clientY)
      }
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0]
        if (!t) return
        window.clearTimeout(releaseTimer)
        point(t.clientX, t.clientY)
      }
      const onRelease = () => {
        window.clearTimeout(releaseTimer)
        releaseTimer = window.setTimeout(() => {
          target.hover = 0
          target.colour = 0
          target.rx = 0
          target.ry = 0
          wake()
        }, 900)
      }
      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('pointerdown', onPointer, { passive: true })
      window.addEventListener('touchstart', onTouch, { passive: true })
      window.addEventListener('touchmove', onTouch, { passive: true })
      window.addEventListener('touchend', onRelease, { passive: true })
      document.documentElement.addEventListener('pointerleave', onRelease)

      // scroll: disperse as the hero leaves
      const hero = wrap.closest('section') ?? wrap
      const st = ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (s) => {
          uniforms.uScroll.value = s.progress * 0.95
          wake()
        },
      })

      // texture, then the opening shot
      new THREE.TextureLoader().load(src, (tex) => {
        if (disposed) return
        tex.minFilter = THREE.LinearFilter
        tex.generateMipmaps = false
        uniforms.uTex.value = tex
        wrap.dataset.live = '1' // the fallback image fades out (CSS)
        gsap.to(uniforms.uProgress, { value: 1, duration: 3.4, ease: 'power2.out', delay: 0.5, onUpdate: wake })
        wake()
      })

      // render loop — sleeps when off screen, hidden, or fully at rest
      let raf = 0
      let running = false
      let onScreen = true
      let last = 0
      const frame = (now: number) => {
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
        last = now
        uniforms.uTime.value += dt
        const k = Math.min(1, dt * 5)
        group.rotation.x += (target.rx - group.rotation.x) * k
        group.rotation.y += (target.ry - group.rotation.y) * k
        // a slow drift so it never sits dead still
        group.rotation.z = Math.sin(uniforms.uTime.value * 0.4) * 0.015
        uniforms.uHover.value += (target.hover - uniforms.uHover.value) * Math.min(1, dt * 4)
        uniforms.uColor.value += (target.colour - uniforms.uColor.value) * Math.min(1, dt * 2.5)
        renderer.render(scene, camera)
        if (!onScreen || document.hidden || !uniforms.uTex.value) {
          running = false
          last = 0
          return
        }
        raf = requestAnimationFrame(frame)
      }
      function wake() {
        if (running || disposed || !onScreen || document.hidden) return
        running = true
        raf = requestAnimationFrame(frame)
      }
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting
        if (onScreen) wake()
      })
      io.observe(wrap)
      const onVis = () => !document.hidden && wake()
      document.addEventListener('visibilitychange', onVis)
      const onTheme = new MutationObserver(() => {
        uniforms.uAccent.value = accent()
        wake()
      })
      onTheme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.clearTimeout(releaseTimer)
        ro.disconnect()
        io.disconnect()
        onTheme.disconnect()
        st.kill()
        gsap.killTweensOf(uniforms.uProgress)
        window.removeEventListener('pointermove', onPointer)
        window.removeEventListener('pointerdown', onPointer)
        window.removeEventListener('touchstart', onTouch)
        window.removeEventListener('touchmove', onTouch)
        window.removeEventListener('touchend', onRelease)
        document.documentElement.removeEventListener('pointerleave', onRelease)
        document.removeEventListener('visibilitychange', onVis)
        geo.dispose()
        mat.dispose()
        uniforms.uTex.value?.dispose()
        renderer.dispose()
        canvas.remove()
        delete wrap.dataset.live
      }
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [src, aspect])

  return <div ref={host} data-portrait-stage className="pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
}
