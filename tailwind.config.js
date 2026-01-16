/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#0A6CF1',
        'medical-blue-dark': '#1E88E5',
        'medical-teal': '#00BFA5',
        'medical-green': '#4CAF50',
        'medical-bg': '#F7F9FC',
        'medical-navy': '#1A2332',
      },
      fontFamily: {
        'medical': ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
