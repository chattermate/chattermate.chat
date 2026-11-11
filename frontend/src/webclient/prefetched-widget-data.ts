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

// /bootstrap answers the widget's first GET /widgets/{id} up front, for the token
// it issued, so a starting chat is ready one round trip sooner. Used once, and
// only for exactly that request: the same token and no email. Anything else -
// a rotated token, an email the visitor typed, a later re-check - asks the API.

export type PrefetchedWidgetData =
  | { status: 200; data: Record<string, unknown> }
  | { status: number; detail: unknown }

/**
 * The prefetched answer as the Response that request would have got, or null
 * when the widget must ask. Consumed on the first call either way.
 */
export function takePrefetchedWidgetData(token: string | null | undefined, email: string | null): Response | null {
  const initial = window.__INITIAL_DATA__
  const prefetched = initial?.widgetData
  if (!initial || !prefetched) return null
  delete initial.widgetData
  if (email || (token || '') !== (initial.initialToken || '')) return null

  const body = 'data' in prefetched ? prefetched.data : { detail: prefetched.detail }
  return new Response(JSON.stringify(body), {
    status: prefetched.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
