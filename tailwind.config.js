/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Abilita la modalità scura basata sulla classe 'dark'
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          'blue': '#5E8BFF',
          'purple': '#8A78F4',
          'pink': '#F075B6'
        },
        'dark': {
          'bg': '#0F101A',
          'surface': '#181923', // For cards and panels
          'surface-accent': '#2A2B3A', // For hover states, inputs
          'text': '#E2E2E8',
          'text-muted': '#8B8D9C',
          'border': '#32333E'
        },
        'light': {
          'bg': '#F5F6FA',
          'surface': '#FFFFFF',
          'surface-accent': '#E8EAF2',
          'text': '#181923',
          'text-muted': '#6A6C79',
          'border': '#E4E5E9'
        },
      }
    }
  },
  plugins: [],
}