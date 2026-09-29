/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        display: ['Lato', 'sans-serif'],
        mono: ['Lato', 'sans-serif'],
      },
      colors: {
        bharath: {
          dark: '#080C14',
          panel: '#0F172A',
          card: '#121824',
          border: '#1E293B',
          borderHover: '#26334D',
          cyan: '#06B6D4',
          cyanGlow: '#00F0FF',
          blue: '#1E40AF',
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444'
        },
        aurora: {
          dark: '#080C14',
          panel: '#0F172A',
          card: '#121824',
          border: '#1E293B',
          borderHover: '#26334D',
          cyan: '#06B6D4',
          cyanGlow: '#00F0FF',
          blue: '#1E40AF',
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444'
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'card-glow': '0 4px 20px -2px rgba(6, 182, 212, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.5)',
        'panel-subtle': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.02)',
      }
    },
  },
  plugins: [],
}
