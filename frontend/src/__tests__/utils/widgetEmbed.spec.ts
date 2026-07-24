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

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { buildWidgetEmbed } from '@/utils/widgetEmbed'

/**
 * The embed snippet runs on the CUSTOMER's own site, where window.APP_CONFIG is
 * absent — so it must carry this install's backend URL as window.chattermateBaseUrl
 * and load the loader from this frontend's own origin. Both are resolved at
 * generation time from runtime config, so a self-hosted install needs no rebuild.
 */
describe('buildWidgetEmbed', () => {
  // The loader is served by this frontend, so its origin is wherever the dashboard
  // runs (jsdom reports http://localhost:3000) — NOT the configured API host.
  const ORIGIN = window.location.origin
  const API_URL = 'https://support.example.com/api/v1'

  beforeEach(() => {
    // @ts-expect-error test shim for runtime config
    window.APP_CONFIG = { API_URL, WS_URL: 'wss://support.example.com' }
  })

  afterEach(() => {
    // @ts-expect-error cleanup test shim
    delete window.APP_CONFIG
  })

  it('bakes chattermateBaseUrl from the runtime API url (simple variant)', () => {
    const code = buildWidgetEmbed('w-123')
    expect(code).toContain(`window.chattermateBaseUrl='${API_URL}'`)
    expect(code).toContain(`window.chattermateId='w-123'`)
    expect(code).toContain(`${ORIGIN}/webclient/chattermate.min.js`)
  })

  it('bakes chattermateBaseUrl in the token-auth variant too', () => {
    const code = buildWidgetEmbed('w-123', true)
    expect(code).toContain(`window.chattermateBaseUrl = '${API_URL}'`)
    expect(code).toContain(`${ORIGIN}/webclient/chattermate.min.js`)
  })

  it('never hardcodes the vendor cloud when self-host config is present', () => {
    const code = buildWidgetEmbed('w-123')
    expect(code).not.toContain('api.chattermate.chat')
  })
})
