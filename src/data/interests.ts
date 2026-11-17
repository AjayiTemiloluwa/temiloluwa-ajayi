/**
 * Interests — the curiosity shelf: the professional interests behind the
 * work (`kind: 'work'`), plus life off the clock (`kind: 'life'`).
 * Rendered by /interests; the `life` entries also appear on /life.
 *
 * Blurbs describe what is actually done or studied — each `work` blurb
 * is backed by an entry in experience.ts, research.ts or community.ts.
 */

export type Interest = {
  icon:
    | 'cpu'
    | 'trending-up'
    | 'zap'
    | 'graduation-cap'
    | 'users'
    | 'chef-hat'
    | 'dumbbell'
    | 'gamepad'
    | 'plug'
    | 'audio'
    | 'bar-chart'
  title: string
  /** `work` = a professional interest; `life` = off the clock. */
  kind: 'work' | 'life'
  blurb: string
}

export const interests: Interest[] = [
  {
    icon: 'cpu',
    title: 'AI & Intelligent Systems',
    kind: 'work',
    blurb: 'Ensemble models and deep learning in my research, and automation that runs every day at work.',
  },
  {
    icon: 'zap',
    title: 'Energy & Sustainability',
    kind: 'work',
    blurb: 'A five-year petroleum engineering degree, which my research applies to well control, gas flaring and fracturing fluids.',
  },
  {
    icon: 'trending-up',
    title: 'Climate Fintech & Quant',
    kind: 'work',
    blurb: 'Studying financial engineering at WorldQuant University, with an interest in how the energy transition gets financed.',
  },
  {
    icon: 'graduation-cap',
    title: 'Teaching & Mentorship',
    kind: 'work',
    blurb: 'Taught Python and data analysis to learners in Africa, Asia, Europe and North America.',
  },
  {
    icon: 'users',
    title: 'Community & Leadership',
    kind: 'work',
    blurb: 'SPE event logistics, IT at Krawdwise Africa, and Junior Achievers workshops on generative AI and money skills.',
  },
  {
    icon: 'bar-chart',
    title: 'Data Visualization',
    kind: 'work',
    blurb: 'Dashboards and charts in Tableau, Matplotlib and Excel that make a result easy to read.',
  },
  {
    icon: 'chef-hat',
    title: 'Cooking',
    kind: 'life',
    blurb: 'Nigerian classics, and trying out new dishes.',
  },
  {
    icon: 'dumbbell',
    title: 'Calisthenics',
    kind: 'life',
    blurb: 'Bodyweight training. I try to keep it regular.',
  },
  {
    icon: 'gamepad',
    title: 'Gaming',
    kind: 'life',
    blurb: 'Mostly strategy games. I like seeing how their rules and economies are put together.',
  },
  {
    icon: 'plug',
    title: 'Electrical & Refrigeration',
    kind: 'life',
    blurb: 'Hands-on work with circuits, wiring and cooling systems.',
  },
  {
    icon: 'audio',
    title: 'Sound Engineering',
    kind: 'life',
    blurb: 'Signal chains, mixing and live sound.',
  },
]
