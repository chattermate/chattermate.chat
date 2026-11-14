/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * One-click connect for the WordPress plugin.
 *
 * The plugin sends the admin to /connect/wordpress with where to come back
 * (its admin-post.php "chattermate_connect" action) and a random, single-use
 * `state`. The admin picks an agent here and is sent back with its widget ID.
 * The plugin checks the state, so a forged or replayed return does nothing.
 * Where the build can teach the agent the site (hosted), the return also carries
 * a one-time connect_token, which the plugin claims from its own server.
 */

/** The plugin's admin-post action, the only place a return may go. */
export const WORDPRESS_RETURN_ACTION = 'chattermate_connect'

export interface ConnectRequest {
  returnUrl: URL
  state: string
  siteName: string
  /** The public site's host (home_url), where the chat runs; may differ from wp-admin's. */
  siteHost: string
  /** The public site's address (home_url), when the plugin sent it. */
  siteUrl: string | null
  /** Whether the site is a WooCommerce store. */
  store: boolean
}

/**
 * The return address, if it is a WordPress admin-post.php URL for the plugin's
 * action: anything else (another path, javascript:, a bare host) is refused, so
 * this page can't be used to bounce visitors elsewhere.
 */
export function parseReturnUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string' || !raw) return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (url.username || url.password) return null
  if (!url.pathname.endsWith('/wp-admin/admin-post.php')) return null
  if (url.searchParams.get('action') !== WORDPRESS_RETURN_ACTION) return null
  return url
}

/** The request in the page's query, or null when it isn't one the plugin made. */
export function parseConnectRequest(query: Record<string, unknown>): ConnectRequest | null {
  const returnUrl = parseReturnUrl(firstValue(query.return_url))
  const state = firstValue(query.state)
  if (!returnUrl || typeof state !== 'string' || !/^[A-Za-z0-9]{8,64}$/.test(state)) return null
  const siteName = firstValue(query.site_name)
  const siteUrl = publicUrl(firstValue(query.site_url))
  const siteHost = siteUrl?.host ?? returnUrl.host
  return {
    returnUrl,
    state,
    siteName: typeof siteName === 'string' && siteName.trim() ? siteName.trim().slice(0, 120) : siteHost,
    siteHost,
    siteUrl: siteUrl?.toString() ?? null,
    store: firstValue(query.store) === '1',
  }
}

/** The site's public address, or null when it isn't an http(s) URL. */
function publicUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string' || !raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

/** Where to send the admin back to: with the chosen widget, or with why not. */
export function buildReturnUrl(
  request: ConnectRequest,
  result: { widgetId: string; connectToken?: string | null } | { error: 'cancelled' },
): string {
  const url = new URL(request.returnUrl.toString())
  // Only what this page decided goes back, never values smuggled into return_url.
  for (const key of ['state', 'widget_id', 'error', 'connect_token']) url.searchParams.delete(key)
  url.searchParams.set('state', request.state)
  if ('widgetId' in result) {
    url.searchParams.set('widget_id', result.widgetId)
    if (result.connectToken) url.searchParams.set('connect_token', result.connectToken)
  } else {
    url.searchParams.set('error', result.error)
  }
  return url.toString()
}

/** Hosts the backend treats as local: listed without a port, they allow any port. */
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

/**
 * Whether a widget's allowed domains already let it run on `host` (host[:port]),
 * the way the backend's frame-ancestors rule decides (widget_embed_policy): an
 * empty list allows every site; a plain domain also covers its www. twin;
 * `*.example.com` covers subdomains; a port must match, except that a local
 * host listed without one allows any port.
 */
export function allowsHost(allowedDomains: string[], host: string): boolean {
  if (!allowedDomains.length) return true
  const [name, port = ''] = splitHost(host.toLowerCase())
  return allowedDomains.some((raw) => {
    const [entry, entryPort = ''] = splitHost(raw.toLowerCase())
    const anyPort = !entryPort && LOCAL_HOSTS.includes(entry)
    if (!anyPort && entryPort !== port) return false
    if (entry.startsWith('*.')) return name.endsWith(entry.slice(1))
    if (LOCAL_HOSTS.includes(entry)) return name === entry
    const apex = entry.startsWith('www.') ? entry.slice(4) : entry
    return name === apex || name === `www.${apex}`
  })
}

/** host[:port] as [host, port]; an IPv6 literal keeps its brackets. */
function splitHost(value: string): [string, string?] {
  const match = value.match(/^(\[[^\]]+\]|[^:]+)(?::(\d+))?$/)
  return match ? [match[1], match[2]] : [value]
}

function firstValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value
}
