/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#818cf8', // Calming Indigo
        secondary: '#c7d2fe', // Soft Indigo
        accent: '#fca5a5', // Soft Red/Pink
        background: '#f0f9ff', // Alice Blue / Very light blue
        surface: '#ffffff',
        textMain: '#1e293b',
        textSub: '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}