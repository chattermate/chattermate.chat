// A pretend customer website with the ChatterMate widget embedded the way the
// dashboard's install snippet does it. Everything about the embed comes from the
// query string:
//
//   http://127.0.0.1:13000/?widget=<id>
//     &config=<json>   → window.chattermateConfig (launcher, position, trigger, …)
//     &token=<jwt>     → window.chattermateToken (token-authenticated widgets)
//     &trigger=1       → adds a page button with data-chattermate-open
//     &snippet=iframe  → the dashboard's iframe snippet instead of the script
//     &csp=strict      → a strict Content-Security-Policy (default-src 'none') that allows
//                        our script and API, like a hardened merchant site; frames only
//                        from &frameSrc=<space-separated origins>, none without it
//     &csp=nonce       → the same, but scripts only by nonce ('strict-dynamic', no
//                        'unsafe-inline'), as the most locked-down sites run
//     &loader=current  → on the legacy port: the current loader, not the frozen one
//     &tokenProvider=1 → chattermateConfig.tokenProvider asks the test for a fresh token
//                        (window.chattermateE2eToken, which ChatWidget exposes)
//
// The same site also listens on --legacy-port (127.0.0.1:13001), where it embeds the
// last release's loader (frontend/public/webclient/chattermate-legacy.min.js, as a browser's cache still serves it)
// instead of the current one. That loader fetches the widget cross-origin, so only
// this origin is in .env.e2e's CORS_ORIGINS: 13000 keeps proving the current loader
// needs none.
//
// It has to be a real server on 127.0.0.1: Chrome's Local Network Access check
// blocks a page Playwright fabricates (page.route) from loading the loader and
// calling the API on loopback.
//
// Run: node services/customer-site/server.ts --port 13000 --legacy-port 13001 --api <api url> --loader <loader url>

import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : fallback
}

const port = Number(arg('port', '13000'))
const apiUrl = arg('api', 'http://127.0.0.1:18000/api/v1')
const loaderUrl = arg('loader', 'http://127.0.0.1:15173/webclient/chattermate.min.js')
const legacyPort = Number(arg('legacy-port', '13001'))
const LEGACY_LOADER_PATH = '/legacy/chattermate.min.js'
// The frozen last-release loader the dashboard serves for the in-page fallback
const legacyLoader = readFileSync(new URL('../../../frontend/public/webclient/chattermate-legacy.min.js', import.meta.url))

interface Embed {
  widgetId: string
  config: string | null
  token: string | null
  trigger: boolean
  iframe: boolean
  tokenProvider: boolean
  /** Where the loader comes from: the current build, or the frozen last release. */
  loader: string
  /** A strict Content-Security-Policy, framing only these origins ('' frames nothing); null for none. */
  strictCspFrameSrc: string | null
  /** Scripts by this nonce only (no 'unsafe-inline'); null allows inline scripts. */
  scriptNonce: string | null
  /** Register the e2e in-app actions (see HOST_ACTIONS_SCRIPT). */
  actions: boolean
  /** ChatterMate.setContext(...) with this JSON. */
  context: string | null
  /** ChatterMate.prompt(...) with this JSON. */
  prompt: string | null
}

// The site's own app code for in-app actions: what each action does is visible on the
// page (App status, Action runs, Currency), so a test can see it happened, and how often.
const HOST_ACTIONS_SCRIPT = `
      (function () {
        var status = document.getElementById('app-status')
        var runs = document.getElementById('app-runs')
        var currency = document.getElementById('app-currency')
        function ran(text) { runs.textContent = String(Number(runs.textContent) + 1); status.textContent = text }
        ChatterMate.registerActions({
          open_page: async function (args) { ran('Opened ' + args.path); return { ok: true, path: args.path } },
          send_invoice: {
            preview: async function (args) { return { details: { Invoice: 'INV-7', To: args.to } } },
            run: async function (args) { ran('Sent invoice to ' + args.to); return { sent: true } },
          },
          set_currency: {
            preview: async function (args) { return currency.textContent === args.code ? null : { before: currency.textContent, after: args.code } },
            run: async function (args) { currency.textContent = args.code; ran('Currency is ' + args.code); return { currency: args.code } },
          },
          slow_open: function (args) {
            status.textContent = 'Working'
            return new Promise(function (resolve) { setTimeout(function () { ran('Opened ' + args.path); resolve({ ok: true }) }, 1500) })
          },
          fail_task: async function () { throw new Error('No permission for that') },
        })
      })()`

/** A hardened merchant's policy: our script and API allowed, frames only as given. */
function strictCsp(loader: string, frameSrc: string, nonce: string | null): string {
  const api = new URL(apiUrl).origin
  const ws = api.replace(/^http/, 'ws')
  // A loader on this site itself (the frozen one) is 'self'
  const scripts = `${/^https?:/.test(loader) ? new URL(loader).origin : "'self'"} ${api}`
  return [
    "default-src 'none'", "base-uri 'none'", "object-src 'none'",
    nonce ? `script-src 'nonce-${nonce}' 'strict-dynamic'` : `script-src 'unsafe-inline' ${scripts}`,
    `style-src 'unsafe-inline' ${scripts}`,
    `font-src ${api} data:`, 'img-src http: https: data: blob:', `connect-src ${api} ${ws}`,
    ...(frameSrc ? [`frame-src ${frameSrc}`] : []),
  ].join('; ')
}

