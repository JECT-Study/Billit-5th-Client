const plugin = require('tailwindcss/plugin');
const sharedPreset = require('@billit/config/tailwind-preset');

const suitByWeight = {
  thin: 'SUIT-Thin',
  extralight: 'SUIT-ExtraLight',
  light: 'SUIT-Light',
  normal: 'SUIT-Regular',
  medium: 'SUIT-Medium',
  semibold: 'SUIT-SemiBold',
  bold: 'SUIT-Bold',
  extrabold: 'SUIT-ExtraBold',
  black: 'SUIT-Heavy',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset'), sharedPreset],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SUIT-Regular'],
      },
    },
  },
  corePlugins: {
    fontWeight: false,
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities(
        Object.fromEntries(
          Object.entries(suitByWeight).map(([weight, family]) => [
            `.font-${weight}`,
            { 'font-family': family, 'font-weight': 'normal' },
          ]),
        ),
      );
    }),
  ],
};
