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
 * When this browser's access token runs out, as far as the dashboard knows.
 *
 * The token is an httpOnly cookie on the API's host, so the page cannot read
 * it. Without this, a page opening after the token lapsed fires its whole
 * load (~20 calls) at once, every one comes back 401, and each is replayed
 * after the refresh: twice the calls, enough to trip the API rate limit.
 * Knowing the deadline lets the client refresh first and send the load once.
 *
 * Kept in localStorage so every tab shares it, as they share the cookies.
 * An unknown deadline means "don't guess": requests go out and a 401 still
 * refreshes as before.
 */

const STORAGE_KEY = 'access_token_expires_at'

// Every response that sets a new access token says how long it lasts, in
// seconds (the backend's ACCESS_TOKEN_EXPIRES_IN_HEADER).
const EXPIRES_IN_HEADER = 'x-access-token-expires-in'

// Refresh this long before the deadline, so a request sent just before it
// doesn't land just after it.
const SLACK_MS = 60 * 1000

/** Start the clock if `headers` (a response's) carry a new token's lifetime. */
export function noteAccessTokenIssued(headers: unknown, now: number = Date.now()): void {
  const seconds = Number(readHeader(headers, EXPIRES_IN_HEADER))
  if (!(seconds > 0)) return
  try {
    localStorage.setItem(STORAGE_KEY, String(now + seconds * 1000 - SLACK_MS))
  } catch {
    // Storage blocked: fall back to refreshing on the first 401.
  }
}

/** True only when the token is known to have run out. */
export function accessTokenExpired(now: number = Date.now()): boolean {
  try {
    const deadline = Number(localStorage.getItem(STORAGE_KEY))
    return deadline > 0 && now >= deadline
  } catch {
    return false
  }
}

/** The deadline is no longer known: signed out, or a token was issued
 * somewhere this client could not read the lifetime from. */
export function forgetAccessToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored to forget.
  }
}

/** One header from axios' headers object (or a plain one in tests). */
function readHeader(headers: unknown, name: string): unknown {
  if (!headers || typeof headers !== 'object') return undefined
  const lookup = headers as { get?: (key: string) => unknown } & Record<string, unknown>
  return typeof lookup.get === 'function' ? lookup.get(name) : lookup[name]
}
