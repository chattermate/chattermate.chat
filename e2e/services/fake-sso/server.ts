// A stand-in for Google's and Microsoft's OpenID Connect sign-in, for the
// single sign-on journeys. The backend reaches it through GOOGLE_SSO_BASE,
// MICROSOFT_SSO_BASE and MICROSOFT_GRAPH_BASE in .env.e2e (see
// backend/app/core/external_urls.py) and runs its real flow against it:
// discovery, the browser's trip to the sign-in page, the code exchange, and
// the RS256-signed ID token checked against this server's keys.
//
//   GET  /google/.well-known/openid-configuration
//   GET  /microsoft/<tenant>/v2.0/.well-known/openid-configuration
//   GET  /jwks                         the signing key (one, made at startup)
//   GET  /<idp>/authorize              the sign-in page: a form where the test
//                                      says who the account is (src/pages/provider-sign-in.page.ts)
//   POST /<idp>/authorize              Continue → back to redirect_uri with a code;
//                                      Cancel → with error=access_denied
//   POST /<idp>/token                  the code for an ID token, refused (400 invalid_grant)
//                                      unless the code is fresh and the PKCE verifier,
//                                      redirect_uri and client credentials match
//   GET  /graph/v1.0/me/photo/$value   404: the account has no photo
//
// The account id (`sub`, Microsoft's `oid`) is derived from the e-mail address
// unless the form names one, so the same person signing in twice is the same
// account, the way it is at the real providers.
//
// Run: node services/fake-sso/server.ts --port 14040

import { createHash, generateKeyPairSync, randomBytes, sign } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

// The client credentials .env.e2e gives the backend; the token endpoint checks them.
const CLIENTS: Record<string, { id: string; secret: string }> = {
  google: { id: 'e2e-google-client', secret: 'e2e-google-secret' },
  microsoft: { id: 'e2e-microsoft-client', secret: 'e2e-microsoft-secret' },
}
const GOOGLE_ISSUER = 'https://accounts.google.com'
const MICROSOFT_ISSUER = 'https://login.microsoftonline.com/{tenantid}/v2.0'
const KEY_ID = 'e2e-sso-1'
// A work directory, for a Microsoft account whose form leaves Directory blank.
const WORK_TENANT = 'e2e00000-0000-4000-8000-00000000d1d1'

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const publicJwk = { ...publicKey.export({ format: 'jwk' }), kid: KEY_ID, use: 'sig', alg: 'RS256' }

interface Grant {
  idp: string
  claims: Record<string, unknown>
  clientId: string
  redirectUri: string
  challenge: string
  challengeMethod: string
  nonce: string
}

// Codes handed out and not yet exchanged; each works once.
const grants = new Map<string, Grant>()

const base64url = (data: Buffer | string) => Buffer.from(data).toString('base64url')

function signJwt(claims: Record<string, unknown>): string {
  const head = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: KEY_ID }))
  const body = base64url(JSON.stringify(claims))
  return `${head}.${body}.${base64url(sign('RSA-SHA256', Buffer.from(`${head}.${body}`), privateKey))}`
}

const accountId = (idp: string, email: string) => `${idp}-${createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 20)}`

const escape = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

interface Field {
  name: string
  label: string
  type: 'text' | 'checkbox'
  checked?: boolean
}

// What the test can say about the account, per provider (the claims each one sends).
const FIELDS: Record<string, Field[]> = {
  google: [
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'sub', label: 'Account ID', type: 'text' },
    { name: 'email_verified', label: 'Email verified', type: 'checkbox', checked: true },
    { name: 'hd', label: 'Workspace domain', type: 'text' },
  ],
  microsoft: [
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'oid', label: 'Account ID', type: 'text' },
    { name: 'tid', label: 'Directory', type: 'text' },
    { name: 'xms_edov', label: 'Domain verified by Microsoft', type: 'checkbox' },
  ],
}

