// A recording stand-in for the third-party APIs the backend calls on its own:
// Telegram, Meta Graph (WhatsApp / Messenger / Instagram), Slack, LINE, SMS
// providers, HubSpot, Pipedrive, Jira, Shopify. The backend reaches it through the *_API_BASE overrides in
// .env.e2e (see backend/app/core/external_urls.py); each provider is a path prefix.
//
// Every request is recorded (method, path, query, headers, body, the answer) and
// answered like the provider would:
//   - the smallest success the adapter accepts, by default;
//   - the provider's own rejection when a payload breaks its published limits
//     (limits.ts), so a backend that drifts past a real limit fails here too;
//   - a scripted answer — a failure, or a reply for a provider with no built-in
//     answers — while one the test registered matches (PUT /__faults).
// Tests then assert on what the backend sent ("the bot replied on Telegram with …")
// and read values the provider would have learned, such as the webhook secret
// Telegram receives in setWebhook.
//
// Where a provider tells the backend who the account is, the answer is derived
// from what the test sent, so every test gets its own account:
//   Meta tokens `owns:<id>[,<id>…]:<anything>`   own those nodes (pages, numbers, IG
//                                              accounts). Graph refuses such a token a
//                                              node another token owns, and debug_token
//                                              reports its first id as the page
//   Meta tokens `…:app=<id>.<secret>:…`          were issued by the customer's own Meta
//                                              app: GET /app answers that id and checks
//                                              appsecret_proof against that secret (any
//                                              other token is ChatterMate's app)
//   Meta POST /<number> {webhook_configuration}  verifies the override callback the way
//                                              Meta does — a GET with hub.verify_token
//                                              that must echo hub.challenge — before
//                                              accepting it
//   Meta GET /<node>       id = <node>
//   LINE GET /info         userId derived from the channel access token
//   Slack oauth.v2.access  team id and bot token derived from the OAuth code
//   HubSpot oauth/v1/token  an access token derived from the code; introspecting it
//                           (oauth/v1/access-tokens/<token>) gives a hub id from it
//   Pipedrive oauth/token   tokens derived from the code, and this fake as the
//                           company's api_domain; users/me gives a company id
//                           derived from the token
//   Jira authorize          consent granted at once: redirects to redirect_uri with a
//                           fresh code and the state; the token is derived from the
//                           code and accessible-resources gives a site derived from it
//   Shopify orders          the customer's order with the number they searched for
//                           (#1001 if none), shipped with a tracking number
//
// A call's `action` is the provider's method (Telegram, Slack) or else the last
// non-empty path segment (`/Account/<id>/Message/` → `Message`).
//
// Control API (src/fakes/externals.ts):
//   GET    /__calls?provider=&action=&contains=&since=   recorded calls, oldest first;
//                                                        contains = substring of path or body
//   DELETE /__calls                                       forget every call
//   PUT    /__faults/:id   { provider, action?, contains?, status, body?, times? }
//   DELETE /__faults/:id
//
// Run: node services/fake-externals/server.ts --port 14020

import { createHash, createHmac } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { rejection } from './limits.ts'

export interface RecordedCall {
  at: string
  provider: string
  /** Provider-level operation: Telegram/Slack method name, else the last path segment. */
  action: string
  method: string
  path: string
  query: Record<string, string>
  /** Lower-cased request headers — e.g. authorization, to tell which account sent it. */
  headers: Record<string, string>
  body: unknown
  /** HTTP status the fake answered with. */
  status: number
  /** What the fake answered — e.g. the message_id Telegram assigned. */
  response: unknown
}

export interface Fault {
  provider: string
  action?: string
  /** Only calls whose path or body contains this — scope a fault to one test's account or customer. */
  contains?: string
  status: number
  body?: unknown
  /** How many matching calls fail; omitted = until the fault is deleted. */
  times?: number
}

const MAX_CALLS = 5000
const calls: RecordedCall[] = []
const faults = new Map<string, Fault>()
/** Every node some `owns:` token has claimed — what other tokens are refused. */
const claimed = new Set<string>()
let counter = 0

class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  if (status === 204) {
    res.writeHead(status, headers)
    res.end()
    return
  }
  res.writeHead(status, { 'content-type': 'application/json', ...headers })
  res.end(JSON.stringify(body))
}

