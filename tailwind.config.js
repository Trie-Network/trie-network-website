/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['IBM Plex Sans', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      fontSize: {
        'display-xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-lg': ['2rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-md': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'body-base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.01em' }],
        'body-xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0em' }],
        'label': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      colors: {
        background: {
          DEFAULT: '#f6f6f7',
          secondary: '#111315',
          tertiary: '#141414'
        },
        primary: {
          DEFAULT: 'var(--primary-color)',
          hover: 'var(--primary-hover-color)',
          light: 'var(--primary-light-color)'
        },
        border: {
          DEFAULT: '#1F1F1F',
          light: '#2D2D2D'
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          tertiary: '#71717A'
        },
        accent: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          pink: '#EC4899'
        },
        success: {
          DEFAULT: '#22C55E',
          light: '#dcfce7',
          dark: '#15803D'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#fef3c7',
          dark: '#B45309'
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#fee2e2',
          dark: '#B91C1C'
        }
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        popup: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(6, 182, 212, 0.15)',
        'focus-light': '0 0 0 2px rgba(6, 182, 212, 0.15)',
        'focus-dark': '0 0 0 2px rgba(6, 182, 212, 0.25)'
      },
      backdropBlur: {
        xs: '2px'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))'
      }
    },
  },
  plugins: [],
}