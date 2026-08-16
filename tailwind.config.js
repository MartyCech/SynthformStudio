/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: "#090909",
        paper: "#f3f0e8",
        acid: "#d8ff36",
        coral: "#ff5d3d",
        cyan: "#53e5ff",
        dark: {
          900: "#090909",
          800: "#111111",
          700: "#1b1b1b",
          600: "#262626",
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
}
