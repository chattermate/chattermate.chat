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

// Where the widget frame is first asked for. The API host redirects a frame to the
// frame host (the backend's WIDGET_FRAME_URL): on a first visit that is one more
// connection and round trip before the chat can start. A loader built with that host
// (VITE_WIDGET_FRAME_URL) asks it directly, at the address the redirect would give.
//
// Only for the API the loader was built for: a page pointing at another backend
// doesn't share its frame host, so it keeps that backend's own redirect.

function trimSlashes(value) {
  return String(value).replace(/\/+$/, '')
}

// The base the frame's path goes under: the built frame host plus the API's path,
// or the API base itself.
export function frameBase(apiUrl, builtApiUrl, builtFrameUrl) {
  if (!apiUrl || !builtApiUrl || !builtFrameUrl) return apiUrl
  if (trimSlashes(apiUrl) !== trimSlashes(builtApiUrl)) return apiUrl
  let api
  let host
  try {
    api = new URL(builtApiUrl)
    host = new URL(builtFrameUrl)
  } catch {
    return apiUrl
  }
  if (host.protocol !== 'https:' && host.protocol !== 'http:') return apiUrl
  return trimSlashes(host.origin + host.pathname) + trimSlashes(api.pathname)
}
