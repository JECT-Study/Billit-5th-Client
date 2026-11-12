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
  ...namingScreen(['src/features/**/screens/*.tsx']),
  {
    // Figma 플러그인 코드는 Figma 안에서만 실행되어 figma 전역 객체를 씀
    ignores: ['dist/*', 'scripts/figma/token-exporter/**'],
  },
]);
