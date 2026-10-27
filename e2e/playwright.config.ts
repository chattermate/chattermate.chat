import { existsSync } from 'node:fs'
import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test'
import { env } from './src/env'
import { storageStatePath } from './src/org-state'

const isCI = !!process.env.CI
// Reuse a stack already started with `./scripts/stack.sh up` — locally for fast
// reruns, and on CI, which starts it first so every service logs to e2e/.stack/.
const reuse = true
const enterprise = env.edition === 'enterprise'
if (enterprise && !existsSync(env.enterpriseSpecDir)) {
  throw new Error(`E2E_EDITION=enterprise but ${env.enterpriseSpecDir} is missing — check out the enterprise_frontend submodule`)
}

const signedInAsAdmin = { ...devices['Desktop Chrome'], storageState: storageStatePath('admin') }
const ORG_WIDE = /\.org\.spec\.ts$/
// Tests that need a capability the stack they run on leaves off: Redis, or a
// single backend worker (socket.io polling isn't sticky across several).
const unsupported = [env.redis ? null : /@redis/, env.multiWorker ? /@one-worker/ : null].filter((tag): tag is RegExp => tag !== null)
// Screenshot baselines are Linux-only (generated in CI); they run in their own project.
const VISUAL = /visual\/.*\.spec\.ts$/
const NOT_DEFAULT = [ORG_WIDE, VISUAL]

/**
 * Nightly only (E2E_MORE_BROWSERS=1): the customer-facing widget on the other
 * engines and on phones. The dashboard stays Chromium-only.
 */
const otherBrowsers: PlaywrightTestConfig['projects'] = process.env.E2E_MORE_BROWSERS
  ? [
      ['widget-firefox', devices['Desktop Firefox']],
      ['widget-webkit', devices['Desktop Safari']],
      ['widget-android', devices['Pixel 7']],
      ['widget-iphone', devices['iPhone 14']],
    ].map(([name, device]) => ({
      name: name as string,
      dependencies: ['setup'],
      testIgnore: NOT_DEFAULT,
      grep: /@widget/,
      grepInvert: unsupported,
      use: { ...(device as object), storageState: storageStatePath('admin') },
    }))
  : []

// Both editions share the project names `setup`, `chromium` and `org`, so the same
// commands run either way. Each edition brings its own setup (OSS: first-run form;
// enterprise: signup), and both write the same org contract, so the OSS specs in
// `chromium`/`org` run unchanged against the enterprise stack.
const projects: PlaywrightTestConfig['projects'] = [
  enterprise
    ? { name: 'setup', testDir: env.enterpriseSpecDir, testMatch: /.*\.setup\.ts/ }
    : { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { name: 'chromium', dependencies: ['setup'], testIgnore: NOT_DEFAULT, grepInvert: unsupported, use: signedInAsAdmin },
  // Specs that change org-wide settings (AI config, business hours, …). Run them in a
  // separate invocation with --workers=1 (see package.json "test") so they never race
  // the parallel suite, and are not skipped when an unrelated parallel test fails.
  { name: 'org', dependencies: ['setup'], testMatch: ORG_WIDE, use: signedInAsAdmin },
  ...(enterprise
    ? [
        { name: 'enterprise', testDir: env.enterpriseSpecDir, dependencies: ['setup'], testIgnore: ORG_WIDE, use: signedInAsAdmin },
        { name: 'enterprise-org', testDir: env.enterpriseSpecDir, dependencies: ['setup'], testMatch: ORG_WIDE, use: signedInAsAdmin },
      ]
    : []),
  // Widget screenshots, light and dark. Baselines live next to the specs, Linux only.
  { name: 'visual', dependencies: ['setup'], testMatch: VISUAL, use: signedInAsAdmin },
  ...otherBrowsers,
]

const service = (name: string, url: string, timeout: number) => ({
  name,
  command: `./scripts/stack.sh ${name}`,
  url,
  reuseExistingServer: reuse,
  timeout,
})

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: env.frontendUrl,
    // Every failure, including the first attempt, keeps its trace.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // The dashboard is a PWA; a service worker caching across tests only adds flake.
    serviceWorkers: 'block',
    // The widget launcher floats forever; with reduced motion (which the loader honours)
    // it holds still, so clicks don't wait on an element that is never "stable".
    contextOptions: { reducedMotion: 'reduce' },
    // CI browsers run in UTC; pin it so a local run behaves the same.
    timezoneId: 'UTC',
  },

  projects,

  webServer: [
    service('fake-llm', `${env.fakeLlmUrl}/health`, 30_000),
    service('fake-externals', `${env.fakeExternalsUrl}/health`, 30_000),
    service('fake-mcp', `${env.fakeMcpUrl}/health`, 30_000),
    service('fake-sso', `${env.fakeSsoUrl}/health`, 30_000),
    service('customer-site', `${env.customerSiteUrl}/health`, 30_000),
    service('mail', `${env.mailUrl}/livez`, 30_000),
    service('backend', `${env.backendUrl}/health`, 180_000),
    service('frontend', `${env.frontendUrl}/config.js`, 300_000),
  ],
})
