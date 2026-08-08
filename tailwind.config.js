/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0a0b',
          900: '#111113',
          850: '#16171a',
          800: '#1c1d21',
          750: '#212228',
          700: '#2a2b31',
          600: '#3a3b42',
          500: '#55565f',
          400: '#7b7d87',
          300: '#a3a5ae',
          200: '#c9cad1',
          100: '#e9e9ec',
        },
        brand: {
          DEFAULT: '#FF7A1A',
          50: '#FFF3E9',
          100: '#FFE3CC',
          200: '#FFC499',
          300: '#FFA366',
          400: '#FF8C40',
          500: '#FF7A1A',
          600: '#F0620A',
          700: '#C74E08',
          800: '#9C3D07',
          900: '#7A3007',
        },
        good: {
          DEFAULT: '#22c55e',
          bg: 'rgba(34,197,94,0.12)',
        },
        warn: {
          DEFAULT: '#eab308',
          bg: 'rgba(234,179,8,0.12)',
        },
        bad: {
          DEFAULT: '#ef4444',
          bg: 'rgba(239,68,68,0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
        pop: '0 8px 30px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
