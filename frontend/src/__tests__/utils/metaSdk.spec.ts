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

import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  parseSignupMessage,
  signupLoginOptions,
  runInstagramLogin,
  runBusinessLogin,
} from '../../utils/metaSdk'

const message = (data: unknown, origin = 'https://www.facebook.com') =>
  ({ origin, data: typeof data === 'string' ? data : JSON.stringify(data) }) as MessageEvent

const FINISH = {
  type: 'WA_EMBEDDED_SIGNUP',
  event: 'FINISH',
  data: { waba_id: 'WABA9', phone_number_id: 'PN555' },
}

describe('parseSignupMessage', () => {
  it('reads the WABA and phone number from a finished signup', () => {
    expect(parseSignupMessage(message(FINISH))).toEqual({
      waba_id: 'WABA9',
      phone_number_id: 'PN555',
    })
  })

  it('accepts the other Facebook origins the flow can post from', () => {
    for (const origin of ['https://web.facebook.com', 'https://business.facebook.com']) {
      expect(parseSignupMessage(message(FINISH, origin))).not.toBeNull()
    }
  })

  it('rejects a lookalike origin', () => {
    // Meta's own sample uses origin.endsWith('facebook.com'), which these pass.
    for (const origin of ['https://evil-facebook.com', 'https://facebook.com.attacker.io']) {
      expect(parseSignupMessage(message(FINISH, origin))).toBeNull()
    }
  })

  it('rejects a plain http facebook origin', () => {
    expect(parseSignupMessage(message(FINISH, 'http://www.facebook.com'))).toBeNull()
  })

  it('ignores unrelated messages on a trusted origin', () => {
    expect(parseSignupMessage(message({ type: 'SOMETHING_ELSE' }))).toBeNull()
    expect(parseSignupMessage(message('not json at all'))).toBeNull()
  })

  it('ignores a signup that was abandoned rather than finished', () => {
    expect(parseSignupMessage(message({ ...FINISH, event: 'CANCEL' }))).toBeNull()
  })

  it('ignores a finish missing either id', () => {
    expect(parseSignupMessage(message({ ...FINISH, data: { waba_id: 'WABA9' } }))).toBeNull()
    expect(parseSignupMessage(message({ ...FINISH, data: {} }))).toBeNull()
  })
})

describe('signupLoginOptions', () => {
  it('asks for a code rather than the default token response', () => {
    expect(signupLoginOptions('CFG1')).toEqual({
      config_id: 'CFG1',
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {} },
    })
  })

  it('sends the WhatsApp setup extra for WhatsApp', () => {
    expect(signupLoginOptions('CFG1', 'whatsapp').extras).toEqual({ setup: {} })
  })

  it('omits the setup extra for Facebook Login for Business', () => {
    // extras.setup opens Embedded Signup; Messenger/Instagram must not send it.
    expect(signupLoginOptions('CFG1', 'messenger')).not.toHaveProperty('extras')
    expect(signupLoginOptions('CFG1', 'instagram')).not.toHaveProperty('extras')
  })
})

describe('OAuth login popups', () => {
  afterEach(() => vi.unstubAllGlobals())

  /** Capture the URL the popup is opened with, without completing the login. */
  const capturePopupUrl = (run: () => Promise<unknown>) => {
    let opened = ''
    vi.stubGlobal('open', (url: string) => {
      opened = url
      return { closed: false, close: () => {} }
    })
    // The promise stays pending (no callback message); we only want the URL.
    void run().catch(() => {})
    return new URL(opened)
  }

  it('sends Instagram to its own authorize endpoint, not a Facebook dialog', () => {
    const url = capturePopupUrl(() =>
      runInstagramLogin({ appId: 'IGAPP', redirectUri: 'https://app.test/cb.html' }))

    expect(url.origin + url.pathname).toBe('https://www.instagram.com/oauth/authorize')
    expect(url.searchParams.get('client_id')).toBe('IGAPP')
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('redirect_uri')).toBe('https://app.test/cb.html')
    // Must stay an Instagram sign-in — no Page, no Facebook fallback.
    expect(url.searchParams.get('enable_fb_login')).toBe('0')
    expect(url.searchParams.get('scope')).toContain('instagram_business_manage_messages')
    expect(url.searchParams.get('state')).toBeTruthy()
  })

  it('sends Messenger to the Facebook dialog with its configuration', () => {
    const url = capturePopupUrl(() =>
      runBusinessLogin({
        appId: 'FBAPP', configId: 'CFG1', graphVersion: 'v21.0',
        redirectUri: 'https://app.test/cb.html',
      }))

    expect(url.hostname).toBe('www.facebook.com')
    expect(url.searchParams.get('config_id')).toBe('CFG1')
    expect(url.searchParams.get('client_id')).toBe('FBAPP')
  })

  it('rejects when the browser blocks the popup', async () => {
    vi.stubGlobal('open', () => null)
    await expect(
      runInstagramLogin({ appId: 'IGAPP', redirectUri: 'https://app.test/cb.html' }),
    ).rejects.toThrow(/Popup blocked/)
  })
})
