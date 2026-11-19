import type { Claim } from '@/data/sources'

/**
 * Experience timeline + education. Each bullet is a claim tied to the CV
 * line it comes from (see data/sources.ts).
 */

export type Role = {
  title: string
  org: string
  place: string
  period: string
  bullets: readonly Claim[]
  tags: readonly string[]
  current?: boolean
}

export const experience: Role[] = [
  {
    title: 'AI & Automation Analyst',
    org: 'Sankore Investment',
    place: 'Lagos, Nigeria',
    period: 'Apr 2026 – Present',
    current: true,
    bullets: [
      {
        text: 'Built and deployed an n8n compliance reminder and escalation system. It runs daily and sends reminders and escalations to each team, with audit logging.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Built and deployed an automated compliance reminder and escalation system with n8n" },
      },
      {
        text: 'Developed a full-stack compliance platform (Next.js, TypeScript) for regulatory tracking, litigation case management and reporting.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Developed a full-stack compliance management platform (Next.js/TypeScript)" },
      },
      {
        text: 'Designed an 11-model PostgreSQL/Prisma schema, with migration and verification scripts for backfilling and reconciliation.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Designed an 11-model PostgreSQL/Prisma data schema" },
      },
    ],
    tags: ['n8n', 'Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'AWS'],
  },
  {
    title: 'Coding Tutor',
    org: 'Tutorszone.ng',
    place: 'Ibadan, Nigeria',
    period: 'May 2025 – Apr 2026',
    bullets: [
      {
        text: 'Taught Python for data analysis to K–12 and adult learners in Africa, Asia, Europe and North America, with a 95% certification completion rate on freeCodeCamp and Coursera.',
        cite: { doc: 'cv', where: 'Work experience', quote: "achieving a 95 percent certification completion rate on platforms such as freeCodeCamp and Coursera" },
      },
      {
        text: 'Built reporting templates to track student progress, improving analytical accuracy by about 35%.',
        cite: { doc: 'cv', where: 'Work experience', quote: "built structured reporting templates to track and visualize student performance trends, improving analytical accuracy by approximately 35 percent" },
      },
    ],
    tags: ['Python', 'Pandas', 'NumPy', 'SQL', 'Teaching'],
  },
  {
    title: 'Freelance Data Scientist',
    org: 'Independent',
    place: 'Remote',
    period: 'Dec 2022 – Apr 2026',
    bullets: [
      {
        text: 'Quantitative and qualitative study of how the conflict in Ukraine affected African students, with structured thematic coding.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Conducted quantitative and qualitative analysis on the Ukraine-Russia conflict's impact on African students" },
      },
      {
        text: 'Correlation study of mathematics and chemistry performance, using Python regression, Matplotlib and Tableau.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Carried out a correlation study on Mathematics and Chemistry performance" },
      },
    ],
    tags: ['Python', 'Excel', 'Tableau', 'Research'],
  },
  {
    title: 'Reservoir Performance Intern',
    org: 'SLB Nigeria Limited',
    place: 'Port Harcourt, Nigeria',
    period: 'Nov 2024 – Apr 2025',
    bullets: [
      {
        text: 'Built a Python biometric attendance prototype with automated Excel reporting, which cut processing delays by 35%.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Developed a Python based biometric attendance prototype" },
      },
      {
        text: 'Managed and analyzed inventory datasets in enterprise systems, improving data accuracy by 20%.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Managed and analyzed operational inventory datasets within enterprise systems" },
      },
    ],
    tags: ['Python', 'Excel', 'Enterprise systems'],
  },
  {
    title: 'Data Analyst',
    org: 'GOLEARN Africa',
    place: 'Lagos, Nigeria',
    period: 'Sep 2023 – Mar 2025',
    bullets: [
      {
        text: 'Automated data pipelines and relational databases in Python, SQL and Excel, improving reporting accuracy and operational efficiency by 30%.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Developed and automated structured data pipelines and relational databases using Python, SQL, and Excel, improving reporting accuracy and operational efficiency by 30 percent" },
      },
      {
        text: 'Built AI-assisted performance and engagement tracking that cut manual reporting by 40%.',
        cite: { doc: 'cv', where: 'Work experience', quote: "Built AI-assisted performance and engagement tracking systems with advanced Excel and SQL, reducing manual reporting by 40 percent" },
      },
    ],
    tags: ['Python', 'SQL', 'AI-assisted reporting'],
  },
]

export type Education = {
  degree: string
  school: string
  place: string
  period: string
  current?: boolean
}

export const education: Education[] = [
  {
    degree: 'M.Sc Financial Engineering',
    school: 'WorldQuant University',
    place: 'Louisiana, USA',
    period: 'Apr 2026 – Present',
    current: true,
  },
  {
    degree: 'B.Sc Petroleum Engineering',
    school: 'University of Ibadan',
    place: 'Ibadan, Nigeria',
    period: 'Feb 2021 – Feb 2026',
  },
]