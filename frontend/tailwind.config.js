/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: '#FF5A5F', // Airbnb coral
        airbg: '#F7F7F7', // Airbnb bg
        darkbg: '#12141C',
        card: '#FFFFFF',
        cardDark: '#23263A',
        border: '#E0E0E0',
        borderDark: '#2E324A',
        accent: '#00BFA6',
        grayText: '#B0B3C6',
      },
      fontFamily: {
        sans: ['Assistant', 'Rubik', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '2rem',
      },
      boxShadow: {
        air: '0 2px 16px 0 rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
