/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1DA1F2',
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#1DA1F2',
          600: '#0284C7',
          700: '#0369A1',
        },
        gray: {
          50: '#F7F9FA',
          100: '#E1E8ED',
          200: '#AAB8C2',
          300: '#657786',
          400: '#536471',
          500: '#3C4043',
          600: '#202327',
          700: '#14171A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}