const plugin = require('tailwindcss/plugin');

const jiti = require('jiti')(require.resolve('./tailwind.config.js'));
const tokens = jiti('./src/theme/theme.generated.ts');

const px = (value) => `${value}px`;
const mapPx = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, px(value)]),
  );

const suitByWeight = {
  normal: tokens.FONT_FAMILY['suit-regular'],
  medium: tokens.FONT_FAMILY['suit-medium'],
  semibold: tokens.FONT_FAMILY['suit-semibold'],
  bold: tokens.FONT_FAMILY['suit-bold'],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    spacing: mapPx(tokens.SPACING),
    extend: {
      colors: tokens.COLORS,
      textColor: tokens.TEXT_COLORS,
      borderColor: tokens.BORDER_COLORS,
      borderRadius: mapPx(tokens.RADIUS),
      fontSize: Object.fromEntries(
        Object.entries(tokens.FONT_SIZE).map(([key, [size, metrics]]) => [
          key,
          [
            px(size),
            {
              lineHeight: px(metrics.lineHeight),
              letterSpacing: px(metrics.letterSpacing),
            },
          ],
        ]),
      ),
      boxShadow: tokens.SHADOW,
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
            { 'font-family': family },
          ]),
        ),
      );
    }),
  ],
};
