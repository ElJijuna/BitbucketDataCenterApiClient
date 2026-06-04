import eslintJest from 'super-configs/eslint/jest';
import eslintTs from 'super-configs/eslint/ts';

export default [
  {
    ignores: ['dist/**', 'docs/**', 'coverage/**', 'node_modules/**'],
  },
  ...eslintTs,
  ...eslintJest,
  {
    // Biome handles all formatting — disable conflicting @stylistic rules
    rules: {
      '@stylistic/brace-style': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/padding-line-between-statements': 'off',
    },
  },
];
