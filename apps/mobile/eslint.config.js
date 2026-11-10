const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const { naming, namingReact } = require('@billit/config/eslint/naming');

module.exports = defineConfig([
  expoConfig,
  ...naming,
  ...namingReact,
  {
    ignores: ['dist/*'],
  },
]);
