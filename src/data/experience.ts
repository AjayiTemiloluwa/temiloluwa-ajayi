/**
 * Experience timeline + education.
 */

export type Role = {
  title: string
  org: string
  place: string
  period: string
  bullets: readonly string[]
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
      'Built and deployed an n8n compliance reminder and escalation system. It runs daily and sends reminders and escalations to each team, with audit logging.',
      'Developed a full-stack compliance platform (Next.js, TypeScript) for regulatory tracking, litigation case management and reporting.',
      'Designed an 11-model PostgreSQL/Prisma schema, with migration and verification scripts for backfilling and reconciliation.',
    ],
    tags: ['n8n', 'Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'AWS'],
  },
  {
    title: 'Coding Tutor',
    org: 'Tutorszone.ng',
    place: 'Ibadan, Nigeria',
    period: 'May 2025 – Apr 2026',
    bullets: [
      'Taught Python for data analysis to K–12 and adult learners in Africa, Asia, Europe and North America, with a 95% certification completion rate on freeCodeCamp and Coursera.',
      'Built reporting templates to track student progress, improving analytical accuracy by about 35%.',
    ],
    tags: ['Python', 'Pandas', 'NumPy', 'SQL', 'Teaching'],
  },
  {
    title: 'Freelance Data Scientist',
    org: 'Independent',
    place: 'Remote',
    period: 'Dec 2022 – Apr 2026',
    bullets: [
      'Quantitative and qualitative study of how the conflict in Ukraine affected African students, with structured thematic coding.',
      'Correlation study of mathematics and chemistry performance, using Python regression, Matplotlib and Tableau.',
    ],
    tags: ['Python', 'Excel', 'Tableau', 'Research'],
  },
  {
    title: 'Reservoir Performance Intern',
    org: 'SLB Nigeria Limited',
    place: 'Port Harcourt, Nigeria',
    period: 'Nov 2024 – Apr 2025',
    bullets: [
      'Built a Python biometric attendance prototype with automated Excel reporting, which cut processing delays by 35%.',
      'Managed and analyzed inventory datasets in enterprise systems, improving data accuracy by 20%.',
    ],
    tags: ['Python', 'Excel', 'Enterprise systems'],
  },
  {
    title: 'Data Analyst',
    org: 'GOLEARN Africa',
    place: 'Lagos, Nigeria',
    period: 'Sep 2023 – Mar 2025',
    bullets: [
      'Automated data pipelines and relational databases in Python, SQL and Excel, improving reporting accuracy and operational efficiency by 30%.',
      'Built AI-assisted performance and engagement tracking that cut manual reporting by 40%.',
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