function signInPage(idp: string, query: URLSearchParams): string {
  const carried = [...query].map(([k, v]) => `<input type="hidden" name="q_${escape(k)}" value="${escape(v)}">`).join('')
  const fields = FIELDS[idp].map((f) => f.type === 'checkbox'
    ? `<p><label><input type="checkbox" name="${f.name}" value="true"${f.checked ? ' checked' : ''}> ${f.label}</label></p>`
    : `<p><label>${f.label} <input name="${f.name}"></label></p>`).join('')
  const title = idp === 'google' ? 'Sign in with Google' : 'Sign in to Microsoft'
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head>
<body><main><h1>${title}</h1><form method="post">${carried}${fields}
<button type="submit" name="action" value="continue">Continue</button>
<button type="submit" name="action" value="cancel">Cancel</button></form></main></body></html>`
}

async function readBody(req: IncomingMessage): Promise<URLSearchParams> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return new URLSearchParams(Buffer.concat(chunks).toString('utf8'))
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

function redirect(res: ServerResponse, to: string, params: Record<string, string>) {
  const url = new URL(to)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  res.writeHead(302, { location: url.toString() })
  res.end()
}

function discovery(idp: string, issuer: string, origin: string) {
  return {
    issuer,
    authorization_endpoint: `${origin}/${idp}/authorize`,
    token_endpoint: `${origin}/${idp}/token`,
    jwks_uri: `${origin}/jwks`,
    response_types_supported: ['code'],
    id_token_signing_alg_values_supported: ['RS256'],
    code_challenge_methods_supported: ['S256'],
  }
}

// Claims from the submitted form: blanks left out, as the providers leave out what an account lacks.
function claimsFrom(idp: string, form: URLSearchParams): Record<string, unknown> {
  const claims: Record<string, unknown> = {}
  for (const field of FIELDS[idp]) {
    const value = (form.get(field.name) ?? '').trim()
    if (field.type === 'checkbox') claims[field.name] = value === 'true'
    else if (value) claims[field.name] = value
  }
  const email = String(claims.email ?? '')
  const idClaim = idp === 'google' ? 'sub' : 'oid'
  claims[idClaim] ??= accountId(idp, email || randomBytes(8).toString('hex'))
  if (idp === 'microsoft') {
    claims.tid ??= WORK_TENANT
    // Microsoft's `sub` differs per app registration; the backend links by `oid`.
    claims.sub = `pairwise-${claims.oid}`
  }
  return claims
}

function clientOf(req: IncomingMessage, form: URLSearchParams): { id: string; secret: string } {
  const basic = /^Basic (.+)$/.exec(req.headers.authorization ?? '')
  if (basic) {
    const [id, secret] = Buffer.from(basic[1], 'base64').toString('utf8').split(':').map(decodeURIComponent)
    return { id, secret }
  }
  return { id: form.get('client_id') ?? '', secret: form.get('client_secret') ?? '' }
}

function exchange(idp: string, req: IncomingMessage, form: URLSearchParams): { status: number; body: unknown } {
  const code = form.get('code') ?? ''
  const grant = grants.get(code)
  grants.delete(code)
  const client = clientOf(req, form)
  const verifier = form.get('code_verifier') ?? ''
  const problems = [
    !grant && 'unknown or used code',
    grant && grant.idp !== idp && 'code from another provider',
    (client.id !== CLIENTS[idp].id || client.secret !== CLIENTS[idp].secret) && 'wrong client credentials',
    grant && client.id !== grant.clientId && 'code issued to another client',
    grant && form.get('redirect_uri') !== grant.redirectUri && 'redirect_uri mismatch',
    grant && (grant.challengeMethod !== 'S256' || createHash('sha256').update(verifier).digest('base64url') !== grant.challenge)
      && 'PKCE verifier does not match',
  ].filter(Boolean)
  if (problems.length > 0 || !grant) {
    console.error(`[fake-sso] ${idp} token refused: ${problems.join('; ')}`)
    return { status: 400, body: { error: 'invalid_grant', error_description: problems.join('; ') } }
  }
  const now = Math.floor(Date.now() / 1000)
  const iss = idp === 'google' ? GOOGLE_ISSUER : MICROSOFT_ISSUER.replace('{tenantid}', String(grant.claims.tid ?? ''))
  const idToken = signJwt({ ...grant.claims, iss, aud: grant.clientId, iat: now, exp: now + 300, nonce: grant.nonce })
  return { status: 200, body: { id_token: idToken, access_token: randomBytes(16).toString('hex'), token_type: 'Bearer', expires_in: 300 } }
}

async function route(req: IncomingMessage, res: ServerResponse) {
  const origin = `http://${req.headers.host}`
  const url = new URL(req.url ?? '/', origin)
  const path = url.pathname
  if (path === '/health') return send(res, 200, { status: 'ok' })
  if (path === '/jwks') return send(res, 200, { keys: [publicJwk] })
  if (path === '/google/.well-known/openid-configuration') return send(res, 200, discovery('google', GOOGLE_ISSUER, origin))
  const msDiscovery = /^\/microsoft\/([^/]+)\/v2\.0\/\.well-known\/openid-configuration$/.exec(path)
  if (msDiscovery) {
    // A shared tenant (common, organizations) publishes the issuer as a template.
    const tenant = msDiscovery[1]
    const shared = ['common', 'organizations', 'consumers'].includes(tenant)
    return send(res, 200, discovery('microsoft', shared ? MICROSOFT_ISSUER : MICROSOFT_ISSUER.replace('{tenantid}', tenant), origin))
  }
  if (path.startsWith('/graph/')) return send(res, 404, { error: { code: 'ImageNotFound' } })

  const endpoint = /^\/(google|microsoft)\/(authorize|token)$/.exec(path)
  if (!endpoint) return send(res, 404, { error: `no route for ${path}` })
  const [, idp, action] = endpoint

  if (action === 'authorize' && req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    return res.end(signInPage(idp, url.searchParams))
  }
  if (action === 'authorize' && req.method === 'POST') {
    const form = await readBody(req)
    const asked = new URLSearchParams([...form].filter(([k]) => k.startsWith('q_')).map(([k, v]) => [k.slice(2), v]))
    const redirectUri = asked.get('redirect_uri') ?? ''
    const state = asked.get('state') ?? ''
    if (form.get('action') === 'cancel') return redirect(res, redirectUri, { error: 'access_denied', state })
    const code = randomBytes(16).toString('base64url')
    grants.set(code, {
      idp,
      claims: claimsFrom(idp, form),
      clientId: asked.get('client_id') ?? '',
      redirectUri,
      challenge: asked.get('code_challenge') ?? '',
      challengeMethod: asked.get('code_challenge_method') ?? '',
      nonce: asked.get('nonce') ?? '',
    })
    return redirect(res, redirectUri, { code, state })
  }
  if (action === 'token' && req.method === 'POST') {
    const { status, body } = exchange(idp, req, await readBody(req))
    return send(res, status, body)
  }
  return send(res, 405, { error: 'method not allowed' })
}

const portArg = process.argv.indexOf('--port')
const port = Number(portArg > -1 ? process.argv[portArg + 1] : 14040)

createServer((req, res) => {
  route(req, res).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[fake-sso] ${req.method} ${req.url} -> 500: ${message}`)
    if (!res.headersSent) send(res, 500, { error: message })
  })
}).listen(port, '127.0.0.1', () => console.log(`[fake-sso] listening on http://127.0.0.1:${port}`))
