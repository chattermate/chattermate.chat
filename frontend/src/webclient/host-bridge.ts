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

/**
 * The one way the widget talks to the page it is embedded in.
 *
 * These messages include the visitor's conversation token, so they are addressed to a
 * specific origin rather than broadcast with "*": if the embedding page is ever
 * replaced by another site's document, the browser drops the message instead of
 * handing that site a live token.
 *
 * The widget runs in a srcdoc iframe, which inherits the embedder's origin, so the
 * host origin is normally readable. When it genuinely cannot be determined we fall
 * back to "*" - a widget that cannot talk to its loader is broken, and that is worse
 * than the broadcast we have always done.
 */

const ANY_ORIGIN = '*'

/** Origins a browser reports for an opaque (sandboxed, data:, srcdoc) document. */
const OPAQUE = new Set(['null', 'about:blank', ''])

let resolved: string | null = null

const usable = (origin: string | undefined | null): string | null =>
  origin && !OPAQUE.has(origin) ? origin : null

const originOf = (url: string | undefined | null): string | null => {
  if (!url) return null
  try {
    return usable(new URL(url).origin)
  } catch {
    return null
  }
}

/**
 * Origin of the page hosting the widget, or "*" when it cannot be established.
 * Resolved once: an embedding page navigating between routes keeps its origin.
 */
export function hostOrigin(): string {
  if (resolved) return resolved

  // Not framed at all - the dashboard preview renders the widget inline.
  if (window.parent === window) {
    resolved = usable(window.location.origin) || ANY_ORIGIN
    return resolved
  }

  // Same-origin parent: the srcdoc frame the embed loader creates. Reading its
  // location throws for a cross-origin embed, which the catch below handles.
  try {
    const parentOrigin = usable(window.parent.location.origin)
    if (parentOrigin) {
      resolved = parentOrigin
      return resolved
    }
  } catch {
    /* cross-origin parent - fall through */
  }

  // Cross-origin embed: the browser still names our ancestors (not in Firefox), and
  // the referrer is the embedding document.
  try {
    const ancestors = window.location.ancestorOrigins
    const nearest = ancestors && ancestors.length ? usable(ancestors[0]) : null
    if (nearest) {
      resolved = nearest
      return resolved
    }
  } catch {
    /* not supported - fall through */
  }

  resolved = originOf(document.referrer) || ANY_ORIGIN
  return resolved
}

/** Send a message to the embedding page, addressed to its origin. */
export function postToHost(message: Record<string, unknown>): void {
  window.parent.postMessage(message, hostOrigin())
}

/** Test seam: forget the cached origin. */
export function resetHostOrigin(): void {
  resolved = null
}
