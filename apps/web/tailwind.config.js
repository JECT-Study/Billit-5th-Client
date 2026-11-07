const sharedPreset = require('@billit/config/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [sharedPreset],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-suit)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
