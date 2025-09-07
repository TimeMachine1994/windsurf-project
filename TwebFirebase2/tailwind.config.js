/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D5BA7F',
          'gold-dark': '#C5AA6F',
        }
      }
    },
  },
  plugins: [],
}
