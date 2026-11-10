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

// The launcher's look as the dashboard last set it, kept in the site's own storage.
// The look only arrives once the widget frame has loaded, which on a slow network
// takes seconds; with this, a returning visitor's launcher shows straight away in
// its real colour, size and place, and the live settings still win when they come.
//
// Only the fields that shape the launcher are kept, and whatever is read back goes
// through the same checks as a live message, so a bad entry can't do more than one.

export const LOOK_CACHE_PREFIX = 'cm_look:'
const LOOK_FIELDS = ['chat_bubble_color', 'chat_style', 'widget_display', 'launcher', 'launcher_logo_url']
const MAX_BYTES = 4096

export function createLookCache(storage, widgetId) {
  const key = widgetId ? LOOK_CACHE_PREFIX + widgetId : null

  function read() {
    if (!storage || !key) return null
    try {
      const look = JSON.parse(storage.getItem(key) || 'null')
      return look && typeof look === 'object' && !Array.isArray(look) ? look : null
    } catch {
      return null
    }
  }

  function save(data) {
    if (!storage || !key || !data || typeof data !== 'object') return
    const look = {}
    LOOK_FIELDS.forEach(function (field) {
      if (data[field] !== undefined) look[field] = data[field]
    })
    try {
      const text = JSON.stringify(look)
      if (text.length <= MAX_BYTES) storage.setItem(key, text)
      else storage.removeItem(key)
    } catch {
      // Storage full or blocked: the launcher just waits for the frame, as before.
    }
  }

  return { read, save }
}
