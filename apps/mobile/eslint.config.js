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
    // 백엔드 도메인 명칭과 맞춘 exchangeRate만 폴더 네이밍 예외로 둔다.
    files: ['src/features/exchangeRate/**/*.{ts,tsx}'],
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        { '**/': 'KEBAB_CASE' },
        { ignoreWords: ['__tests__', '__mocks__', 'exchangeRate'] },
      ],
    },
  },
  {
    // Figma 플러그인 코드는 Figma 안에서만 실행되어 figma 전역 객체를 씀
    ignores: ['dist/*', 'scripts/figma/token-exporter/**'],
  },
]);
