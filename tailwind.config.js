/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Wired to the CSS variables in globals.css, so `.theme-ink` can
        // swap them for a whole subtree.
        paper: 'rgb(var(--bg-rgb) / <alpha-value>)', // page ground
        fg: 'rgb(var(--fg-rgb) / <alpha-value>)', // ink — text and rules
        mist: 'rgb(var(--mist-rgb) / <alpha-value>)', // tinted band
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)', // the single accent
        'accent-dim': 'rgb(var(--accent-dim-rgb) / <alpha-value>)',
        ember: 'rgb(var(--ember-rgb) / <alpha-value>)',
        lilac: 'rgb(var(--lilac-rgb) / <alpha-value>)',
        orange: 'rgb(var(--orange-rgb) / <alpha-value>)',
        pink: 'rgb(var(--pink-rgb) / <alpha-value>)',
        blue: 'rgb(var(--blue-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
