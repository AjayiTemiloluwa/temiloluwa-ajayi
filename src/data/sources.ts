/**
 * Sources — the documents every claim on the site is traced to.
 *
 * A `Cite` names a document, where in it to look (a page for PDFs, a
 * section for the .docx thesis) and the words it says, copied exactly.
 * scripts/check-sources.mjs re-reads each document and fails if a quote
 * can no longer be found in it, so a claim can't drift from its source.
 */

export type DocId = 'cv' | 'kick-ensemble' | 'kick-anomaly' | 'clay-stabilization' | 'gas-flaring'

export const DOCS: Record<DocId, { title: string; file: string; kind: 'PDF' | 'DOCX' }> = {
  cv: { title: 'CV', file: '/Temiloluwa-Ajayi-CV.pdf', kind: 'PDF' },
  'kick-ensemble': {
    title: 'Ensemble ML for Early Detection of Well Kicks (draft, 2026)',
    file: '/downloads/TSA-2026-SPE-NAICE-Ensemble-ML-Well-Kick-Detection.pdf',
    kind: 'PDF',
  },
  'kick-anomaly': {
    title: 'Well Kick Detection and Quantification (draft, 2025)',
    file: '/downloads/TSA-2025-SPE-SAASC-Well-Kick-Detection-Quantification.pdf',
    kind: 'PDF',
  },
  'clay-stabilization': {
    title: 'Rheology and Clay Stabilization (draft thesis, 2026)',
    file: '/downloads/TSA-2026-SPE-NAICE-Clay-Stabilization-Rheology-ML.docx',
    kind: 'DOCX',
  },
  'gas-flaring': {
    title: 'Transforming Gas Flaring Solutions (draft, 2024)',
    file: '/downloads/TSA-2024-STSE-AI-BigData-Gas-Flaring-Management.pdf',
    kind: 'PDF',
  },
}

export type Cite = {
  doc: DocId
  /** PDF page (1-based, as the viewer counts them). */
  page?: number
  /** Where on the page or in the document: a table, a section, a heading. */
  where?: string
  /** The source's own words, copied exactly (line breaks become spaces). */
  quote: string
}

/** A statement on the site and the line in a document that backs it. */
export type Claim = { text: string; cite: Cite }

/** A link that opens the document at the cited page (PDF viewers honour #page). */
export function citeHref(c: Cite): string {
  const d = DOCS[c.doc]
  return d.kind === 'PDF' && c.page ? `${d.file}#page=${c.page}` : d.file
}

/** "p. 11 · Table 4.4" — the short label on a source chip. */
export function citeLabel(c: Cite): string {
  const at = c.page ? `p. ${c.page}` : c.where ?? DOCS[c.doc].kind
  return c.doc === 'cv' ? 'CV' : at
}
