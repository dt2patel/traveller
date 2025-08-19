
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#4F46E5', // Indigo 600
        'brand-secondary': '#10B981', // Emerald 500
        'brand-danger': '#EF4444', // Red 500
        'brand-warning': '#F59E0B', // Amber 500
      },
    },
  },
  plugins: [],
}
