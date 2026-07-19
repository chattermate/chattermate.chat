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

import { describe, it, expect } from 'vitest'

import { isDeniedNavigation } from '@/pwa/navigationDenylist'
import { META_OAUTH_CALLBACK_PATH } from '@/utils/metaSdk'

/**
 * Workbox matches the denylist against `pathname + search`, so every case here
 * is written the way the service worker actually sees it — with the query
 * string attached. An earlier fix anchored on `$` and silently matched nothing
 * once Meta appended ?code=.
 */
describe('service worker navigation denylist', () => {
  describe('OAuth callbacks are never answered with the SPA shell', () => {
    it('denies the Meta callback carrying the code and state Meta appends', () => {
      expect(
        isDeniedNavigation(`${META_OAUTH_CALLBACK_PATH}?code=AQLe9lcDvOy&state=abc-123`),
      ).toBe(true)
    })

    it('denies it bare too', () => {
      expect(isDeniedNavigation(META_OAUTH_CALLBACK_PATH)).toBe(true)
    })
  })

  describe('real SPA routes still get the shell', () => {
    it.each([
      '/',
      '/settings/integrations',
      '/conversations',
      '/ai-agents',
      '/people',
      '/settings/integrations?tab=messenger',
    ])('allows %s', (path) => {
      expect(isDeniedNavigation(path)).toBe(false)
    })

    it('is not fooled by a dot inside the query string', () => {
      // The extension rule must look at the path, not the whole string.
      expect(isDeniedNavigation('/people?search=ada.lovelace%40example.com')).toBe(false)
    })
  })

  describe('the pre-existing exclusions still hold', () => {
    it.each(['/api/v1/users/login', '/widget/abc', '/webclient/chattermate.min.js', '/shopify/inbox'])(
      'denies %s',
      (path) => {
        expect(isDeniedNavigation(path)).toBe(true)
      },
    )
  })

  it('covers any other standalone file in public/, not just the ones we listed', () => {
    // The point of the extension rule: nothing new has to be enumerated.
    expect(isDeniedNavigation('/robots.txt')).toBe(true)
    expect(isDeniedNavigation('/some-future-callback.html?code=x')).toBe(true)
  })
})
