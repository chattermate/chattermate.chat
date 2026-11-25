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
import { detectBrowser } from '@/utils/browserKind'

const UA = {
  chrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0',
  firefox: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  android: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
  androidFirefox: 'Mozilla/5.0 (Android 15; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
}

describe('detectBrowser', () => {
  it.each([
    [UA.chrome, 'chrome'],
    [UA.edge, 'edge'],
    [UA.firefox, 'firefox'],
    [UA.safari, 'safari'],
    [UA.android, 'android'],
    [UA.androidFirefox, 'other'],
    [UA.iphone, 'ios-app'],
    ['Mozilla/5.0 SomethingElse/1.0', 'other'],
  ])('%s reads as %s', (userAgent, kind) => {
    expect(detectBrowser({ userAgent })).toBe(kind)
  })

  it('knows Brave by navigator.brave, since its user agent says Chrome', () => {
    expect(detectBrowser({ userAgent: UA.chrome, brave: {} })).toBe('brave')
  })
})
