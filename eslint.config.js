import auto from 'eslint-config-canonical/configurations/auto.js';
import module from 'eslint-config-canonical/configurations/module.js';
import ts from 'eslint-config-canonical/configurations/typescript-type-checking.js';
import zod from 'eslint-config-canonical/configurations/zod.js';

export default [
  ...auto,
  module.recommended,
  zod.recommended,
  {
    ...ts.recommended,
    files: ['*.ts', '*.tsx', '!test/**/*', '!*.test.ts', '!*.spec.ts'],
  },
  {
    rules: {
      'import/extensions': 'off',
    },
  },
  {
    ignores: ['package-lock.json', 'dist/', 'config/', '.github/'],
  },
  {
    ...ts.recommended,
    files: ['test/**/*', '**.test.ts', '**.spec.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
      },
    },
  },
];
