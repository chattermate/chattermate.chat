import playwright from 'eslint-plugin-playwright'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/', '.cache/', '.stack/', '.auth/', 'src/api/schema.d.ts'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      // A missing await is the classic Playwright flake.
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['specs/**/*.ts', 'src/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      // Steps live in page objects and components, which run inside tests.
      'playwright/no-standalone-expect': 'off',
      // Shared helpers that assert inside count as assertions.
      'playwright/expect-expect': ['error', { assertFunctionNames: ['expect', 'expectUnchanged', 'expectNoNewA11yViolations', 'expectSignedIn'] }],
    },
  },
  {
    // Setup is idempotent by design: create the org on an empty DB, sign in otherwise.
    files: ['specs/setup/**'],
    rules: { 'playwright/no-conditional-in-test': 'off', 'playwright/no-conditional-expect': 'off' },
  },
  {
    // Specs describe behaviour; selectors belong in src/pages and src/components,
    // seeding in src/api. See AUTHORING.md.
    files: ['specs/**/*.ts'],
    ignores: ['specs/setup/**'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: "CallExpression[callee.property.name='locator']", message: 'Selectors belong in a page object or component (src/pages, src/components).' },
        { selector: "CallExpression[callee.property.name=/^(fetch|post|put|patch|delete)$/][callee.object.name='request']", message: 'Seed through src/api, not raw requests.' },
      ],
      'no-restricted-imports': ['error', { paths: [{ name: '@playwright/test', message: "Import from '@e2e' so every spec gets the shared fixtures." }] }],
    },
  },
)
