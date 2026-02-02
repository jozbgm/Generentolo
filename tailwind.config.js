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
          'yellow': '#FFD93D', // Banana yellow - primary accent
          'magenta': '#FF006E', // Magenta/Fuschia - secondary
          'cyan': '#00F5FF', // Bright cyan - accent
          'blue': '#5E8BFF', // Legacy support
          'purple': '#8A78F4', // Legacy support
          'pink': '#F075B6' // Legacy support
        },
        'dark': {
          'bg': '#0D0D0D', // Pure anthracite black
          'surface': '#1A1A1A', // Pure anthracite grey for cards
          'surface-accent': '#252525', // Lighter pure anthracite for hover
          'text': '#F0F0F0',
          'text-muted': '#A0A0A0',
          'border': '#2D2D2D'
        },
        'light': {
          'bg': '#FAFBFC',
          'surface': '#FFFFFF',
          'surface-accent': '#F5F6F8',
          'text': '#0A0B0F',
          'text-muted': '#6B6C76',
          'border': '#E5E6E9'
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
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
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
        'slide-in-right': 'slideInRight 0.3s ease-out',
      }
    }
  },
  plugins: [],
}