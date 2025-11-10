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
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        success: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(138, 120, 244, 0.7)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(138, 120, 244, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(138, 120, 244, 0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        success: 'success 0.6s ease-out',
        shake: 'shake 0.5s ease-in-out',
      }
    }
  },
  plugins: [],
}