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
 * (its admin-post.php "chattermate_connect" action) and a WordPress nonce as
 * `state`. The admin picks an agent here and is sent back with its widget ID.
 * The plugin checks the nonce, so a forged return does nothing.
 */

/** The plugin's admin-post action, the only place a return may go. */
export const WORDPRESS_RETURN_ACTION = 'chattermate_connect'

export interface ConnectRequest {
  returnUrl: URL
  state: string
  siteName: string
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
  if (!returnUrl || typeof state !== 'string' || !/^[A-Za-z0-9]{1,64}$/.test(state)) return null
  const siteName = firstValue(query.site_name)
  return {
    returnUrl,
    state,
    siteName: typeof siteName === 'string' && siteName.trim() ? siteName.trim().slice(0, 120) : returnUrl.host,
  }
}

/** Where to send the admin back to: with the chosen widget, or with why not. */
export function buildReturnUrl(request: ConnectRequest, result: { widgetId: string } | { error: 'cancelled' }): string {
  const url = new URL(request.returnUrl.toString())
  url.searchParams.set('state', request.state)
  if ('widgetId' in result) url.searchParams.set('widget_id', result.widgetId)
  else url.searchParams.set('error', result.error)
  return url.toString()
}

/**
 * Whether a widget's allowed domains already let it run on `host`. An empty list
 * allows every site; `*.example.com` covers subdomains of example.com.
 */
export function allowsHost(allowedDomains: string[], host: string): boolean {
  if (!allowedDomains.length) return true
  const name = host.toLowerCase()
  const bare = name.split(':')[0]
  return allowedDomains.some((entry) => {
    const domain = entry.toLowerCase()
    if (domain === name || domain === bare) return true
    return domain.startsWith('*.') && bare.endsWith(domain.slice(1))
  })
}

function firstValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value
}
