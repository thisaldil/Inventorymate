
export default {
  darkMode: 'class',
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ulss: {
          black: '#0A0A0A',
          white: '#FFFFFF',
          gold: '#D4AF37',
          gray: '#1A1A1A',
          lightGray: '#2A2A2A',
          muted: '#888888'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
