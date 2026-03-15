import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // MAHA Peptides — Luxury Patriot / Elevated Americana
        navy: {
          DEFAULT: '#0A0C14',
          50:  '#F2EDE6',
          100: '#D8D0C4',
          200: '#B0A490',
          300: '#7A6E5E',
          400: '#4A4438',
          500: '#2A2E3E',
          600: '#1E2230',
          700: '#161C2E',
          800: '#0F1420',
          900: '#0A0C14',
        },
        gold: {
          DEFAULT: '#B8965A',
          50:  '#FAF6EF',
          100: '#F0E6CF',
          200: '#E2CDA0',
          300: '#D4B483',
          400: '#C8A56A',
          500: '#B8965A',
          600: '#9A7A44',
          700: '#7A5F32',
          800: '#5A4422',
          900: '#3A2C14',
        },
        red: {
          DEFAULT: '#8B1A1A',
          50:  '#FDF2F2',
          100: '#F9D5D5',
          200: '#F0A0A0',
          300: '#E06060',
          400: '#C0392B',
          500: '#8B1A1A',
          600: '#6E1414',
          700: '#520F0F',
          800: '#380A0A',
          900: '#200505',
        },
        warm: {
          white: '#F2EDE6',
          muted: '#6B7280',
          warning: '#D97706',
          error:   '#DC2626',
          success: '#059669',
        },
        // Keep clinical aliases for admin panel compatibility
        clinical: {
          white:   '#F2EDE6',
          gray:    '#6B7280',
          warning: '#D97706',
          error:   '#DC2626',
          success: '#059669',
        },
        // Keep charcoal aliases so existing admin classes don't break
        charcoal: {
          DEFAULT: '#0A0C14',
          50:  '#F2EDE6',
          100: '#D8D0C4',
          200: '#B0A490',
          300: '#7A6E5E',
          400: '#4A4438',
          500: '#2A2E3E',
          600: '#1E2230',
          700: '#161C2E',
          800: '#0F1420',
          900: '#0A0C14',
        },
        // Keep accent aliases for components not yet migrated
        accent: {
          DEFAULT: '#B8965A',
          50:  '#FAF6EF',
          100: '#F0E6CF',
          200: '#E2CDA0',
          300: '#D4B483',
          400: '#C8A56A',
          500: '#B8965A',
          600: '#9A7A44',
          700: '#7A5F32',
          800: '#5A4422',
          900: '#3A2C14',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        label:   ['"Futura PT"', 'Futura', 'Trebuchet MS', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs':  ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.08em' }],
        'sm':  ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.04em' }],
        'base':['1rem',     { lineHeight: '1.6rem' }],
        'lg':  ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':  ['1.25rem',  { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.02em' }],
        '5xl': ['3rem',     { lineHeight: '1.1',     letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem',  { lineHeight: '1',       letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem',   { lineHeight: '1',       letterSpacing: '-0.035em' }],
        '8xl': ['6rem',     { lineHeight: '1',       letterSpacing: '-0.04em' }],
      },
      maxWidth: {
        'content': '65ch',
        'narrow':  '48rem',
        'default': '64rem',
        'wide':    '80rem',
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgb(0 0 0 / 0.4)',
        'dark':    '0 2px 6px 0 rgb(0 0 0 / 0.5)',
        'dark-lg': '0 4px 16px 0 rgb(0 0 0 / 0.6)',
        'gold':    '0 0 20px rgba(184,150,90,0.25)',
        'gold-lg': '0 0 40px rgba(184,150,90,0.35)',
        'glass':   '0 4px 6px -1px rgb(0 0 0 / 0.3), inset 0 1px 0 0 rgb(255 255 255 / 0.04)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
