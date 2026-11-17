/**
 * Single source of truth — every fact here comes from Temiloluwa's CV
 * and the research manuscripts. Profile, focus axes, marquee and the
 * four disciplines; the other files in src/data hold the ledgers.
 *
 * Writing rule for this site: state what has been done as fact, and
 * what is aimed for as an aim. Never present an ambition as a result.
 */

export const profile = {
  name: 'Temiloluwa Samuel Ajayi',
  firstName: 'Temiloluwa',
  middleName: 'Samuel',
  lastName: 'Ajayi',
  initials: 'TA',
  siteUrl: 'https://temiloluwaajayi.vercel.app',
  /** Current job title, exactly as on the CV. */
  role: 'AI & Automation Analyst',
  location: 'Lagos, Nigeria',
  email: 'temiloluwaajayi2019@gmail.com',
  phoneDisplay: '+234 905 725 3126',
  phoneHref: 'tel:+2349057253126',
  linkedin: 'https://www.linkedin.com/in/temiloluwa-ajayi-b5b566236/',
  linkedinLabel: 'Temiloluwa Ajayi',
  github: 'https://github.com/AjayiTemiloluwa',
  githubLabel: 'github.com/AjayiTemiloluwa',
  cvPath: '/Temiloluwa-Ajayi-CV.pdf',
  availability: 'Open to new opportunities',
  /** The aim — shown under the hero line. Phrased as a direction, not a track record. */
  mission:
    'What I’m working toward: AI that makes energy operations safer and cleaner, and a better grasp of how the energy transition gets paid for.',
  /** One-paragraph summary — used for search and link previews. */
  statement:
    'AI & automation analyst in Lagos with a petroleum engineering degree, now studying financial engineering at WorldQuant University. My draft research applies machine learning to well control, gas flaring and fracturing fluids.',
} as const

/** The four fields the work draws on. */
export const focusAxes = ['Energy', 'Climate', 'AI', 'Finance'] as const

/** Methods and tools that appear in the work and research on this site. */
export const marqueeItems = [
  'Ensemble Learning',
  'XGBoost',
  'Well-Control Engineering',
  'Drilling Data',
  'Satellite Remote Sensing',
  'Gas-Flaring Analytics',
  'Fracturing-Fluid Rheology',
  'Random Forest',
  'Python',
  'SQL',
  'Next.js · TypeScript',
  'PostgreSQL · Prisma',
  'Financial Engineering',
  'Tableau',
  'n8n Automation',
] as const

/**
 * The four disciplines — shown in the layout, never said in the copy.
 */
export const pillars = [
  {
    icon: 'cpu',
    title: 'Build',
    body: 'AI and automation at work: a compliance reminder system that runs daily, and a full-stack compliance platform.',
  },
  {
    icon: 'chart',
    title: 'Model',
    body: 'Machine learning in my energy research: detecting well kicks, estimating flared gas volumes and designing fracturing fluids.',
  },
  {
    icon: 'cap',
    title: 'Teach',
    body: 'Python and data analysis for learners in Africa, Asia, Europe and North America.',
  },
  {
    icon: 'users',
    title: 'Lead',
    body: 'Led logistics for SPE student events and IT at Krawdwise Africa, and delivered workshops as a Junior Achievers volunteer.',
  },
] as const
