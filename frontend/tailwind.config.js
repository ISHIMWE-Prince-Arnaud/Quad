/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        accent: '#FACC15',
        dark: {
          bg: '#1F2937',
          card: '#374151',
          text: '#F9FAFB',
        },
        light: {
          bg: '#F3F4F6',
          card: '#FFFFFF',
          text: '#1F2937',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}