// @ts-check
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/expo-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TypeScript estricto: nada de any ni de escapar del sistema de tipos.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSUnknownKeyword',
          message: 'Prohibido `as unknown`: modela el tipo correctamente.',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
  },
);
