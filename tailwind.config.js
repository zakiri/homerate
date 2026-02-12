/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0f172a',
        'dark-light': '#1e293b',
      }
    },
  },
  plugins: [],
}
