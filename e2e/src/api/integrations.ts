import { createHmac } from 'node:crypto'
import { request } from '@playwright/test'
import { ApiClient, NO_COOKIES } from './client'
import { env } from '../env'

// Jira and Shopify connect once per org (`*.org.spec.ts`); both reach the recording
// fake through JIRA_*_BASE / SHOPIFY_ADMIN_BASE in .env.e2e.

/** The project and issue type the fake Jira site has (services/fake-externals). */
export const fakeJira = { projectKey: 'SUP', taskTypeId: '10001' } as const

/**
 * Connects Jira through its OAuth callback: /authorize hands out a state, Atlassian
 * sends the browser back to /callback with a code, and the backend trades it for a
 * token and the site (the fake derives both from the code).
 */
export async function connectJira(api: ApiClient, code: string): Promise<void> {
  const authorize = await api.raw('GET', '/jira/authorize', { maxRedirects: 0 })
  const state = new URL(authorize.headers().location ?? 'about:blank').searchParams.get('state')
  if (!state) throw new Error(`Jira authorize → ${authorize.status()}: ${await authorize.text()}`)
  const callback = await api.raw('GET', '/jira/callback', { params: { code, state }, maxRedirects: 0 })
  const location = callback.headers().location ?? ''
  if (!location.includes('status=success')) throw new Error(`Jira callback → ${location || callback.status()}`)
}

export async function disconnectJira(api: ApiClient): Promise<void> {
  await api.raw('DELETE', '/jira/disconnect')
}

/** The agent files Jira issues into the fake site's Support project, as Tasks. */
export async function routeTicketsToJira(api: ApiClient, agentId: string): Promise<void> {
  await api.post(`/jira/agent-config/${agentId}`, { data: { enabled: true, projectKey: fakeJira.projectKey, issueTypeId: fakeJira.taskTypeId } })
}

/** An HS256 session token, as Shopify's admin hands the embedded app. */
function shopifySessionToken(shopDomain: string): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const claims = encode({
    iss: `https://${shopDomain}/admin`, dest: `https://${shopDomain}`, aud: env.shopifyApp.key,
    sub: '1', exp: now + 60, nbf: now - 5, iat: now, jti: `${shopDomain}-${now}`,
  })
  const signature = createHmac('sha256', env.shopifyApp.secret).update(`${header}.${claims}`).digest('base64url')
  return `${header}.${claims}.${signature}`
}

/**
 * The app opened inside `shopDomain`'s admin, before anyone links it to an
 * account: the session token is traded for an offline token. Returns the shop's
 * id and a client calling as the embedded app (session token, no sign-in).
 */
export async function openShopifyApp(shopDomain: string): Promise<{ shopId: string; embedded: ApiClient }> {
  // The embedded app lives in Shopify admin's iframe, which never has the
  // dashboard's sign-in cookies, so it gets a cookie jar of its own.
  const embedded = new ApiClient(await request.newContext(NO_COOKIES), shopifySessionToken(shopDomain))
  const { shop_id: shopId } = await embedded.post<{ shop_id: string }>('/shopify/exchange-token')
  return { shopId, embedded }
}

/**
 * Installs the app on `shopDomain` (*.myshopify.com) and links the shop to the
 * admin's org, as the embedded app does: the app is opened, then the signed-in
 * admin claims the shop. Remove it with `uninstallShopify`.
 */
export async function installShopify(api: ApiClient, shopDomain: string): Promise<string> {
  const { shopId } = await openShopifyApp(shopDomain)
  await api.post('/shopify/link-organization', { data: { shop_id: shopId } })
  return shopId
}

export async function uninstallShopify(api: ApiClient, shopId: string, orgId: string, orgDomain: string): Promise<void> {
  await api.raw('DELETE', `/shopify/shops/${shopId}`)
  await api.patch(`/organizations/${orgId}`, { data: { domain: orgDomain } })
}

/** The agent answers order questions from this shop. */
export async function useShopForAgent(api: ApiClient, agentId: string, shopId: string): Promise<void> {
  await api.post(`/shopify/agent-config/${agentId}`, { data: { enabled: true, shop_id: shopId } })
}

/**
 * A storefront form posted through Shopify's App Proxy (/apps/chattermate/<action>):
 * Shopify signs the query with the app's secret before forwarding it. Returns the
 * status and the JSON the storefront gets back.
 */
export async function storefrontAction(shopDomain: string, action: string, fields: object): Promise<{ status: number; body: Record<string, unknown> }> {
  const context = await request.newContext(NO_COOKIES)
  try {
    const response = await context.post(`${env.apiUrl}/shopify/proxy/${action}`, { params: proxySigned(shopDomain, {}), data: fields })
    return { status: response.status(), body: await response.json() }
  } finally {
    await context.dispose()
  }
}

/**
 * Opens a storefront page under the App Proxy (`https://<store>/apps/chattermate/…`,
 * as an email links to it) the way Shopify forwards it: its query plus Shopify's
 * signed parameters. Returns the status and the HTML.
 */
export async function openStorefrontPage(shopDomain: string, link: string, method: 'GET' | 'POST' = 'GET'): Promise<{ status: number; html: string }> {
  const url = new URL(link)
  const prefix = '/apps/chattermate/'
  if (!url.pathname.startsWith(prefix)) throw new Error(`not an App Proxy page: ${link}`)
  const params = proxySigned(shopDomain, Object.fromEntries(url.searchParams))
  const context = await request.newContext(NO_COOKIES)
  try {
    const response = await context.fetch(`${env.apiUrl}/shopify/proxy/${url.pathname.slice(prefix.length)}`, { method, params })
    return { status: response.status(), html: await response.text() }
  } finally {
    await context.dispose()
  }
}

/** `query` plus the parameters Shopify adds when it forwards a storefront request, signed with the app's secret. */
function proxySigned(shopDomain: string, query: Record<string, string>): Record<string, string> {
  const params: Record<string, string> = {
    ...query, shop: shopDomain, path_prefix: '/apps/chattermate', logged_in_customer_id: '',
    timestamp: String(Math.floor(Date.now() / 1000)),
  }
  // Shopify's App Proxy signature: the parameters as sorted key=value strings, joined with nothing
  const message = Object.entries(params).map(([key, value]) => `${key}=${value}`).sort().join('')
  return { ...params, signature: createHmac('sha256', env.shopifyApp.secret).update(message).digest('hex') }
}

/** Every item of `shopDomain` is on sale again in the fake Shopify (a restock). */
export async function putBackOnSale(shopDomain: string): Promise<void> {
  const context = await request.newContext()
  try {
    const response = await context.put(`${env.fakeExternalsUrl}/__shopify/back-on-sale/${shopDomain}`)
    if (!response.ok()) throw new Error(`back on sale → ${response.status()}`)
  } finally {
    await context.dispose()
  }
}
