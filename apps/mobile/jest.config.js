/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/jest/svgMock.js',
    // jest-expo의 react-native 조건 대신 Node 테스트용 MSW 진입점을 사용한다.
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
  },
  transform: {
    ...require('jest-expo/jest-preset').transform,
    // MSW 의존성의 ESM 전용 .mjs 파일도 Jest에서 변환한다.
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@billit|msw|@mswjs|@open-draft|rettime|until-async|zod))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};
