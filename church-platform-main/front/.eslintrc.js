/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'airbnb',
    'prettier',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'object-curly-newline': 'off',
    'import/no-extraneous-dependencies': 'off',
    'consistent-return': 'off',
    'array-callback-return': 'off',
    'no-plusplus': 'warn',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-alert': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-unused-vars': 'warn',
    'react/function-component-definition': 'off',
    camelcase: 'off',
    'react/no-unstable-nested-components': 'off',
    'arrow-body-style': 'off',
    'import/no-unresolved': ['error', { ignore: ['\\.svg\\?react$'] }],
  },
};
