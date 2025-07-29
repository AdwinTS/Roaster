// postcss.config.js
export default {
  plugins: {
    // CHANGE THIS LINE:
    // tailwindcss: {},  <-- Old way
    '@tailwindcss/postcss': {}, // <-- New way
    autoprefixer: {},
  },
}