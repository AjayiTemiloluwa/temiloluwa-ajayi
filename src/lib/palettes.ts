/**
 * Paint palettes — the accent colours a visitor can throw onto the site (ui/PaintDrops.tsx).
 *
 * Each palette re-points the accent tokens in globals.css for BOTH themes:
 *   light  a deep shade that reads on cream (≥ 4.5:1)
 *   dark   a bright shade that glows on ink
 * and re-paints the inverted `.theme-ink` band (dark theme: the band takes the bright shade,
 * with `band` as its own accent). "studio" is the original green and sets nothing.
 *
 * The CSS is generated from this list (paletteCss) and inlined in the layout, so there is one
 * source of truth and no flash: the boot script sets <html data-palette> before first paint.
 */

export interface Palette {
  id: string
  name: string
  /** A few words for the picker. */
  vibe: string
  light: string // RGB triplet
  lightDim: string
  dark: string
  darkDim: string
  /** Accent inside the dark-theme `.theme-ink` band (which is painted in `dark`). */
  band: string
}

export const PALETTES: Palette[] = [
  { id: 'studio', name: 'Studio', vibe: 'the original green', light: '0 128 40', lightDim: '0 106 34', dark: '10 228 72', darkDim: '8 190 60', band: '70 40 190' },
  { id: 'ultraviolet', name: 'Ultraviolet', vibe: 'electric violet', light: '104 48 224', lightDim: '84 36 190', dark: '176 140 255', darkDim: '150 110 240', band: '40 16 120' },
  { id: 'sunset', name: 'Sunset', vibe: 'hot orange', light: '190 68 0', lightDim: '160 56 0', dark: '255 140 50', darkDim: '235 110 20', band: '90 30 0' },
  { id: 'ocean', name: 'Ocean', vibe: 'deep sea blue', light: '0 106 160', lightDim: '0 86 132', dark: '56 200 255', darkDim: '20 170 230', band: '0 50 90' },
  { id: 'bubblegum', name: 'Bubblegum', vibe: 'loud pink', light: '196 26 128', lightDim: '160 16 104', dark: '255 120 205', darkDim: '240 90 185', band: '100 0 70' },
  { id: 'citrus', name: 'Citrus', vibe: 'zesty lime', light: '96 106 0', lightDim: '80 88 0', dark: '226 255 40', darkDim: '200 230 0', band: '70 80 0' },
  { id: 'coral', name: 'Coral', vibe: 'warm red', light: '204 44 52', lightDim: '170 32 40', dark: '255 110 120', darkDim: '240 84 96', band: '110 10 20' },
  { id: 'mono', name: 'Ink', vibe: 'no colour at all', light: '14 16 15', lightDim: '60 62 60', dark: '255 252 225', darkDim: '220 216 190', band: '14 16 15' },
]

export const DEFAULT_PALETTE = 'studio'
export const paletteById = (id: string | null | undefined) => PALETTES.find((p) => p.id === id) ?? PALETTES[0]

const CREAM = '255 252 225'
const INK = '14 16 15'

/** The CSS for every palette except the default (which globals.css already defines). */
export function paletteCss(): string {
  return PALETTES.filter((p) => p.id !== DEFAULT_PALETTE)
    .map((p) => {
      const at = `:root[data-palette='${p.id}']`
      return [
        `${at}{--accent-rgb:${p.light};--accent-dim-rgb:${p.lightDim};--on-accent-rgb:${CREAM}}`,
        `${at}[data-theme='dark']{--accent-rgb:${p.dark};--accent-dim-rgb:${p.darkDim};--on-accent-rgb:${INK}}`,
        `${at}[data-theme='dark'] .theme-ink{--bg-rgb:${p.dark};--mist-rgb:${p.darkDim};--fg-rgb:${INK};--accent-rgb:${p.band};--accent-dim-rgb:${p.band};--on-accent-rgb:${CREAM}}`,
        `${at}:not([data-theme='dark']) .theme-ink{--accent-rgb:${p.dark};--accent-dim-rgb:${p.darkDim};--on-accent-rgb:${INK}}`,
      ].join('')
    })
    .join('')
}

/** Inline boot: apply the saved palette before first paint (unknown ids are ignored). */
export const paletteBootScript = `(function(){try{var p=localStorage.getItem('palette');if(p&&${JSON.stringify(PALETTES.map((p) => p.id))}.indexOf(p)>0){document.documentElement.dataset.palette=p}}catch(e){}})()`
