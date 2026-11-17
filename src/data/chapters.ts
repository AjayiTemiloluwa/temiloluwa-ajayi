/**
 * The years that made me — life timeline, newest first.
 *
 * Each year lists everything on record for it, and every entry is
 * traceable to another data file: experience.ts (roles, education),
 * work.ts (projects), research.ts (manuscripts), certifications.ts
 * (credentials, framed awards) and community.ts (leadership, honors).
 * When one of those changes, update the matching entry here.
 */

export type ChapterEntryKind = 'Work' | 'Study' | 'Research' | 'Project' | 'Credential' | 'Award' | 'Community'

export type ChapterEntry = { kind: ChapterEntryKind; text: string }

export type Chapter = {
  year: string
  title: string
  body: string
  entries: readonly ChapterEntry[]
}

export const chapters: Chapter[] = [
  {
    year: '2026',
    title: 'Graduating, then Sankore',
    body: 'I graduated in February and joined Sankore in April to build automation tools. The same month I started the M.Sc in financial engineering at WorldQuant.',
    entries: [
      { kind: 'Study', text: 'B.Sc Petroleum Engineering completed, University of Ibadan (Feb)' },
      { kind: 'Study', text: 'M.Sc Financial Engineering begins, WorldQuant University (Apr)' },
      { kind: 'Work', text: 'AI & Automation Analyst, Sankore Investment (Apr–Present)' },
      { kind: 'Project', text: 'Compliance Management Platform: Next.js, TypeScript, PostgreSQL; 11 linked data models' },
      { kind: 'Project', text: 'Automated Compliance Escalation System: n8n, daily reminders and multi-level escalations' },
      { kind: 'Research', text: 'Ensemble machine learning for early well-kick detection, draft manuscript for SPE NAICE STSE 2026' },
      { kind: 'Research', text: 'Fracturing-fluid rheology and clay stabilization with machine learning: B.Sc thesis, draft manuscript for SPE NAICE STSE 2026' },
      { kind: 'Work', text: 'Wrapped up the Tutorszone coding-tutor role and freelance data science (Apr)' },
      { kind: 'Community', text: 'Millennium Fellowship Global Admissions Committee (2025–26); SPE UI logistics term ends (Jan)' },
    ],
  },
  {
    year: '2025',
    title: 'A year of teaching',
    body: 'I taught Python to learners on four continents, joined the NHEF Scholars Program, and led logistics for SPE events at the University of Ibadan.',
    entries: [
      { kind: 'Work', text: 'Coding Tutor, Tutorszone.ng (from May): Python across four continents, 95% certification completion' },
      { kind: 'Work', text: 'SLB Reservoir Performance internship completed (Apr); Data Analyst role at GOLEARN Africa ends (Mar)' },
      { kind: 'Project', text: 'Biometric Attendance Prototype at SLB: 35% fewer processing delays' },
      { kind: 'Research', text: 'Well-kick detection and quantification using real-time anomaly detection, draft manuscript for SPE SAASC 2025' },
      { kind: 'Community', text: 'Logistics Team Lead, SPE University of Ibadan (from Apr): operational costs down 23%' },
      { kind: 'Community', text: 'Head of IT, Krawdwise Africa, and Junior Achievers Nigeria volunteer (both through Dec)' },
      { kind: 'Award', text: 'Award of Excellent Service as Co-Logistics Lead, SPE University of Ibadan (Dec)' },
      { kind: 'Award', text: 'Scholar, Nigeria Higher Education Foundation (Jul)' },
      { kind: 'Community', text: 'Member, Millennium Fellowship Global Admissions Committee; Delegate, Younga Task Teams' },
      { kind: 'Credential', text: 'IBM SkillsBuild ITExperience Orientation, 1-hour course (Sep)' },
    ],
  },
  {
    year: '2024',
    title: 'Internship at SLB',
    body: 'An internship with SLB in Port Harcourt. Around the same time I started leading IT at Krawdwise Africa and volunteering with Junior Achievers.',
    entries: [
      { kind: 'Work', text: 'Reservoir Performance Intern, SLB Nigeria, Port Harcourt (from Nov)' },
      { kind: 'Project', text: 'Data Pipelines & KPI Tracking at GOLEARN Africa: 40% less manual reporting' },
      { kind: 'Research', text: 'Gas-flaring analytics with satellite flare records, draft manuscript for STSE 2024' },
      { kind: 'Community', text: 'Head of IT, Krawdwise Africa (from Dec): efficiency up 30%' },
      { kind: 'Community', text: 'Volunteer, Junior Achievers Nigeria (from Nov): Generative AI, Set4Lyf and Global Money Week workshops' },
      { kind: 'Award', text: '#exploreCSR Award, Google Research · University of Ibadan (Jan)' },
      { kind: 'Award', text: 'Delegate, Bank of America Career Day (second year)' },
      { kind: 'Credential', text: 'Aspire Leaders Program, 30 hours of leadership coursework (Apr)' },
      { kind: 'Credential', text: 'Google Advanced Analytics: Translate Data into Insights, The Power of Statistics (Jan), Regression Analysis (Dec)' },
      { kind: 'Credential', text: 'Dataquest: Data Analysis and Visualization (Jan); Google: Foundations of Project Management (Nov)' },
    ],
  },
  {
    year: '2023',
    title: 'Data analyst at GOLEARN',
    body: 'I joined GOLEARN Africa as a data analyst, building automated pipelines and databases, and studied how the conflict in Ukraine affected African students.',
    entries: [
      { kind: 'Work', text: 'Data Analyst, GOLEARN Africa (from Sep): automated pipelines, 30% gain in reporting accuracy and operational efficiency' },
      { kind: 'Project', text: 'Student Impact Study: how the conflict in Ukraine affected African students' },
      { kind: 'Credential', text: 'Google Data Analytics Professional Certificate, 8 courses (Mar–Apr)' },
      { kind: 'Credential', text: 'Dataquest: Python Introduction (Aug); Google: Get Started with Python (Sep)' },
      { kind: 'Credential', text: 'EIT: Transforming Engineering With Artificial Intelligence, 1-hour webinar (Aug)' },
      { kind: 'Credential', text: 'Earth, Energy & Environment (E3) Online Student Conference, attended (Nov)' },
      { kind: 'Award', text: 'Delegate, Bank of America Career Day (first year)' },
    ],
  },
  {
    year: '2022',
    title: 'First freelance work',
    body: 'My first freelance data science work. The same year I made the Dean’s List and received two national scholarships.',
    entries: [
      { kind: 'Work', text: 'Freelance data science begins (Dec)' },
      { kind: 'Project', text: 'Math × Chemistry Correlation Study: Python regression, Matplotlib, Tableau' },
      { kind: 'Award', text: 'Dean’s List of Academic Achievement Award' },
      { kind: 'Award', text: 'Nigerian Federal Government Scholarship' },
      { kind: 'Award', text: 'Foursquare National Scholarship' },
    ],
  },
  {
    year: '2021',
    title: 'Starting petroleum engineering',
    body: 'I started the five-year petroleum engineering degree at the University of Ibadan.',
    entries: [{ kind: 'Study', text: 'B.Sc Petroleum Engineering begins, University of Ibadan (Feb)' }],
  },
]
