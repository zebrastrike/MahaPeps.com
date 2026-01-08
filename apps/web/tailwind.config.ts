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
        // MAHA Peptides Color Palette
        charcoal: {
          DEFAULT: '#0E0F12',
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6E737A',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#0E0F12',
        },
        accent: {
          DEFAULT: '#3A7F8C',
          50: '#F0F7F8',
          100: '#D9EBEE',
          200: '#B3D7DD',
          300: '#8CC3CB',
          400: '#66AFBA',
          500: '#3A7F8C',
          600: '#2E6670',
          700: '#234C54',
          800: '#173338',
          900: '#0C191C',
        },
        clinical: {
          white: '#F8F9FA',
          gray: '#6E737A',
          warning: '#D97706',
          error: '#DC2626',
          success: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
      },
      maxWidth: {
        'content': '65ch',
        'narrow': '48rem',
        'default': '64rem',
        'wide': '80rem',
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        'dark': '0 2px 4px 0 rgb(0 0 0 / 0.4)',
        'dark-lg': '0 4px 8px 0 rgb(0 0 0 / 0.5)',
        'glass': '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -1px rgb(0 0 0 / 0.06), inset 0 1px 0 0 rgb(255 255 255 / 0.05)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
