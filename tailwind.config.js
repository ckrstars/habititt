/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'accent-light': 'var(--accent-color)',
        'accent-dark': 'var(--accent-color)',
        'primary-light': 'var(--accent-color)',
        'primary-dark': 'var(--accent-color)',
        'surface-light': '#ffffff',
        'text-light': '#1f2937',
        
        // Dark theme colors
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