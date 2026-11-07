// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Generated code (API types, GraphQL codegen) is not hand-written: don't lint it.
    ignores: ['dist/*', '**/generated.ts'],
  },
]);
