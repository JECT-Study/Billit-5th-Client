const sharedPreset = require('@billit/config/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset'), sharedPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};
