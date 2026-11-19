#!/usr/bin/env node
/**
 * check-sources — proves every cited quote is really in its document.
 *
 * Reads the `cite` objects out of src/data/*.ts, extracts each document's
 * text (PDFs page by page with `pdftotext`, the .docx thesis from its XML)
 * and checks the quote appears, on the cited page when one is given.
 * Whitespace and line breaks are ignored; nothing else is.
 *
 *   npm run check:sources
 *
 * Needs `pdftotext` (poppler; it ships with Git for Windows). Exits 1 if
 * any quote is missing, so a claim can't drift from its source unnoticed.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const pub = join(root, 'public')

const FILES = {
  cv: 'Temiloluwa-Ajayi-CV.pdf',
  'kick-ensemble': 'downloads/TSA-2026-SPE-NAICE-Ensemble-ML-Well-Kick-Detection.pdf',
  'kick-anomaly': 'downloads/TSA-2025-SPE-SAASC-Well-Kick-Detection-Quantification.pdf',
  'clay-stabilization': 'downloads/TSA-2026-SPE-NAICE-Clay-Stabilization-Rheology-ML.docx',
  'gas-flaring': 'downloads/TSA-2024-STSE-AI-BigData-Gas-Flaring-Management.pdf',
}

const squash = (s) =>
  s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\s+/g, '')
    .toLowerCase()

/** One string per page (PDF) or one for the whole document (DOCX). */
function pages(doc) {
  const file = join(pub, FILES[doc])
  if (file.endsWith('.pdf')) return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\f')
  return [docxText(readFileSync(file))]
}

/** Pull word/document.xml out of the .docx zip and drop the tags. */
function docxText(zip) {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  let p = zip.readUInt32LE(eocd + 16)
  const count = zip.readUInt16LE(eocd + 10)
  for (let i = 0; i < count; i++) {
    const method = zip.readUInt16LE(p + 10)
    const size = zip.readUInt32LE(p + 20)
    const nameLen = zip.readUInt16LE(p + 28)
    const extra = zip.readUInt16LE(p + 30)
    const comment = zip.readUInt16LE(p + 32)
    const local = zip.readUInt32LE(p + 42)
    const name = zip.toString('utf8', p + 46, p + 46 + nameLen)
    if (name === 'word/document.xml') {
      const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28)
      const raw = zip.subarray(start, start + size)
      const xml = (method === 8 ? inflateRawSync(raw) : raw).toString('utf8')
      return xml.replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '')
    }
    p += 46 + nameLen + extra + comment
  }
  throw new Error('word/document.xml not found')
}

// ── gather every cite from the data files ──
const dataDir = join(root, 'src', 'data')
const CITE = /\{\s*doc:\s*'([\w-]+)'(?:\s+as\s+const)?,\s*(?:page:\s*(\d+),\s*)?(?:where:\s*'(?:[^'\\]|\\.)*',\s*)?quote:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'),?\s*\}/g
const cites = []
for (const f of readdirSync(dataDir).filter((f) => f.endsWith('.ts'))) {
  const src = readFileSync(join(dataDir, f), 'utf8')
  for (const m of src.matchAll(CITE)) {
    const quote = m[3].startsWith('"') ? JSON.parse(m[3]) : m[3].slice(1, -1).replace(/\\(.)/g, '$1')
    cites.push({ file: f, doc: m[1], page: m[2] ? Number(m[2]) : undefined, quote })
  }
}

const cache = new Map()
let bad = 0
for (const c of cites) {
  if (!FILES[c.doc]) { console.log(`✗ ${c.file}: unknown doc '${c.doc}'`); bad++; continue }
  if (!cache.has(c.doc)) cache.set(c.doc, pages(c.doc).map(squash))
  const pg = cache.get(c.doc)
  const q = squash(c.quote)
  const found = pg.findIndex((t) => t.includes(q)) + 1
  if (!found) { console.log(`✗ ${c.file} → ${c.doc}: not found: "${c.quote}"`); bad++ }
  else if (c.page && !pg[c.page - 1]?.includes(q)) { console.log(`✗ ${c.file} → ${c.doc}: on page ${found}, cited as page ${c.page}: "${c.quote}"`); bad++ }
}
console.log(`${cites.length - bad}/${cites.length} quotes found in their sources`)
process.exit(bad ? 1 : 0)
