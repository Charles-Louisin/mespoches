/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          50: '#f0eeff',
          100: '#e0dcff',
          200: '#c4bbff',
          300: '#a89aff',
          400: '#8b7aff',
          500: '#635bff',
          600: '#5248e6',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: {
          DEFAULT: '#f4f4f7',
          card: '#ffffff',
        },
      },
      boxShadow: {
        card: '0 2px 12px rgba(99, 91, 255, 0.08)',
        nav: '0 -4px 24px rgba(99, 91, 255, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
