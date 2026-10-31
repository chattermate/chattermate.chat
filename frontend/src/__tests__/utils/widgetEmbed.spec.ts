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

import { buildAiInstallPrompt, buildWidgetCsp, buildWidgetEmbed, widgetFrameSources } from '@/utils/widgetEmbed'
import { WIDGET_INSTALL_GUIDE_URL } from '@/config/docs'
// The snippet's exact text, pinned so other code that builds it can match it.
import golden from '../fixtures/widget-snippet.txt?raw'

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
    expect(code).toContain(`window.chattermateBaseUrl = '${API_URL}'`)
    expect(code).toContain(`window.chattermateId = 'w-123'`)
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

  it('matches the pinned snippet', () => {
    const expected = golden
      .replace('{widget_id}', 'w-123')
      .replace('{api_url}', API_URL)
      .replace('{loader_origin}', ORIGIN)
    expect(buildWidgetEmbed('w-123')).toBe(expected)
  })
})

describe('buildWidgetCsp', () => {
  it('names the loader and every host that frames the widget', () => {
    expect(buildWidgetCsp(['https://api.example.com', 'https://widget.example.com'])).toBe(
      `script-src ${window.location.origin};\nframe-src https://api.example.com https://widget.example.com;`)
  })

  it('leaves the script out for the iframe snippet, which loads no loader', () => {
    expect(buildWidgetCsp(['https://api.example.com'], false)).toBe('frame-src https://api.example.com;')
  })
})

describe('widgetFrameSources', () => {
  // The API the snippet points the loader at, not wherever the backend thinks it is
  beforeEach(() => {
    // @ts-expect-error test shim for runtime config
    window.APP_CONFIG = { API_URL: 'https://chat.example.com/api/v1', WS_URL: 'wss://chat.example.com' }
  })

  afterEach(() => {
    // @ts-expect-error cleanup test shim
    delete window.APP_CONFIG
  })

  it('starts from the API the snippet points at, then the frame host', () => {
    expect(widgetFrameSources('https://widget.example.com')).toEqual(['https://chat.example.com', 'https://widget.example.com'])
  })

  it('is just the API when the widget is framed there', () => {
    expect(widgetFrameSources(null)).toEqual(['https://chat.example.com'])
  })
})

describe('buildAiInstallPrompt', () => {
  const SNIPPET = "<script>\n  window.chattermateId = 'w-1';\n</script>"

  it('carries the exact snippet, where it goes and the install guide', () => {
    const prompt = buildAiInstallPrompt(SNIPPET)
    expect(prompt).toContain(SNIPPET)
    expect(prompt).toContain('</body>')
    expect(prompt).toContain(WIDGET_INSTALL_GUIDE_URL)
    expect(prompt).toContain('Change nothing else on the site.')
  })

  it('says where it belongs in the common site builders', () => {
    const prompt = buildAiInstallPrompt(SNIPPET)
    expect(prompt).toContain('index.html')
    expect(prompt).toContain('next/script')
    expect(prompt).toContain('WordPress')
  })

  it('is empty when there is nothing to install', () => {
    expect(buildAiInstallPrompt('')).toBe('')
  })
})
