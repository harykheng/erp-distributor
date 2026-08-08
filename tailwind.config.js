/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: 'rgb(var(--base-950) / <alpha-value>)',
          900: 'rgb(var(--base-900) / <alpha-value>)',
          850: 'rgb(var(--base-850) / <alpha-value>)',
          800: 'rgb(var(--base-800) / <alpha-value>)',
          750: 'rgb(var(--base-750) / <alpha-value>)',
          700: 'rgb(var(--base-700) / <alpha-value>)',
          600: 'rgb(var(--base-600) / <alpha-value>)',
          500: 'rgb(var(--base-500) / <alpha-value>)',
          400: 'rgb(var(--base-400) / <alpha-value>)',
          300: 'rgb(var(--base-300) / <alpha-value>)',
          200: 'rgb(var(--base-200) / <alpha-value>)',
          100: 'rgb(var(--base-100) / <alpha-value>)',
        },
        ink: '#170f04',
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
