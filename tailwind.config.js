/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // Dark aquarium theme color system
      colors: {
        // Dark backgrounds (deep ocean blues)
        dark: {
          900: '#0a1628',  // Deepest dark blue (main background)
          800: '#0f1f3a',  // Dark blue (cards, sections)
          700: '#1a2f4a',  // Medium dark (hover states)
          600: '#244461',  // Lighter dark (borders, dividers)
        },
        // Ocean blues and teals
        ocean: {
          900: '#0c4a6e',
          800: '#075985',
          700: '#0369a1',
          600: '#0284c7',
          500: '#0ea5e9',
          400: '#38bdf8',
          300: '#7dd3fc',
          200: '#bae6fd',
          100: '#e0f2fe',
          50: '#f0f9ff',
        },
        // Coral accents
        coral: {
          600: '#f87171',
          500: '#fb7185',
          400: '#fda4af',
          300: '#fbcfe8',
        },
        // Sandy/neutral accents
        sand: {
          400: '#d4a574',
          300: '#e5c9a0',
          200: '#f0ddc0',
        },
      },
      // Professional typography
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      // Glass-morphism backdrop blur
      backdropBlur: {
        xs: '2px',
      },
      // Animation
      animation: {
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