async function readRaw(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

function parseBody(raw: string, contentType: string): unknown {
  if (!raw) return null
  if (contentType.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(raw))
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/** A stable numeric id per bot token, so reconnecting the same token finds the same bot. */
function botIdFor(token: string): number {
  return parseInt(digest(token).slice(0, 10), 16)
}

function bearer(headers: Record<string, string>): string {
  return (headers.authorization ?? '').replace(/^Bearer\s+/i, '')
}

// ---------- per-provider answers ----------

interface Call {
  provider: string
  /** Where the backend reached this fake, e.g. http://127.0.0.1:14020. */
  origin: string
  action: string
  method: string
  url: URL
  headers: Record<string, string>
  body: Record<string, unknown> | null
}

interface Answer {
  status: number
  body: unknown
  headers?: Record<string, string>
}

const ok = (body: unknown): Answer => ({ status: 200, body })

function telegram(action: string, token: string, body: Record<string, unknown> | null): Answer {
  switch (action) {
    case 'getMe': {
      const id = botIdFor(token)
      return ok({ ok: true, result: { id, is_bot: true, first_name: 'E2E Bot', username: `e2e_bot_${id}` } })
    }
    case 'sendMessage':
      return ok({ ok: true, result: { message_id: counter, date: Math.floor(Date.now() / 1000), chat: { id: body?.chat_id }, text: body?.text } })
    default:
      // setWebhook, deleteWebhook, sendChatAction, answerCallbackQuery, editMessageReplyMarkup, …
      return ok({ ok: true, result: true })
  }
}

/** The node ids a Meta token owns, or null for a token that makes no claim. */
function ownedNodes(token: string): string[] | null {
  const match = /^owns:([^:]+):/.exec(token)
  if (!match) return null
  const nodes = match[1].split(',')
  for (const node of nodes) claimed.add(node)
  return nodes
}

function graphError(message: string, code = 100): Answer {
  return { status: 400, body: { error: { message, type: 'OAuthException', code, fbtrace_id: 'e2e' } } }
}

/** ChatterMate's own Meta app; its secret mirrors META_APP_SECRET in .env.e2e. */
const CHATTERMATE_APP = { id: 'e2e-chattermate-app', secret: 'e2e-meta-app-secret' }

/** The Meta app that issued a token. */
function appOf(token: string): { id: string; secret: string } {
  const match = /:app=([^.:]+)\.([^:]+)/.exec(token)
  return match ? { id: match[1], secret: match[2] } : CHATTERMATE_APP
}

/** Meta checks an override callback before taking it: the GET must echo the challenge. */
async function overrideCallback(config: Record<string, unknown>): Promise<Answer> {
  const uri = String(config.override_callback_uri ?? '')
  if (!uri) return ok({ success: true }) // back to the app's own callback
  const challenge = `e2e-challenge-${counter}`
  const query = new URLSearchParams({ 'hub.mode': 'subscribe', 'hub.verify_token': String(config.verify_token ?? ''), 'hub.challenge': challenge })
  const check = await fetch(`${uri}?${query}`, { signal: AbortSignal.timeout(5_000) }).catch(() => null)
  if (!check || (await check.text()) !== challenge) {
    return graphError('The callback URL or verify token couldn\'t be validated. Please verify the provided information or try again later.', 2200)
  }
  return ok({ success: true })
}

async function graph({ action, method, url, headers, body }: Call): Promise<Answer> {
  if (action === 'app' && method === 'GET') {
    const token = bearer(headers)
    const app = appOf(token)
    const proof = url.searchParams.get('appsecret_proof')
    if (proof !== null && proof !== createHmac('sha256', app.secret).update(token).digest('hex')) {
      return graphError('Invalid appsecret_proof provided in the API argument')
    }
    return ok({ id: app.id, name: `E2E app ${app.id}` })
  }
  if (action === 'debug_token') {
    const inspected = ownedNodes(url.searchParams.get('input_token') ?? '')
    return ok({ data: { is_valid: Boolean(inspected), type: 'PAGE', profile_id: inspected?.[0] ?? '' } })
  }
  // `/<provider>/v21.0/<node>[/<edge>]`. A token can't reach a page, number or IG
  // account another token owns; anything unclaimed (a customer's PSID, `me`) is fine.
  const owned = ownedNodes(bearer(headers))
  const node = url.pathname.split('/').filter(Boolean)[2] ?? ''
  if (owned && claimed.has(node) && !owned.includes(node)) {
    return graphError(`Unsupported request - object with ID '${node}' does not exist, cannot be loaded due to missing permissions, or does not support this operation`)
  }
  const webhookConfiguration = body?.webhook_configuration
  if (method === 'POST' && webhookConfiguration && typeof webhookConfiguration === 'object') {
    return overrideCallback(webhookConfiguration as Record<string, unknown>)
  }
  if (method !== 'GET') {
    return ok({ messages: [{ id: `wamid.e2e.${counter}` }], message_id: `m_e2e_${counter}`, recipient_id: body?.recipient ?? null, success: true })
  }
  return ok({ id: action, name: `E2E ${action}`, username: `e2e_${action}`, data: [] })
}

function answer(call: Call): Answer | Promise<Answer> {
  const { provider, action, headers, body } = call
  switch (provider) {
    case 'graph':
    case 'graph-instagram':
      return graph(call)
    case 'slack':
      if (action === 'oauth.v2.access') {
        const code = String(body?.code ?? '')
        return ok({ ok: true, access_token: `xoxb-e2e-${digest(code).slice(0, 12)}`, bot_user_id: 'U0E2EBOT', team: { id: `T${digest(code).slice(0, 10).toUpperCase()}`, name: 'E2E Workspace' } })
      }
      return ok({ ok: true, ts: `${Math.floor(Date.now() / 1000)}.${String(counter).padStart(6, '0')}`, channel: body?.channel ?? 'C0E2E' })
    case 'line':
      // GET /info is the bot's own profile; everything else (push, webhook endpoint) answers an empty 200.
      return ok(action === 'info' ? { userId: `U${digest(bearer(headers)).slice(0, 32)}`, displayName: 'E2E LINE Bot', basicId: '@e2e' } : {})
    case 'twilio':
      return ok({ sid: `SM${String(counter).padStart(32, '0')}`, status: 'queued' })
    case 'plivo':
      return ok({ message_uuid: [`e2e-${counter}`], api_id: `e2e-${counter}` })
    case 'hubspot':
      return hubspot(call)
    case 'pipedrive-oauth':
      return pipedriveOauth(call)
    case 'pipedrive':
      return pipedrive(call)
    case 'jira-auth':
      return jiraAuth(call)
    case 'jira':
      return jira(call)
    case 'shopify':
      return shopify(call)
    default:
      return ok({})
  }
}

function hubspot({ method, url, body }: Call): Answer {
  const path = url.pathname
  if (path.endsWith('/oauth/v1/token')) {
    const seed = String(body?.code ?? body?.refresh_token ?? '')
    return ok({ access_token: `hs-${digest(seed).slice(0, 16)}`, refresh_token: `hs-refresh-${digest(seed).slice(0, 8)}`, expires_in: 1800, token_type: 'bearer' })
  }
  const introspected = /\/oauth\/v1\/access-tokens\/([^/]+)$/.exec(path)
  if (introspected) return ok({ hub_id: parseInt(digest(introspected[1]).slice(0, 7), 16), hub_domain: 'e2e.hubspot.com', token: introspected[1] })
  if (path.endsWith('/contacts/batch/upsert')) return ok({ status: 'COMPLETE', results: [{ id: String(counter), new: true }] })
  return ok(method === 'GET' ? { results: [] } : { id: String(counter) })
}

/** Insert-ordered, so the oldest entry goes first once a map outgrows `max`. */
function remember<V>(map: Map<string, V>, key: string, value: V, max = 1000) {
  map.set(key, value)
  if (map.size > max) map.delete(map.keys().next().value as string)
}

// Pipedrive: OAuth on pipedrive-oauth (oauth.pipedrive.com); the API on the
// company's own host, which the token response names — here, this fake.

/** Consent granted at once: back to the app with a fresh code and the state. */
function consentRedirect(url: URL): Answer {
  const redirect = url.searchParams.get('redirect_uri')
  if (!redirect) return { status: 400, body: { error: 'invalid_request', error_description: 'redirect_uri is required' } }
  const back = new URL(redirect)
  back.searchParams.set('code', `code-${counter}`)
  back.searchParams.set('state', url.searchParams.get('state') ?? '')
  return { status: 302, body: {}, headers: { location: back.toString() } }
}

function pipedriveOauth({ action, url, origin, body }: Call): Answer {
  if (action === 'authorize') return consentRedirect(url)
  if (action === 'revoke') return ok({})
  const seed = String(body?.code ?? body?.refresh_token ?? '')
  return ok({
    access_token: `pd-${digest(seed).slice(0, 16)}`, refresh_token: `pd-refresh-${digest(seed).slice(0, 8)}`,
    token_type: 'Bearer', expires_in: 3600, scope: 'base,contacts:full,leads:full', api_domain: `${origin}/pipedrive`,
  })
}

function pipedrive({ method, url, headers, body }: Call): Answer {
  const path = url.pathname.replace(/^\/pipedrive/, '')
  if (path === '/api/v1/users/me') {
    return ok({ success: true, data: { id: 1, company_id: parseInt(digest(bearer(headers)).slice(0, 7), 16), company_name: 'E2E Pipedrive Co' } })
  }
  // Nothing exists yet: searches find nobody, and every create gets a fresh id.
  if (path.endsWith('/search')) return ok({ success: true, data: { items: [] } })
  if (path === '/api/v1/leads' && method === 'GET') return ok({ success: true, data: [] })
  if (method === 'POST' && path === '/api/v1/leads') return ok({ success: true, data: { id: `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`, title: body?.title } })
  if (method === 'POST' || method === 'PATCH') return ok({ success: true, data: { id: counter, ...(body ?? {}) } })
  return { status: 404, body: { success: false, error: `e2e fake has no answer for ${method} ${path}` } }
}

// Jira Cloud: OAuth on jira-auth (auth.atlassian.com), the REST API on jira (api.atlassian.com).

function jiraAuth({ action, url, body }: Call): Answer {
  if (action === 'authorize') return consentRedirect(url)
  // oauth/token, for both the code grant and a refresh.
  const seed = String(body?.code ?? body?.refresh_token ?? '')
  return ok({ access_token: `jira-${digest(seed).slice(0, 16)}`, refresh_token: `jira-refresh-${digest(seed).slice(0, 8)}`, token_type: 'Bearer', expires_in: 3600, scope: 'read:jira-work write:jira-work read:jira-user offline_access' })
}

const JIRA_PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'].map((name, i) => ({ id: String(i + 1), name }))
const JIRA_ISSUE_TYPES = [
  { id: '10001', name: 'Task', subtask: false, description: 'A small, distinct piece of work.' },
  { id: '10002', name: 'Sub-task', subtask: true, description: 'A part of a task.' },
]
const jiraIssues = new Map<string, { key: string; fields: Record<string, unknown> }>()

function jiraNotFound(message: string): Answer {
  return { status: 404, body: { errorMessages: [message], errors: {} } }
}

function jira({ method, url, headers, body }: Call): Answer {
  if (url.pathname.endsWith('/oauth/token/accessible-resources')) {
    const site = digest(bearer(headers)).slice(0, 12)
    return ok([{ id: `cloud-${site}`, url: `https://e2e-${site}.atlassian.net`, name: `e2e-${site}`, scopes: ['read:jira-work', 'write:jira-work'], avatarUrl: '' }])
  }
  // /jira/ex/jira/<cloud id>/rest/api/3/<resource>
  const resource = /\/ex\/jira\/[^/]+\/rest\/api\/3\/(.+)$/.exec(url.pathname)?.[1] ?? ''
  if (resource === 'project') return ok([{ id: '10000', key: 'SUP', name: 'Support' }])
  if (resource.startsWith('project/')) return ok({ id: '10000', key: resource.slice('project/'.length), name: 'Support', issueTypes: JIRA_ISSUE_TYPES })
  if (resource === 'priority') return ok(JIRA_PRIORITIES)
  if (resource === 'issue/createmeta') {
    return ok({ projects: [{ key: url.searchParams.get('projectKeys'), issuetypes: [{ id: url.searchParams.get('issuetypeIds'), fields: { summary: {}, description: {}, priority: {} } }] }] })
  }
  if (resource === 'issue' && method === 'POST') {
    const fields = (body?.fields ?? {}) as { project?: { key?: string } }
    const key = `${fields.project?.key ?? 'SUP'}-${counter}`
    remember(jiraIssues, key, { key, fields: { ...fields, status: { name: 'To Do' } } })
    return { status: 201, body: { id: String(counter), key, self: `${url.origin}${url.pathname}/${counter}` } }
  }
  const issueKey = /^issue\/([^/]+)$/.exec(resource)?.[1]
  if (issueKey) {
    const issue = jiraIssues.get(issueKey)
    if (!issue) return jiraNotFound('Issue does not exist or you do not have permission to see it.')
    if (method === 'PUT') {
      Object.assign(issue.fields, (body?.fields ?? {}) as Record<string, unknown>)
      return { status: 204, body: null }
    }
    return ok({ id: issueKey, ...issue })
  }
  return jiraNotFound(`e2e fake has no answer for ${method} ${resource}`)
}

// Shopify Admin API: /shopify/<shop>.myshopify.com/admin/...

interface ShopifyOrder { id: string; number: string; email: string }
const shopifyOrders = new Map<string, ShopifyOrder>()

function money(amount: string) {
  return { shopMoney: { amount, currencyCode: 'USD' } }
}

function shopifyOrderNode(order: ShopifyOrder) {
  return {
    id: `gid://shopify/Order/${order.id}`,
    name: `#${order.number}`,
    email: order.email,
    phone: null,
    createdAt: '2026-10-01T10:00:00Z',
    processedAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z',
    cancelledAt: null,
    cancelReason: null,
    displayFinancialStatus: 'PAID',
    displayFulfillmentStatus: 'FULFILLED',
    subtotalLineItemsQuantity: 1,
    currentSubtotalPriceSet: money('40.00'),
    currentTotalPriceSet: money('45.00'),
    originalTotalPriceSet: money('45.00'),
    customer: { id: `gid://shopify/Customer/${order.id}`, firstName: 'E2E', lastName: 'Customer', email: order.email, phone: null },
    shippingAddress: { address1: '1 Test Street', address2: null, city: 'Testville', provinceCode: 'CA', zip: '94000', country: 'United States', phone: null, name: 'E2E Customer' },
    fulfillments: [{ status: 'SUCCESS', trackingInfo: [{ company: 'UPS', number: `1ZE2E${order.id}`, url: `https://tracking.e2e.test/1ZE2E${order.id}` }] }],
    lineItems: { edges: [{ node: { id: `gid://shopify/LineItem/${order.id}`, title: 'E2E Mug', name: 'E2E Mug', quantity: 1, originalUnitPriceSet: money('40.00'), variant: { id: 'gid://shopify/ProductVariant/1', title: 'Default', sku: 'E2E-MUG', image: null } } }] },
  }
}

function shopify({ action, body }: Call): Answer {
  if (action === 'access_token') {
    // Code grant, session/legacy-token exchange, or refresh grant; `expiring=1`
    // asks for an expiring offline token (1h access, 90d rotating refresh).
    const seed = String(body?.subject_token ?? body?.code ?? body?.refresh_token ?? '')
    const token = { access_token: `shpat_${digest(seed).slice(0, 24)}`, scope: 'read_orders,read_products' }
    if (String(body?.expiring) !== '1' && body?.grant_type !== 'refresh_token') return ok(token)
    return ok({ ...token, expires_in: 3600, refresh_token: `shprt_${digest(`refresh:${seed}`).slice(0, 24)}`, refresh_token_expires_in: 7776000 })
  }
  const query = String(body?.query ?? '')
  const variables = (body?.variables ?? {}) as Record<string, unknown>
  if (query.includes('query SearchOrders')) {
    // `email:<email>[ AND name:<number>]`, as the backend builds it.
    const search = String(variables.query ?? '')
    const email = /email:(\S+)/.exec(search)?.[1] ?? ''
    const number = /name:(\S+)/.exec(search)?.[1] ?? '1001'
    const order = { id: String(parseInt(digest(`${email}#${number}`).slice(0, 8), 16)), number, email }
    remember(shopifyOrders, order.id, order)
    return ok({ data: { orders: { edges: email ? [{ node: shopifyOrderNode(order) }] : [], pageInfo: { hasNextPage: false, endCursor: null } } } })
  }
  if (query.includes('query GetOrder')) {
    const order = shopifyOrders.get(String(variables.id ?? '').split('/').at(-1) ?? '')
    return ok({ data: { order: order ? shopifyOrderNode(order) : null } })
  }
  return ok({ errors: [{ message: 'e2e fake has no answer for this query' }] })
}

/** How each provider says "bad request", so the backend's error handling sees the real shape. */
function providerRejection(provider: string, message: string): Answer {
  switch (provider) {
    case 'graph':
    case 'graph-instagram': return graphError(message)
    case 'telegram': return { status: 400, body: { ok: false, error_code: 400, description: `Bad Request: ${message}` } }
    case 'slack': return ok({ ok: false, error: 'msg_too_long', detail: message })
    case 'twilio': return { status: 400, body: { code: 21617, message, status: 400 } }
    default: return { status: 400, body: { message, error: message } }
  }
}

// ---------- faults ----------

function matchingFault(provider: string, action: string, haystack: string): Fault | undefined {
  for (const [id, fault] of faults) {
    if (fault.provider !== provider) continue
    if (fault.action && fault.action !== action) continue
    if (fault.contains && !haystack.includes(fault.contains)) continue
    if (fault.times !== undefined) {
      fault.times -= 1
      if (fault.times <= 0) faults.delete(id)
    }
    return fault
  }
  return undefined
}

// ---------- http ----------

async function route(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://fake-externals')
  const path = url.pathname

  if (path === '/health') return send(res, 200, { status: 'ok', calls: calls.length, faults: faults.size })
  if (path === '/__calls' && req.method === 'GET') {
    const q = url.searchParams
    const since = q.get('since')
    const contains = q.get('contains')
    return send(res, 200, calls.filter((c) =>
      (!q.get('provider') || c.provider === q.get('provider'))
      && (!q.get('action') || c.action === q.get('action'))
      && (!since || c.at >= since)
      && (!contains || `${c.path}\n${JSON.stringify(c.body)}`.includes(contains))))
  }
  if (path === '/__calls' && req.method === 'DELETE') {
    calls.length = 0
    return send(res, 200, { ok: true })
  }
  const faultPath = /^\/__faults\/([\w.-]+)$/.exec(path)
  if (faultPath && req.method === 'PUT') {
    const fault = parseBody(await readRaw(req), 'application/json') as Fault | null
    if (!fault?.provider || !fault.status) throw new HttpError(400, 'a fault needs provider and status')
    faults.set(faultPath[1], fault)
    return send(res, 200, { ok: true })
  }
  if (faultPath && req.method === 'DELETE') {
    faults.delete(faultPath[1])
    return send(res, 200, { ok: true })
  }

  const [, provider = '', ...rest] = path.split('/')
  const raw = await readRaw(req)
  const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v ?? '']))
  const body = parseBody(raw, headers['content-type'] ?? '') as Record<string, unknown> | null
  const method = req.method ?? 'GET'
  counter += 1

  let action = rest.filter(Boolean).at(-1) ?? ''
  let token = ''
  if (provider === 'telegram') {
    // /telegram/bot<token>/<method>
    token = (rest[0] ?? '').replace(/^bot/, '')
    action = rest[1] ?? ''
  }

  const fault = matchingFault(provider, action, `${path}\n${raw}`)
  const rejected = fault ? null : rejection(provider, action, method, body)
  let result: Answer
  if (fault) result = { status: fault.status, body: fault.body ?? {} }
  else if (rejected) result = providerRejection(provider, rejected)
  else if (provider === 'telegram') result = telegram(action, token, body)
  else result = await answer({ provider, origin: `http://${headers.host ?? '127.0.0.1'}`, action, method, url, headers, body })

  calls.push({
    at: new Date().toISOString(),
    provider, action, method, path,
    query: Object.fromEntries(url.searchParams),
    headers, body,
    status: result.status,
    response: result.body,
  })
  if (calls.length > MAX_CALLS) calls.splice(0, calls.length - MAX_CALLS)
  return send(res, result.status, result.body, result.headers)
}

const portArg = process.argv.indexOf('--port')
const port = Number(portArg > -1 ? process.argv[portArg + 1] : 14020)

createServer((req, res) => {
  route(req, res).catch((err: unknown) => {
    const status = err instanceof HttpError ? err.status : 500
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[fake-externals] ${req.method} ${req.url} -> ${status}: ${message}`)
    send(res, status, { error: message })
  })
}).listen(port, '127.0.0.1', () => console.log(`[fake-externals] listening on http://127.0.0.1:${port}`))
