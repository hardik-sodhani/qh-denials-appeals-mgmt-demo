import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#b8d4fe',
          300: '#7ab3fc',
          400: '#3a8ff7',
          500: '#1a6fdb',
          600: '#0f4c75',
          700: '#0b3a5d',
          800: '#0a2d4a',
          900: '#0b1a2e',
          950: '#060f1a',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