/** The dashboard's iframe snippet (AgentWidgetTab), classed so the page object finds it. */
function iframeSnippet(widgetId: string): string {
  const src = `${apiUrl}/widgets/${encodeURIComponent(widgetId)}/frame`
  return `<iframe class="chattermate-iframe" src="${src}" width="100%" height="600" frameborder="0" title="AI Assistant" allow="clipboard-write *"></iframe>`
}

function page(embed: Embed): string {
  if (embed.iframe) {
    return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Acme Store</title></head>
  <body>
    <h1>Acme Store</h1>
    ${iframeSnippet(embed.widgetId)}
  </body>
</html>`
  }
  const globals = [
    `window.chattermateId = ${JSON.stringify(embed.widgetId)};`,
    `window.chattermateBaseUrl = ${JSON.stringify(apiUrl)};`,
    // config arrives as JSON text; parse it here so a malformed value fails the request, not the page.
    embed.config ? `window.chattermateConfig = ${JSON.stringify(JSON.parse(embed.config))};` : '',
    embed.token ? `window.chattermateToken = ${JSON.stringify(embed.token)};` : '',
    // What a site's own code does: ask its server for a fresh token when the widget needs one
    embed.tokenProvider
      ? 'window.chattermateConfig = Object.assign({}, window.chattermateConfig, { tokenProvider: function () { return window.chattermateE2eToken() } });'
      : '',
  ].filter(Boolean).join('\n      ')
  // After the loader: the page's own code calling the JS API. JSON is parsed here too.
  const appCode = [
    embed.actions ? HOST_ACTIONS_SCRIPT : '',
    embed.context ? `ChatterMate.setContext(${JSON.stringify(JSON.parse(embed.context))});` : '',
    embed.prompt ? `ChatterMate.prompt(${JSON.stringify(JSON.parse(embed.prompt))});` : '',
  ].filter(Boolean).join('\n      ')
  const csp = embed.strictCspFrameSrc === null ? ''
    : `<meta http-equiv="Content-Security-Policy" content="${strictCsp(embed.loader, embed.strictCspFrameSrc, embed.scriptNonce)}">`
  const nonce = embed.scriptNonce ? ` nonce="${embed.scriptNonce}"` : ''
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${csp}<title>Acme Store</title></head>
  <body>
    <h1>Acme Store</h1>
    ${embed.trigger ? '<button type="button" data-chattermate-open>Chat with us</button>' : ''}
    <script${nonce}>
      ${globals}
    </script>
    <script src="${embed.loader}"${nonce}></script>
    ${embed.actions ? '<p>App status: <span id="app-status" role="status" aria-label="App status">Ready</span></p><p>Action runs: <span id="app-runs" aria-label="Action runs">0</span></p><p>Currency: <span id="app-currency" aria-label="Currency">USD</span></p>' : ''}
    ${appCode ? `<script${nonce}>${appCode}</script>` : ''}
  </body>
</html>`
}

function serve(listenPort: number, loader: string, legacy: boolean): void {
  createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${listenPort}`)
    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'text/plain' }).end('ok')
      return
    }
    if (legacy && url.pathname === LEGACY_LOADER_PATH) {
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' }).end(legacyLoader)
      return
    }
    if (url.pathname !== '/') {
      res.writeHead(404).end()
      return
    }
    const params = url.searchParams
    let html: string
    try {
      html = page({
        widgetId: params.get('widget') ?? '',
        config: params.get('config'),
        token: params.get('token'),
        trigger: params.get('trigger') === '1',
        iframe: params.get('snippet') === 'iframe',
        tokenProvider: params.get('tokenProvider') === '1',
        loader: legacy && params.get('loader') === 'current' ? loaderUrl : loader,
        strictCspFrameSrc: ['strict', 'nonce'].includes(params.get('csp') ?? '') ? (params.get('frameSrc') ?? '') : null,
        scriptNonce: params.get('csp') === 'nonce' ? randomBytes(16).toString('base64') : null,
        actions: params.get('actions') === '1',
        context: params.get('context'),
        prompt: params.get('prompt'),
      })
    } catch {
      res.writeHead(400, { 'content-type': 'text/plain' }).end('config is not valid JSON')
      return
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html)
  }).listen(listenPort, '127.0.0.1', () => console.log(`[customer-site] http://127.0.0.1:${listenPort}/?widget=<id>${legacy ? ' (last release\'s loader)' : ''}`))
}

serve(port, loaderUrl, false)
serve(legacyPort, LEGACY_LOADER_PATH, true)
