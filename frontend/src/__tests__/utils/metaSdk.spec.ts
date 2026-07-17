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
import { parseSignupMessage, signupLoginOptions } from '../../utils/metaSdk'

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
