// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Important: This tells Tailwind where to find your React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}