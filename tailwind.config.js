/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Light theme colors
        'primary-light': '#3B82F6',
        'surface-light': '#ffffff',
        'text-light': '#1f2937',
        
        // Dark theme colors
        'primary-dark': '#14B8A6',
        'surface-dark': '#121212',
        'text-dark': '#e0e0e0',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      },
    },
  },
  plugins: [],
} 