// FE 네이밍 컨벤션 (ESLint로 검사 가능한 부분만)
import checkFile from 'eslint-plugin-check-file';

const LEVEL = 'warn';

const TS_FILES = ['**/*.{ts,tsx}'];
const IGNORES = ['**/*.d.ts', '**/*.config.{ts,mts}'];

// Expo Router / Next App Router 파일 이름:
//   kebab-case, index, _layout, +not-found, +html, [param], [...rest]
const CAMEL = '+([a-z])*([a-z0-9])*([A-Z]*([a-z0-9]))';
const KEBAB = '+([a-z])*([a-z0-9])*(-+([a-z0-9]))';
const ROUTE_FILE = `@(${KEBAB}|_layout|\\+not-found|\\+html|\\[${CAMEL}\\]|\\[...${CAMEL}\\])`;

// zod 스키마는 ...Schema
const zodSchemaSelectors = [
  {
    selector: `VariableDeclarator[id.name!=/Schema$/][init.callee.object.name="z"]`,
    message: 'zod 스키마 변수는 ...Schema 로 끝나야 합니다. (예: signInSchema)',
  },
  {
    selector: `VariableDeclarator[id.name!=/Schema$/][init.callee.object.callee.object.name="z"]`,
    message: 'zod 스키마 변수는 ...Schema 로 끝나야 합니다. (예: signInSchema)',
  },
];

const fileRules = (pattern) => ({
  'check-file/filename-naming-convention': [
    LEVEL,
    { '**/*.{ts,tsx}': pattern },
    { ignoreMiddleExtensions: true }, // foo.test.ts, foo.web.tsx
  ],
});

export const naming = [
  // 1) 파일/폴더 이름
  {
    files: TS_FILES,
    ignores: IGNORES,
    plugins: { 'check-file': checkFile },
    rules: {
      // 폴더: kebab-case
      'check-file/folder-naming-convention': [
        LEVEL,
        { '**/': 'KEBAB_CASE' },
        { ignoreWords: ['__tests__', '__mocks__'] },
      ],
      // 일반 .ts 파일: camelCase
      ...fileRules('CAMEL_CASE'),
    },
  },
  // 컴포넌트(.tsx): PascalCase
  { files: ['**/*.tsx'], ignores: IGNORES, rules: fileRules('PASCAL_CASE') },
  // 훅 파일: use로 시작하는 camelCase (useTheme.ts)
  {
    files: ['**/hooks/**/*.{ts,tsx}'],
    ignores: IGNORES,
    rules: fileRules('use[A-Z]*([a-zA-Z0-9])'),
  },
  // 라우트 폴더/파일 (Expo Router, Next App Router)
  {
    files: ['**/app/**/*.{ts,tsx}'],
    ignores: IGNORES,
    rules: {
      'check-file/folder-naming-convention': [
        LEVEL,
        { '**/app/**/': 'NEXT_JS_APP_ROUTER_CASE' },
      ],
      ...fileRules(ROUTE_FILE),
    },
  },

  // 2) 코드 안의 이름 (타입 정보 필요: boolean 접두사 검사)
  {
    files: TS_FILES,
    ignores: IGNORES,
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        LEVEL,
        // 기본: camelCase
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'import', format: null },
        // 변수: camelCase, 컴포넌트는 PascalCase, 상수는 UPPER_SNAKE_CASE
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // boolean 변수: is/has/can/should 접두사 (isOpen, hasError)
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'has', 'can', 'should'],
        },
        // 구조분해로 받은 이름은 라이브러리가 정하므로 검사하지 않음
        { selector: 'variable', modifiers: ['destructured'], format: null },
        // 함수: camelCase, 컴포넌트는 PascalCase
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // 타입/인터페이스/enum: PascalCase
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        // 객체 키는 API 필드, 헤더 이름 등 외부에서 정해지는 경우가 많아 검사하지 않음
        {
          selector: [
            'objectLiteralProperty',
            'objectLiteralMethod',
            'typeProperty',
            'typeMethod',
          ],
          format: null,
        },
      ],
      'no-restricted-syntax': [LEVEL, ...zodSchemaSelectors],
    },
  },
];

// JSX 이벤트 핸들러: 넘기는 props는 on..., 만드는 함수는 handle...
// <Button onPress={handlePress} />
export const namingReact = [
  {
    files: ['**/*.tsx'],
    ignores: IGNORES,
    rules: {
      'react/jsx-handler-names': [
        LEVEL,
        {
          eventHandlerPrefix: 'handle',
          eventHandlerPropPrefix: 'on',
          checkLocalVariables: true,
        },
      ],
    },
  },
];

// 라우트 화면 컴포넌트(default export)는 ...Screen
// no-restricted-syntax는 덮어쓰기라 zod 규칙도 같이 넣는다.
export const namingScreen = (files) => [
  {
    files,
    ignores: ['**/_layout.tsx', '**/+*.tsx'],
    rules: {
      'no-restricted-syntax': [
        LEVEL,
        ...zodSchemaSelectors,
        {
          selector:
            'ExportDefaultDeclaration > FunctionDeclaration[id.name!=/Screen$/]',
          message:
            '화면 컴포넌트는 ...Screen 으로 끝나야 합니다. (예: HomeScreen)',
        },
        {
          selector: 'ExportDefaultDeclaration > Identifier[name!=/Screen$/]',
          message:
            '화면 컴포넌트는 ...Screen 으로 끝나야 합니다. (예: HomeScreen)',
        },
      ],
    },
  },
];

export default naming;
