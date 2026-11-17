/**
 * Where each skill shows up — built only from the records already on the
 * site (projects, research, roles, credentials), so the skill pop-up never
 * says anything those records don't. Each skill lists the words that mark
 * it in those records; matching is case-insensitive.
 */
import { skillGroups } from '@/data/skills'
import { work } from '@/data/work'
import { studies } from '@/data/research'
import { experience } from '@/data/experience'
import { allCertifications } from '@/data/certifications'

const KEYWORDS: Record<string, string[]> = {
  'AI (DL, CV)': ['deep learning', 'neural', 'computer vision', 'AI-assisted', 'artificial intelligence', 'LSTM'],
  'ML Algorithms': ['machine learning', 'random forest', 'xgboost', 'neural', 'ensemble', 'meta-learner'],
  'Predictive Modeling': ['predict', 'regression', 'classifier', 'estimate'],
  Python: ['python'],
  'R Programming': ['R programming', ' in R', 'data analysis with R'],
  SQL: ['sql', 'postgresql'],
  Tableau: ['tableau'],
  Spreadsheets: ['excel', 'spreadsheet'],
  'Thematic Analytics': ['thematic', 'impact', 'survey'],
  'Process Optimization': ['automat', 'optimiz', 'processing delays'],
  'Database Management': ['database', 'prisma', 'postgresql', 'data models'],
  'Dashboard Design': ['dashboard', 'tableau', 'visualiz'],
  'Project Management': ['logistics', 'project', 'coordinat'],
  'Effective Communication': ['taught', 'workshop', 'facilitat', 'report'],
  'Problem-Solving': ['troubleshoot', 'detect', 'solv', 'escalat'],
  'Time Management': ['deadline', 'reminder', 'schedul', 'daily'],
  'Teaching & Mentorship': ['taught', 'tutor', 'mentor', 'teaching', 'learners'],
}

export type Evidence = { kind: 'Project' | 'Research' | 'Role' | 'Credential'; title: string; meta: string; href: string }

const has = (text: string, words: string[]) => {
  const t = ` ${text.toLowerCase()} `
  return words.some((w) => t.includes(w.toLowerCase()))
}

export function skillEvidence(skill: string): { group: string; items: Evidence[] } {
  const group = skillGroups.find((g) => (g.skills as readonly string[]).includes(skill))?.label ?? ''
  const words = KEYWORDS[skill] ?? [skill]
  const items: Evidence[] = []
  for (const w of work)
    if (has([w.title, w.summary, ...w.stack].join(' '), words)) items.push({ kind: 'Project', title: w.title, meta: `${w.org} · ${w.year}`, href: '/work' })
  for (const s of studies)
    if (has([s.title, s.method, ...s.stack].join(' '), words)) items.push({ kind: 'Research', title: s.title, meta: `${s.venue} · ${s.year} · draft`, href: `/research#${s.id}` })
  for (const r of experience)
    if (has([r.title, ...r.bullets, ...r.tags].join(' '), words)) items.push({ kind: 'Role', title: `${r.title}, ${r.org}`, meta: r.period, href: '/#experience' })
  for (const c of allCertifications)
    if (has(c.title, words)) items.push({ kind: 'Credential', title: c.title, meta: `${c.issuer} · ${c.date}`, href: '/credentials' })
  return { group, items: items.slice(0, 8) }
}
