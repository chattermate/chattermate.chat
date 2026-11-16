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
