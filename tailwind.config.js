/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#F0424F',
          redDark: '#D81F2C',
          redSoft: '#FDE7E8',
          blue: '#4C7EF3',
          blueSoft: '#E8EFFD',
          green: '#0E9F6E',
          orange: '#F97316',
          amber: '#FBBF24',
          slate: '#6B7280',
          ink: '#1F2430',
          dim: '#8A90A2',
          border: '#ECEEF3',
          bg: '#F4F5F9',
          panel: '#FFFFFF',
        },
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04)',
      },
    },
  },
  plugins: [],
}
