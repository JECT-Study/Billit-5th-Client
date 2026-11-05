import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { naming, namingReact } from '@billit/config/eslint/naming';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...naming,
  ...namingReact,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'jest.config.cjs',
    'postcss.config.js',
    'tailwind.config.js',
  ]),
]);

export default eslintConfig;
