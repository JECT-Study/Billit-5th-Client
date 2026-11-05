import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

import { naming } from './naming.mjs';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  ...naming,
  {
    ignores: ['dist/**', 'coverage/**'],
  },
];
