/*
 * Copyright 2024-2026 ChatterMate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ref, type Ref } from 'vue'
import { widgetEnv } from '../webclient/widget-env'

/**
 * The widget's conversation token: where it is kept, and how it stays alive.
 *
 * An identified token (POST /generate-token) lives for as long as the embedding app
 * asked for — an hour by default. A visitor who leaves the page open longer than that
 * used to lose their identity the moment anything re-checked the token, and came back
 * as a brand-new anonymous customer. So the widget rotates the token before it lapses,
 * and treats a lapsed one as something only the host page can fix.
 */

export const TOKEN_STORAGE_KEY = 'ctid'

// Matches conversation_token.IDENTITY_EXPIRED_CODE on the backend: the request
// carried a real token for a signed-in visitor, and it has run out.
export const IDENTITY_EXPIRED_CODE = 'identity_expired'

// Rotate once this share of the lifetime is gone. Early enough to survive a sleeping
// tab that wakes just before expiry, late enough not to churn tokens on every visit.
const REFRESH_AT_LIFETIME_FRACTION = 0.8

// setTimeout clamps anything past ~24.8 days to a negative delay and fires at once.
const MAX_TIMER_MS = 12 * 60 * 60 * 1000

// A token that is already past its refresh point would otherwise be retried with no
// delay at all, which turns a backend hiccup into a request storm.
const RETRY_DELAY_MS = 30 * 1000

const SECOND_MS = 1000

/** Reject the strings an auth store stringifies into when it has nothing. */
export const sanitizeToken = (value: unknown): string | null => {
  if (typeof value !== 'string') return value ? String(value) : null
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null
  return trimmed
}

/** Claims of a JWT we already hold. Read-only use: the server still verifies it. */
export const readTokenClaims = (token: string | null): Record<string, any> | null => {
  const value = sanitizeToken(token)
  if (!value) return null
  const [, payload] = value.split('.')
  if (!payload) return null
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

const readStoredToken = (): string | null => {
  try {
    return sanitizeToken(localStorage.getItem(TOKEN_STORAGE_KEY))
  } catch {
    // Private mode, or storage blocked by the host page's settings.
    return null
  }
}

const writeStoredToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // Not fatal: the token still lives in memory for this page view.
  }
}

const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* nothing to clear */
  }
}

export interface ConversationTokenOptions {
  /** Called whenever the token changes, so the host page can store the new one. */
  onTokenChanged?: (token: string) => void
  /** Called when only the host can help: its token expired and cannot be rotated. */
  onIdentityExpired?: () => void
}

export function useConversationToken(options: ConversationTokenOptions = {}) {
  const token: Ref<string | null> = ref(null)
  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let inFlight: Promise<boolean> | null = null

  const clearTimer = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  /** Seconds until the current token expires; null when it carries no expiry. */
  const secondsUntilExpiry = (): number | null => {
    const claims = readTokenClaims(token.value)
    if (!claims?.exp) return null
    return Number(claims.exp) - Math.floor(Date.now() / SECOND_MS)
  }

  /** True once the token is close enough to expiry to be worth rotating. */
  const needsRefresh = (): boolean => {
    const claims = readTokenClaims(token.value)
    if (!claims?.exp) return false
    const lifetime = claims.iat ? Number(claims.exp) - Number(claims.iat) : 0
    const remaining = secondsUntilExpiry() ?? 0
    if (lifetime <= 0) return remaining <= 0
    return remaining <= lifetime * (1 - REFRESH_AT_LIFETIME_FRACTION)
  }

  const setToken = (next: string | null, { persist = true } = {}) => {
    const clean = sanitizeToken(next)
    clearTimer()
    token.value = clean
    if (!clean) {
      clearStoredToken()
      return
    }
    if (persist) {
      writeStoredToken(clean)
      options.onTokenChanged?.(clean)
    }
    scheduleRefresh()
  }

  /**
   * Rotate the token now. Resolves true when the widget holds a usable token
   * afterwards — including when the current one was still fine.
   */
  const refresh = async (widgetId: string): Promise<boolean> => {
    if (!token.value || !widgetId) return false
    if (inFlight) return inFlight

    const current = token.value
    inFlight = (async () => {
      try {
        const response = await fetch(`${widgetEnv.API_URL}/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${current}`,
          },
          body: JSON.stringify({ widget_id: widgetId }),
        })

        if (response.status === 401) {
          // Past saving from in here: only the host page can mint a new identity.
          options.onIdentityExpired?.()
          return false
        }
        if (!response.ok) {
          scheduleRefresh(RETRY_DELAY_MS)
          return false
        }

        const body = await response.json()
        const rotated = sanitizeToken(body?.data?.token)
        if (!rotated) return false

        setToken(rotated)
        return true
      } catch {
        // Offline or blocked: keep the token we have and try again shortly.
        scheduleRefresh(RETRY_DELAY_MS)
        return false
      } finally {
        inFlight = null
      }
    })()

    return inFlight
  }

  /** Rotate only if the token is near the end of its life. */
  const ensureFresh = async (widgetId: string): Promise<boolean> => {
    if (!token.value) return false
    if (!needsRefresh()) return true
    return refresh(widgetId)
  }

  /**
   * Queue the next rotation. Anonymous tokens are long-lived and carry no `iat`
   * lifetime worth tracking, so only identified ones are scheduled.
   */
  const scheduleRefresh = (delayMs?: number) => {
    clearTimer()
    const claims = readTokenClaims(token.value)
    if (!claims?.exp || !claims?.iat) return

    const lifetimeMs = (Number(claims.exp) - Number(claims.iat)) * SECOND_MS
    const remainingMs = (secondsUntilExpiry() ?? 0) * SECOND_MS
    const delay = delayMs ?? Math.min(
      MAX_TIMER_MS,
      Math.max(0, remainingMs - lifetimeMs * (1 - REFRESH_AT_LIFETIME_FRACTION)),
    )

    refreshTimer = setTimeout(() => {
      refreshTimer = null
      // ensureFresh, not refresh: the timer is capped at MAX_TIMER_MS, so on a
      // long-lived token this tick only re-arms rather than rotating early.
      void ensureFresh(scheduledWidgetId).then((ok) => {
        // Re-arm either way: a token that was not due yet still needs its next tick,
        // and a failed rotation should be retried rather than abandoned.
        scheduleRefresh(ok ? undefined : RETRY_DELAY_MS)
      })
    }, delay)
  }

  // Captured once at start(): the widget only ever serves one widget id per page.
  let scheduledWidgetId = ''

  /** Adopt the token the backend rendered into the frame, or the stored one. */
  const start = (widgetId: string, initialToken?: unknown) => {
    scheduledWidgetId = widgetId
    const initial = sanitizeToken(initialToken) || readStoredToken()
    // Persisting on start would echo the token straight back to the host page, which
    // already has it. setToken still arms the refresh timer.
    setToken(initial, { persist: false })
    if (initial) writeStoredToken(initial)
  }

  const stop = () => {
    clearTimer()
    inFlight = null
  }

  return {
    token,
    start,
    stop,
    setToken,
    ensureFresh,
  }
}
