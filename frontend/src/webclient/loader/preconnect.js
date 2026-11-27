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

// Opening the connections the widget frame will need before the frame asks for them.
// The frame starts at the API host, which redirects it to the frame host; the page,
// bundle and bootstrap all come from there. Each new connection costs a DNS lookup
// and a TLS handshake, which on a slow link is most of a second.
//
// The frame host is only known once a frame has said hello, so the last one is kept
// in the site's own storage. That storage is the page's to change, so what's read
// back only ever becomes a preconnect hint: never the frame's address, which carries
// the visitor's token.
//
// No crossorigin attribute: the frame's navigation and its same-origin bundle are
// credentialed requests, and browsers keep those on separate connections from
// anonymous (crossorigin) ones.

export const FRAME_ORIGIN_PREFIX = 'cm_frame:'

// An http(s) origin, or null for anything else.
export function webOrigin(url, base) {
  try {
    const parsed = new URL(url, base)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    return parsed.origin
  } catch {
    return null
  }
}

export function createFrameOriginCache(storage, widgetId) {
  const key = widgetId ? FRAME_ORIGIN_PREFIX + widgetId : null

  function read() {
    if (!storage || !key) return null
    try {
      const value = storage.getItem(key)
      // Exactly an origin, nothing more: a path or credentials make it unusable.
      return value && webOrigin(value) === value ? value : null
    } catch {
      return null
    }
  }

  function save(origin) {
    if (!storage || !key || webOrigin(origin) !== origin) return
    try {
      if (storage.getItem(key) !== origin) storage.setItem(key, origin)
    } catch {
      // Storage full or blocked: the next visit just doesn't get the hint.
    }
  }

  return { read, save }
}

// Adds one <link rel="preconnect"> per origin; a second call for the same one is a no-op.
export function preconnect(doc, origin) {
  if (!doc || !doc.head || !origin) return
  const links = doc.head.querySelectorAll('link[rel="preconnect"][data-chattermate]')
  for (let i = 0; i < links.length; i++) {
    if (links[i].getAttribute('href') === origin) return
  }
  const link = doc.createElement('link')
  link.rel = 'preconnect'
  link.href = origin
  link.setAttribute('data-chattermate', '')
  doc.head.appendChild(link)
}

// The API host (the frame's first stop) and, for a returning visitor, the frame host
// the last frame came from. Skipped when the page is itself on that origin.
export function warmUpConnections(doc, apiUrl, frameOrigin) {
  const pageOrigin = doc && doc.location ? doc.location.origin : null
  const base = doc && doc.location ? doc.location.href : undefined
  ;[webOrigin(apiUrl, base), frameOrigin].forEach(function (origin) {
    if (origin && origin !== pageOrigin) preconnect(doc, origin)
  })
}

export function removePreconnects(doc) {
  if (!doc || !doc.head) return
  doc.head.querySelectorAll('link[rel="preconnect"][data-chattermate]').forEach(function (link) {
    link.remove()
  })
}
