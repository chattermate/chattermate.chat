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

// Reconnecting through one-click must bring the same number or Page back:
// connecting another one beside it leaves the broken account broken.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))
vi.mock('@/services/agent', () => ({
  agentService: { getOrganizationAgents: vi.fn().mockResolvedValue([{ id: 'ag1', name: 'Bot' }]) },
}))
vi.mock('@/services/channels', () => ({
  default: {
    getEmbeddedSignupConfig: vi.fn(),
    connectWhatsApp: vi.fn(),
    connectWhatsAppEmbeddedSignup: vi.fn(),
    listMessengerSignupPages: vi.fn(),
    connectMessengerSignup: vi.fn(),
    connectInstagramLogin: vi.fn(),
  },
}))
// Meta's SDK and popups don't exist in a test: each login answers at once
vi.mock('@/utils/metaSdk', async (original) => ({
  ...(await original<object>()),
  loadMetaSdk: vi.fn().mockResolvedValue(undefined),
  runBusinessLogin: vi.fn().mockResolvedValue('login-code'),
  runInstagramLogin: vi.fn().mockResolvedValue('login-code'),
  // Embedded Signup's postMessage, with the number the customer picked
  parseSignupMessage: (event: MessageEvent) => event.data,
}))

import { toast } from 'vue-sonner'
import channelsService from '@/services/channels'
import MetaChannelConnect from '../../../components/integrations/MetaChannelConnect.vue'
import type { ChannelAccount } from '@/services/channels'

type Channel = 'whatsapp' | 'messenger' | 'instagram'

const broken = (channel: Channel, external: string): ChannelAccount => ({
  id: 'acc1', channel_type: channel, external_account_id: external,
  display_name: 'Acme Support', is_active: true, agent_id: 'ag1', needs_reconnect: true,
})

const reconnectWithOneClick = async (account: ChannelAccount) => {
  vi.mocked(channelsService.getEmbeddedSignupConfig).mockResolvedValue(
    { enabled: true, app_id: 'APP1', config_id: 'CFG1', graph_version: 'v21.0' } as any)
  const wrapper = mount(MetaChannelConnect, {
    props: { channel: account.channel_type as Channel, existingAccount: account },
    global: { stubs: { 'font-awesome-icon': true } },
  })
  await flushPromises()
  await wrapper.find('.meta-reconnect button').trigger('click')
  await flushPromises()
  await wrapper.find('.meta-signup-btn').trigger('click')
  await flushPromises()
  return wrapper
}

const PAGES = (...ids: string[]) => ({
  signup_token: 'sealed', pages: ids.map(id => ({ id, name: `Page ${id}` })),
})

describe('MetaChannelConnect one-click reconnect', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => { delete (window as any).FB })

  it('Messenger: connects the same Page straight away, with no picker', async () => {
    vi.mocked(channelsService.listMessengerSignupPages).mockResolvedValue(PAGES('PAGE2', 'PAGE1') as any)
    vi.mocked(channelsService.connectMessengerSignup).mockResolvedValue(
      { ...broken('messenger', 'PAGE1'), needs_reconnect: false })
    const wrapper = await reconnectWithOneClick(broken('messenger', 'PAGE1'))
    expect(channelsService.connectMessengerSignup).toHaveBeenCalledWith({ signup_token: 'sealed', page_id: 'PAGE1' })
    expect(wrapper.find('.meta-reconnect').exists()).toBe(false)
  })

  it('Messenger: a login without that Page connects nothing and says why', async () => {
    vi.mocked(channelsService.listMessengerSignupPages).mockResolvedValue(PAGES('PAGE2') as any)
    const wrapper = await reconnectWithOneClick(broken('messenger', 'PAGE1'))
    expect(channelsService.connectMessengerSignup).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith("That login didn't include Acme Support", expect.anything())
    expect(wrapper.text()).not.toContain('Page PAGE2')
  })

  const whatsAppSignup = (phoneNumberId: string) => {
    ;(window as any).FB = {
      login: (callback: (r: unknown) => void) => {
        window.dispatchEvent(new MessageEvent('message', { data: { waba_id: 'W1', phone_number_id: phoneNumberId } }))
        callback({ authResponse: { code: 'es-code' } })
      },
    }
  }

  it('WhatsApp: another number is not connected', async () => {
    whatsAppSignup('PN2')
    await reconnectWithOneClick(broken('whatsapp', 'PN1'))
    expect(channelsService.connectWhatsAppEmbeddedSignup).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith("That's a different number, not Acme Support", expect.anything())
  })

  it('WhatsApp: the same number reconnects', async () => {
    whatsAppSignup('PN1')
    vi.mocked(channelsService.connectWhatsAppEmbeddedSignup).mockResolvedValue(
      { ...broken('whatsapp', 'PN1'), needs_reconnect: false })
    await reconnectWithOneClick(broken('whatsapp', 'PN1'))
    expect(channelsService.connectWhatsAppEmbeddedSignup).toHaveBeenCalledWith(
      { code: 'es-code', waba_id: 'W1', phone_number_id: 'PN1' })
  })

  it('WhatsApp: after choosing the wrong number, choosing the right one reconnects', async () => {
    whatsAppSignup('PN2')
    vi.mocked(channelsService.connectWhatsAppEmbeddedSignup).mockResolvedValue(
      { ...broken('whatsapp', 'PN1'), needs_reconnect: false })
    const wrapper = await reconnectWithOneClick(broken('whatsapp', 'PN1'))
    expect(channelsService.connectWhatsAppEmbeddedSignup).not.toHaveBeenCalled()
    // The button is usable again, and a second try with the same number works
    whatsAppSignup('PN1')
    await wrapper.find('.meta-signup-btn').trigger('click')
    await flushPromises()
    expect(channelsService.connectWhatsAppEmbeddedSignup).toHaveBeenCalledWith(
      { code: 'es-code', waba_id: 'W1', phone_number_id: 'PN1' })
  })

  it('Messenger: a 422 from the server reads as its message', async () => {
    vi.mocked(channelsService.listMessengerSignupPages).mockResolvedValue(PAGES('PAGE1') as any)
    vi.mocked(channelsService.connectMessengerSignup).mockRejectedValue(
      { response: { status: 422, data: { detail: [{ msg: 'Value error, Signup expired, try again' }] } } })
    await reconnectWithOneClick(broken('messenger', 'PAGE1'))
    expect(toast.error).toHaveBeenCalledWith('Signup expired, try again')
  })

  it('Instagram: says so when the login brought another account', async () => {
    vi.mocked(channelsService.connectInstagramLogin).mockResolvedValue(
      { ...broken('instagram', 'IG2'), display_name: '@other', needs_reconnect: false })
    await reconnectWithOneClick(broken('instagram', 'IG1'))
    expect(toast.warning).toHaveBeenCalledWith('Connected @other, not Acme Support', expect.anything())
    expect(toast.success).not.toHaveBeenCalled()
  })
})
