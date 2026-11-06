/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Printed flight-briefing palette: warm paper, ink, and meaning-only status colours.
        paper: {
          DEFAULT: '#f3f0e8',
          deep: '#e9e5d9',
        },
        ink: {
          DEFAULT: '#16150f',
          soft: '#4a473f',
          faint: '#7d796c',
        },
        rule: '#d3cdbf',
        go: {
          DEFAULT: '#1f7a45',
          soft: '#e0ece1',
        },
        caution: {
          DEFAULT: '#8f5300',
          bright: '#c98a1b',
          soft: '#f3e5c8',
        },
        nogo: {
          DEFAULT: '#b3261e',
          soft: '#f4dad6',
        },
        signal: '#e8550f',
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
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 1.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}
