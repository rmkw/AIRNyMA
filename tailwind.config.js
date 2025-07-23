/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      'montserrat': ['Montserrat', 'sans-serif']
    },
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#888CE9",
          "secondary": "#003057",
          "accent": "#031633",
          "neutral": "#08989C",
          "base-100": "#f0f0f0",
          "info": "#00aadd",
          "success": "#4ade80",
          "warning": "#fde047",
          "error": "#ef4444",
        },
      },
      // otros temas de daisyUI si los quieres conservar
      "light",
      "dark",
      "bumblebee",
      "emerald",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "lofi",
      "fantasy",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
      "black",
    ],
  },
}
