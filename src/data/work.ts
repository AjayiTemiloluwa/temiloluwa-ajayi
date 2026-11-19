import type { Cite } from '@/data/sources'

/**
 * Selected work — one-line stories of things built. Every summary and
 * figure comes from the matching CV bullet.
 */

export type WorkItem = {
  title: string
  org: string
  year: string
  stack: readonly string[]
  summary: string
  /** The headline number pulled out of the summary, shown as a stat callout. */
  metric?: { value: string; label: string }
  featured?: boolean
  /** The CV line the summary and figure come from. */
  cite: Cite
}

export const work: WorkItem[] = [
  {
    title: 'Compliance Management Platform',
    cite: { doc: 'cv', where: 'Work experience', quote: "integrated with Google Workspace, AWS S3, and automated PDF report generation" },
    org: 'Sankore Investment',
    year: '2026',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'AWS S3'],
    summary:
      'Full-stack platform for regulatory compliance tracking, litigation case management and reporting, integrated with Google Workspace and AWS S3, with automated PDF reports.',
    metric: { value: '11', label: 'linked data models' },
    featured: true,
  },
  {
    title: 'Automated Compliance Escalation System',
    cite: { doc: 'cv', where: 'Work experience', quote: "running daily and routing pre-deadline reminders" },
    org: 'Sankore Investment',
    year: '2026',
    stack: ['n8n', 'HTML email templates', 'Audit logging'],
    summary:
      'Runs every day. It sends reminders before each deadline and escalates in stages after it, to the right team, with audit logging and deduplication.',
    metric: { value: 'Daily', label: 'automated runs' },
  },
  {
    title: 'Biometric Attendance Prototype',
    cite: { doc: 'cv', where: 'Work experience', quote: "reduced processing delays by 35 percent and improved access control monitoring accuracy" },
    org: 'SLB Nigeria',
    year: '2025',
    stack: ['Python', 'Data validation', 'Excel dashboards'],
    summary:
      'A Python prototype with validated data logging and automated Excel reports. It cut processing delays by 35% and improved access-control monitoring.',
    metric: { value: '35%', label: 'fewer processing delays' },
  },
  {
    title: 'Data Pipelines & KPI Tracking',
    cite: { doc: 'cv', where: 'Work experience', quote: "reducing manual reporting by 40 percent" },
    org: 'GOLEARN Africa',
    year: '2024',
    stack: ['Python', 'SQL', 'Advanced Excel'],
    summary:
      'Automated data pipelines and AI-assisted performance tracking. Manual reporting fell by 40%, and KPIs became easier to follow.',
    metric: { value: '40%', label: 'less manual reporting' },
  },
  {
    title: 'Student Impact Study',
    cite: { doc: 'cv', where: 'Work experience', quote: "applied structured thematic and conceptual" },
    org: 'Freelance Data Science',
    year: '2023',
    stack: ['Pandas', 'NumPy', 'Thematic coding'],
    summary:
      'Quantitative and qualitative analysis of how the conflict in Ukraine affected African students, using structured thematic coding.',
  },
  {
    title: 'Math × Chemistry Correlation Study',
    cite: { doc: 'cv', where: 'Work experience', quote: "regression analysis in Python, and visualization" },
    org: 'Freelance Data Science',
    year: '2022',
    stack: ['Python regression', 'Matplotlib', 'Tableau'],
    summary: 'Regression analysis of how mathematics and chemistry performance relate, with charts to support the recommendations.',
  },
]
