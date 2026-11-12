import { fileURLToPath } from 'node:url'

// The ONLY place the suite reads configuration. Ports must match scripts/stack.sh
// and .env.e2e — they are fixed so the stack never collides with a dev setup on
// localhost (different host and ports → its own cookies, DB and Redis).

const backendUrl = 'http://127.0.0.1:18000'

export const env = {
  edition: (process.env.E2E_EDITION ?? 'oss') as 'oss' | 'enterprise',
  /** The stack runs with Redis (scripts/stack.sh E2E_REDIS_URL): dedupe and rate limits are live. */
  redis: Boolean(process.env.E2E_REDIS_URL),
  /** The backend runs several workers (stack.sh E2E_BACKEND_WORKERS); socket.io polling isn't sticky across them. */
  multiWorker: Boolean(process.env.E2E_BACKEND_WORKERS),
  /**
   * The cookieless host the widget frame is served from (stack.sh E2E_WIDGET_FRAME_URL), or
   * null when it is framed on the API's own origin, as a self-host without one runs.
   */
  widgetFrameUrl: (process.env.E2E_WIDGET_FRAME_URL ?? 'http://localhost:18000') || null,
  frontendUrl: 'http://127.0.0.1:15173',
  backendUrl,
  apiUrl: `${backendUrl}/api/v1`,
  fakeLlmUrl: 'http://127.0.0.1:14010',
  /** Recording stand-in for Telegram, Meta, Slack, … (services/fake-externals). */
  fakeExternalsUrl: 'http://127.0.0.1:14020',
  /** A real MCP server with a lookup_order tool (services/fake-mcp). */
  fakeMcpUrl: 'http://127.0.0.1:14030',
  /** Google's and Microsoft's sign-in, for single sign-on (services/fake-sso). */
  fakeSsoUrl: 'http://127.0.0.1:14040',
  /** Mailpit's web/API port (its SMTP side is 127.0.0.1:11025, where .env.e2e sends all mail). */
  mailUrl: 'http://127.0.0.1:18025',
  /** The pretend customer website the widget is embedded on (services/customer-site). */
  customerSiteUrl: 'http://127.0.0.1:13000',
  /** The same pretend site under a second origin, for where-may-it-embed journeys. */
  customerSiteOtherUrl: 'http://localhost:13000',
  /**
   * The same site embedding the last release's loader (srcdoc + cross-origin /data),
   * as a browser that cached it still runs. The only customer-site origin in CORS.
   */
  customerSiteLegacyUrl: 'http://127.0.0.1:13001',
  /** The throwaway database stack.sh manages (same E2E_PG_URL convention). */
  databaseUrl: `${(process.env.E2E_PG_URL ?? `postgresql://${process.env.USER}@127.0.0.1:5432`).replace(/\/$/, '')}/chattermate_e2e`,
  /** The private enterprise suite, present only where the enterprise_frontend submodule is checked out. */
  enterpriseSpecDir: fileURLToPath(new URL('../../frontend/src/modules/enterprise/e2e/', import.meta.url)),
  /** stack.sh, for `stack.sh python …` one-off jobs against the running stack. */
  stackScript: fileURLToPath(new URL('../scripts/stack.sh', import.meta.url)),
  /** Where the setup project writes the org contract (see src/org-state.ts). */
  authDir: fileURLToPath(new URL('../.auth/', import.meta.url)),
  /** App-wide webhook signing secrets; the same values are set in .env.e2e. */
  channelSecrets: {
    meta: 'e2e-meta-app-secret',
    slack: 'e2e-slack-signing-secret',
  },
  /** Signs conversation tokens; the same CONVERSATION_SECRET_KEY is set in .env.e2e. */
  conversationTokenSecret: 'e2e-conversation-secret-not-for-production',
  /** The Shopify app's key and secret, which sign embedded-app session tokens. */
  shopifyApp: { key: 'e2e-shopify-api-key', secret: 'e2e-shopify-api-secret' },
} as const

/**
 * Throwaway credentials for the throwaway e2e database. Passwords satisfy the
 * backend's strength rules; example.com passes the email validators.
 */
export const seedUsers = {
  admin: { name: 'Erin Admin', email: 'admin@e2e.example.com', password: 'E2e-Admin-Passw0rd!' },
  humanAgent: { name: 'Sam Agent', email: 'sam.agent@e2e.example.com', password: 'E2e-Agent-Passw0rd!' },
} as const

export const seedOrg = {
  name: 'E2E Org',
  domain: 'e2e.example.com',
  supportGroup: 'E2E Support',
  llmModel: 'e2e-fake',
} as const
