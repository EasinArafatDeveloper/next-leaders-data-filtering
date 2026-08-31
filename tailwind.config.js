/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  safelist: [
    { pattern: /bg-(brand|emerald|blue|amber|rose|indigo)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /text-(brand|emerald|blue|amber|rose|indigo)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /border-(brand|emerald|blue|amber|rose|indigo)-(50|100|200|300|400|500|600|700|800|900|950)/ },
  ],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111827',
          subtleLight: '#F7F8FA',
          subtleDark: '#0B0F19',
          borderLight: '#E5E7EB',
          borderDark: '#1F2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        cardHover: '0 10px 25px -5px rgba(79, 70, 229, 0.1), 0 8px 10px -6px rgba(79, 70, 229, 0.05)',
        glow: '0 0 20px -5px rgba(79, 70, 229, 0.4)',
      },
    },
  },
  plugins: [],
}
