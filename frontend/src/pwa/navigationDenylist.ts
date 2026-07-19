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
 * Navigations the service worker must NOT answer with the SPA shell.
 *
 * Lives outside sw.ts so it can be tested without ServiceWorker globals.
 *
 * Workbox matches these against `url.pathname + url.search`, **not** the
 * pathname alone (see workbox-routing/NavigationRoute `_match`). An anchored
 * `$` therefore stops matching the moment a provider appends a query string —
 * which is precisely the case that matters here, since OAuth providers always
 * redirect back with `?code=…`.
 */
export const NAVIGATION_DENYLIST: RegExp[] = [
  /^\/api\//,
  /^\/widget/,
  /^\/webclient/,
  /^\/shopify/,
  // Anything carrying a file extension is a real file served from public/,
  // never an SPA route — no route in the router has one.
  //
  // This is what keeps meta-oauth-callback.html working: Meta redirects the
  // login popup there, and the page exists only to postMessage the code back
  // to its opener. Answer it with index.html and the SPA boots instead, fails
  // to route the path, lands on the dashboard, and the connect dies silently.
  // Being precached does not save it — a precache lookup does not ignore
  // `?code=&state=`, so the request misses the entry and reaches the fallback.
  //
  // `[^?]*` keeps the extension match on the path, so a dot inside a query
  // string (`/settings?q=a.b`) is not mistaken for a filename.
  /^[^?]*\.[a-z0-9]+(\?|$)/i,
]

/**
 * Whether this navigation should bypass the SPA shell. Mirrors workbox's own
 * denylist check, so tests exercise the real matching semantics.
 */
export function isDeniedNavigation(pathnameAndSearch: string): boolean {
  return NAVIGATION_DENYLIST.some((pattern) => pattern.test(pathnameAndSearch))
}
