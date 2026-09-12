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
          'var(--font-figtree)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        display: [
          'var(--font-fraunces)',
          'Georgia',
          'serif',
        ],
      },
      colors: {
        // Aligné sur le bleu logo #2563EB — confiance, pas violet « fintech »
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          DEFAULT: '#eef1f5',
          card: '#ffffff',
          muted: '#e4e9ef',
        },
        ink: {
          DEFAULT: '#1a2332',
          soft: '#4a5568',
          mute: '#718096',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(26, 35, 50, 0.04), 0 4px 16px rgba(26, 35, 50, 0.06)',
        nav: '0 -2px 16px rgba(26, 35, 50, 0.12)',
        soft: '0 2px 8px rgba(26, 35, 50, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
