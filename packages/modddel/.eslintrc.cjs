module.exports = {
  extends: ['@nulltype/ts-base'],
  ignorePatterns: ['dist'],
  root: true,
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
  },
}
