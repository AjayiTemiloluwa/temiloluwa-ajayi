'use client'

import { useEffect, useRef, useState } from 'react'
import { plates } from '@/data/photos'

/**
 * FilmReel — the photographs played back like a short film, drawn with
 * WebGL (no library needed: one full-screen quad and one fragment
 * shader).
 *
 * Each photo holds with a slow push-in (Ken Burns), then dissolves into
 * the next through a moving "ink" pattern (fractal noise): the outgoing
 * frame is pulled apart along the noise while the incoming one settles,
 * and the boundary between them glows in the site's accent colour. Over
 * everything: black-and-white grading, animated film grain, a faint
 * scanline and a vignette. An HTML overlay shows a running timecode and
 * the current photo's caption.
 *
 * It only animates while on screen and while the tab is visible. With
 * reduced motion, or if WebGL is unavailable, it shows the first photo
 * as a still.
 */

const HOLD = 2.4 // seconds a photo is shown before it dissolves
const DISSOLVE = 1.5 // seconds the dissolve takes
const SLIDE = HOLD + DISSOLVE

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uCoverA;
uniform vec2 uCoverB;
uniform float uZoomA;
uniform float uZoomB;
uniform float uP;
uniform float uT;
uniform vec2 uRes;
uniform vec3 uAccent;
uniform float uColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
vec2 cover(vec2 uv, vec2 s, float zoom) { return (uv - 0.5) * s / zoom + 0.5; }
float gray(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec2 uv = vUv;
  float n = fbm(uv * 3.2 + vec2(uT * 0.04, -uT * 0.03));

  // dissolve mask: 1 = outgoing frame A, 0 = incoming frame B
  float t = uP * 1.4 - 0.2;
  float mask = smoothstep(t - 0.07, t + 0.07, n);

  // the ink pulls the outgoing frame apart and lets the incoming one settle
  vec2 d = (vec2(n, fbm(uv * 3.2 + 7.3)) - 0.5) * 0.16;
  vec3 a = texture2D(uA, clamp(cover(uv + d * uP, uCoverA, uZoomA), 0.0, 1.0)).rgb;
  vec3 b = texture2D(uB, clamp(cover(uv - d * (1.0 - uP), uCoverB, uZoomB), 0.0, 1.0)).rgb;
  float g = mix(gray(b), gray(a), mask);

  // black-and-white grade with a little contrast
  g = clamp((g - 0.5) * 1.12 + 0.5, 0.0, 1.0);
  // colour returns on hover / touch (uColor eases 0 -> 1)
  vec3 rgb = mix(b, a, mask);
  vec3 col = mix(vec3(g), rgb, uColor);

  // glowing ink edge, only while dissolving
  float edge = 1.0 - abs(mask * 2.0 - 1.0);
  edge = pow(edge, 2.5) * sin(uP * 3.14159);
  col += uAccent * edge * 0.9;

  // film grain, scanline, vignette
  col += (hash(uv * uRes + fract(uT * 13.0) * 100.0) - 0.5) * 0.09;
  col *= 0.97 + 0.03 * sin(uv.y * uRes.y * 1.4);
  vec2 v = uv - 0.5;
  col *= smoothstep(0.85, 0.25, length(v * vec2(0.9, 1.0)));

  gl_FragColor = vec4(col, 1.0);
}`

type Tex = { tex: WebGLTexture; w: number; h: number; ready: boolean }

function readAccent(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim()
  const parts = raw.split(/\s+/).map(Number)
  return parts.length === 3 && parts.every((x) => !Number.isNaN(x))
    ? [parts[0] / 255, parts[1] / 255, parts[2] / 255]
    : [0.12, 0.35, 0.26]
}

function timecode(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  const f = Math.floor((s % 1) * 24)
  return `00:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}:${String(f).padStart(2, '0')}`
}

export function FilmReel({
  className = '',
  compact = false,
}: {
  className?: string
  /** Small tile: tighter overlay, no place name. */
  compact?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const tcRef = useRef<HTMLSpanElement | null>(null)
  const [slide, setSlide] = useState(0)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false })
    if (!gl) return

    // ── program
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('FilmReel shader:', gl.getShaderInfoLog(s))
        return null
      }
      return s
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = (name: string) => gl.getUniformLocation(prog, name)
    const U = {
      A: u('uA'), B: u('uB'), coverA: u('uCoverA'), coverB: u('uCoverB'),
      zoomA: u('uZoomA'), zoomB: u('uZoomB'), p: u('uP'), t: u('uT'), res: u('uRes'), accent: u('uAccent'), color: u('uColor'),
    }
    gl.uniform1i(U.A, 0)
    gl.uniform1i(U.B, 1)

    // ── textures (loaded progressively)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    const texs: Tex[] = plates.map((p) => {
      const tex = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 20, 18, 255]))
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return { tex, w: p.w, h: p.h, ready: false }
    })
    let disposed = false
    plates.forEach((p, i) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (disposed) return
        gl.bindTexture(gl.TEXTURE_2D, texs[i].tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        texs[i].w = img.naturalWidth
        texs[i].h = img.naturalHeight
        texs[i].ready = true
      }
      img.src = p.src
    })

    // ── size
    let W = 1
    let H = 1
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = wrap.getBoundingClientRect()
      W = Math.max(1, Math.round(r.width * dpr))
      H = Math.max(1, Math.round(r.height * dpr))
      canvas.width = W
      canvas.height = H
      gl.viewport(0, 0, W, H)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // "cover" fit: scale UVs so the photo fills the frame without stretching
    const coverOf = (t: Tex): [number, number] => {
      const ca = W / H
      const ia = t.w / t.h
      return ia > ca ? [ca / ia, 1] : [1, ia / ca]
    }

    // ── loop (only while visible)
    let raf = 0
    let running = false
    let clock = 0
    let last = 0
    let cur = 0
    let accent = readAccent()
    let shown = -1

    // black & white until hovered / touched — then the colour bleeds back in
    let colour = 0
    let colourTarget = 0
    const host = (wrap.closest('[data-tile]') as HTMLElement | null) ?? wrap
    const lightOn = () => { colourTarget = 1 }
    const lightOff = () => { colourTarget = 0 }
    host.addEventListener('pointerenter', lightOn)
    host.addEventListener('pointerleave', lightOff)
    host.addEventListener('touchstart', lightOn, { passive: true })
    host.addEventListener('touchend', lightOff, { passive: true })
    host.addEventListener('touchcancel', lightOff, { passive: true })
    let captioned = 0

    const next = (i: number) => {
      for (let k = 1; k <= texs.length; k++) {
        const j = (i + k) % texs.length
        if (texs[j].ready) return j
      }
      return i
    }

    const frame = (now: number) => {
      // hidden behind something (e.g. the gallery viewer covers the wall):
      // keep the loop alive but skip the GPU work
      if (wrap.closest('[data-paused]')) {
        last = 0
        raf = requestAnimationFrame(frame)
        return
      }
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
      last = now
      clock += dt

      const age = clock % SLIDE
      const slideNo = Math.floor(clock / SLIDE)
      if (slideNo !== shown) {
        if (shown !== -1) cur = next(cur)
        shown = slideNo
        accent = readAccent() // follow theme changes
      }
      const nxt = next(cur)
      const p = age < HOLD ? 0 : (age - HOLD) / DISSOLVE
      const ease = p * p * (3 - 2 * p)

      // the caption names whichever photo dominates the frame right now
      const onScreenIdx = ease > 0.5 ? nxt : cur
      if (onScreenIdx !== captioned) {
        captioned = onScreenIdx
        setSlide(onScreenIdx)
      }

      // slow push-in across each photo's life; the incoming one starts at
      // 1.0, which is exactly where it continues once it becomes current
      const zoomA = 1.0 + 0.1 * (age / SLIDE)
      const zoomB = 1.0

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texs[cur].tex)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, texs[nxt].tex)
      gl.uniform2fv(U.coverA, coverOf(texs[cur]))
      gl.uniform2fv(U.coverB, coverOf(texs[nxt]))
      gl.uniform1f(U.zoomA, zoomA)
      gl.uniform1f(U.zoomB, zoomB)
      gl.uniform1f(U.p, ease)
      gl.uniform1f(U.t, clock)
      gl.uniform2f(U.res, W, H)
      colour += (colourTarget - colour) * Math.min(1, dt * 4)
      gl.uniform1f(U.color, colour)
      gl.uniform3fv(U.accent, accent)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      if (tcRef.current) tcRef.current.textContent = timecode(clock)
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || disposed) return
      running = true
      last = 0
      setLive(true)
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    let onScreen = false
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting
        if (onScreen && !document.hidden) start()
        else stop()
      },
      { rootMargin: '100px' },
    )
    io.observe(wrap)
    const onVis = () => (document.hidden ? stop() : onScreen && start())
    document.addEventListener('visibilitychange', onVis)

    return () => {
      disposed = true
      stop()
      io.disconnect()
      host.removeEventListener('pointerenter', lightOn)
      host.removeEventListener('pointerleave', lightOff)
      host.removeEventListener('touchstart', lightOn)
      host.removeEventListener('touchend', lightOff)
      host.removeEventListener('touchcancel', lightOff)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      texs.forEach((t) => gl.deleteTexture(t.tex))
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  const photo = plates[slide]

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-[#141410] ${className}`} role="img" aria-label="A short animated reel of the ten photographs">
      {/* still frame: shown before WebGL starts, and as the fallback */}
      {!live && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={plates[0].src} alt="" className="photo-bw absolute inset-0 h-full w-full object-cover" />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* overlay — reads like a camera monitor */}
      <div
        className={`pointer-events-none absolute inset-0 flex flex-col justify-between font-semibold uppercase text-white/85 ${
          compact ? 'p-2 text-[9px] tracking-[0.1em]' : 'p-4 text-[11px] tracking-[0.16em]'
        }`}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse bg-red-500' : 'bg-white/50'}`} />
            {live ? 'Rec' : 'Reel'}
          </span>
          <span ref={tcRef} className="tabular-nums">00:00:00:00</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <span>
            {String(slide + 1).padStart(2, '0')} · {photo.tag}
          </span>
          {!compact && <span className="truncate text-white/60 normal-case tracking-normal">{photo.place}</span>}
        </div>
      </div>
    </div>
  )
}
