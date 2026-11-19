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

// A number Meta connected but would not register for sending must not look
// healthy: every reply from it fails.
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
  },
}))
vi.mock('@/utils/metaSdk', async (original) => ({
  ...(await original<object>()),
  loadMetaSdk: vi.fn().mockResolvedValue(undefined),
  parseSignupMessage: (event: MessageEvent) => event.data,
}))

import { toast } from 'vue-sonner'
import channelsService from '@/services/channels'
import MetaChannelConnect from '../../../components/integrations/MetaChannelConnect.vue'
import type { ChannelAccount } from '@/services/channels'

const number = (overrides: Partial<ChannelAccount> = {}): ChannelAccount => ({
  id: 'acc1', channel_type: 'whatsapp', external_account_id: 'PN1',
  display_name: 'Acme (+27 76)', is_active: true, ...overrides,
})

const signUp = async (connected: ChannelAccount) => {
  vi.mocked(channelsService.getEmbeddedSignupConfig).mockResolvedValue(
    { enabled: true, app_id: 'APP1', config_id: 'CFG1', graph_version: 'v21.0' } as any)
  vi.mocked(channelsService.connectWhatsAppEmbeddedSignup).mockResolvedValue(connected)
  ;(window as any).FB = {
    login: (callback: (r: unknown) => void) => {
      window.dispatchEvent(new MessageEvent('message', { data: { waba_id: 'W1', phone_number_id: 'PN1' } }))
      callback({ authResponse: { code: 'es-code' } })
    },
  }
  const wrapper = mount(MetaChannelConnect, {
    props: { channel: 'whatsapp' },
    global: { stubs: { 'font-awesome-icon': true } },
  })
  await flushPromises()
  await wrapper.find('.meta-signup-btn').trigger('click')
  await flushPromises()
  return wrapper
}

describe('MetaChannelConnect registration failure', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => { delete (window as any).FB })

  it('signup warns instead of reporting success, and shows Meta\'s reason', async () => {
    const wrapper = await signUp(number({ send_problem: 'Two step verification PIN Mismatch' }))

    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.warning).toHaveBeenCalledWith("Connected Acme (+27 76), but WhatsApp can't send replies from it")
    expect(wrapper.find('.meta-reconnect').text()).toContain('Two step verification PIN Mismatch')
  })

  it('a registered number connects as before', async () => {
    const wrapper = await signUp(number())

    expect(toast.success).toHaveBeenCalledWith('Connected Acme (+27 76)')
    expect(toast.warning).not.toHaveBeenCalled()
    expect(wrapper.find('.meta-reconnect').exists()).toBe(false)
  })

  it('managing an unregistered number shows the warning and offers reconnect', async () => {
    vi.mocked(channelsService.getEmbeddedSignupConfig).mockResolvedValue(
      { enabled: true, app_id: 'APP1', config_id: 'CFG1', graph_version: 'v21.0' } as any)
    const wrapper = mount(MetaChannelConnect, {
      props: { channel: 'whatsapp', existingAccount: number({ send_problem: 'PIN Mismatch' }) },
      global: { stubs: { 'font-awesome-icon': true } },
    })
    await flushPromises()

    expect(wrapper.find('.meta-reconnect').text()).toContain('PIN Mismatch')
    await wrapper.find('.meta-reconnect button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.meta-signup-btn').exists()).toBe(true)
  })

  it('an expired token wins over a registration failure: one warning, not two', async () => {
    vi.mocked(channelsService.getEmbeddedSignupConfig).mockResolvedValue({ enabled: false } as any)
    const wrapper = mount(MetaChannelConnect, {
      props: {
        channel: 'whatsapp',
        existingAccount: number({ needs_reconnect: true, send_problem: 'PIN Mismatch' }),
      },
      global: { stubs: { 'font-awesome-icon': true } },
    })
    await flushPromises()

    expect(wrapper.findAll('.meta-reconnect')).toHaveLength(1)
    expect(wrapper.find('.meta-reconnect').text()).toContain('stopped accepting')
  })
})
