/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#00529b', // Example college blue
        secondary: '#d00000', // Example college red
        background: '#121212', // Dark mode background
        card: '#1e1e1e', // Dark mode card
        text: '#ffffff', // Dark mode text
      },
    },
  },
  plugins: [],
}
