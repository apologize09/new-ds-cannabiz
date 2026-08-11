/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00E5B5',
        'primary-dark': '#00C49A',
        orange: '#FF6B35',
        bg: '#0D0D0D',
        card: '#1A1A1A',
        'card-hover': '#222222',
        border: '#2A2A2A',
        muted: '#666666',
      },
      fontFamily: {
        sans: ['Arial', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
