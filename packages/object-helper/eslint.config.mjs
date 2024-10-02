import nullTypeConfig from '@nulltype/eslint-config-ts-base'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/*'],
  },
  ...tseslint.configs.recommended,
  ...nullTypeConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
    },
  },
]
