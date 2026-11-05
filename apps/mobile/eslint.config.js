const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const {
  naming,
  namingReact,
  namingScreen,
} = require('@billit/config/eslint/naming');

module.exports = defineConfig([
  expoConfig,
  ...naming,
  ...namingReact,
  ...namingScreen(['src/app/**/*.tsx']),
  {
    ignores: ['dist/*'],
  },
]);
