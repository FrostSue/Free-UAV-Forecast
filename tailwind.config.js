/** @type {import('tailwindcss').Config} */

// Every colour resolves to a CSS variable (see src/index.css) so the same
// utility classes work in both the dark and the light theme.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: v('bg'),
          deep: v('surface-2'),
        },
        surface: v('surface'),
        ink: {
          DEFAULT: v('text'),
          soft: v('text-2'),
          faint: v('text-3'),
        },
        rule: v('line'),
        line: {
          DEFAULT: v('line'),
          strong: v('line-strong'),
        },
        go: {
          DEFAULT: v('go'),
          soft: v('go-bg'),
          solid: v('go-solid'),
        },
        caution: {
          DEFAULT: v('caution'),
          bright: v('caution-bright'),
          soft: v('caution-bg'),
          solid: v('caution-solid'),
        },
        nogo: {
          DEFAULT: v('nogo'),
          soft: v('nogo-bg'),
          solid: v('nogo-solid'),
        },
        signal: v('accent'),
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        cond: ['"IBM Plex Sans Condensed"', '"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 1.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
