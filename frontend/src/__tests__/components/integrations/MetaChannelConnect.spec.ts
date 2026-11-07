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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/services/agent', () => ({
  agentService: { getOrganizationAgents: vi.fn().mockResolvedValue([{ id: 'ag1', name: 'Bot' }]) },
}))
// The SDK script never loads in a test; one-click only needs it on click
vi.mock('@/utils/metaSdk', async (original) => ({
  ...(await original<object>()),
  loadMetaSdk: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/services/channels', () => ({
  default: {
    getEmbeddedSignupConfig: vi.fn().mockResolvedValue({ enabled: false }),
    connectWhatsApp: vi.fn(),
  },
}))

import channelsService from '@/services/channels'
import { toast } from 'vue-sonner'
import MetaChannelConnect from '../../../components/integrations/MetaChannelConnect.vue'
import type { ChannelAccount } from '@/services/channels'

const ACCOUNT: ChannelAccount = {
  id: 'acc1', channel_type: 'whatsapp', external_account_id: 'PN1',
  display_name: 'Test Number', is_active: true, agent_id: 'ag1',
}

const mountModal = (existingAccount: ChannelAccount) =>
  mount(MetaChannelConnect, {
    props: { channel: 'whatsapp', existingAccount },
    global: { stubs: { 'font-awesome-icon': true } },
  })

describe('MetaChannelConnect reconnect prompt', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not offer a reconnect for a healthy account', async () => {
    const wrapper = mountModal(ACCOUNT)
    await flushPromises()
    expect(wrapper.find('.meta-reconnect').exists()).toBe(false)
    expect(wrapper.text()).toContain('is connected')
  })

  it('offers a reconnect when Meta stopped accepting the account', async () => {
    const wrapper = mountModal({ ...ACCOUNT, needs_reconnect: true })
    await flushPromises()
    expect(wrapper.find('.meta-reconnect').text()).toContain('Reconnect to resume replies')
  })

  it('Reconnect opens the credentials form, and connecting again clears the prompt', async () => {
    vi.mocked(channelsService.connectWhatsApp).mockResolvedValue({ ...ACCOUNT, needs_reconnect: false })
    const wrapper = mountModal({ ...ACCOUNT, needs_reconnect: true })
    await flushPromises()

    await wrapper.find('.meta-reconnect button').trigger('click')
    await flushPromises()
    expect(wrapper.find('#meta-phone_number_id').exists()).toBe(true)

    await wrapper.find('#meta-phone_number_id').setValue('PN1')
    await wrapper.find('#meta-access_token').setValue('new-token')
    await wrapper.find('#meta-app_secret').setValue('s3cret')
    await wrapper.findAll('.meta-actions .meta-btn-primary').at(-1)!.trigger('click')
    await flushPromises()

    expect(channelsService.connectWhatsApp).toHaveBeenCalledWith(
      expect.objectContaining({ phone_number_id: 'PN1', access_token: 'new-token', app_secret: 's3cret' }))
    expect(wrapper.find('.meta-reconnect').exists()).toBe(false)
    expect(wrapper.text()).toContain('is connected')
  })

  it('a one-click number reconnects by hand without an app secret', async () => {
    vi.mocked(channelsService.connectWhatsApp).mockResolvedValue({ ...ACCOUNT, needs_reconnect: false })
    const wrapper = mountModal({ ...ACCOUNT, needs_reconnect: true })
    await flushPromises()
    await wrapper.find('.meta-reconnect button').trigger('click')
    await flushPromises()
    expect(wrapper.find('label[for="meta-app_secret"]').text()).toContain('only if from your own Meta app')
    await wrapper.find('#meta-phone_number_id').setValue('PN1')
    await wrapper.find('#meta-access_token').setValue('new-token')
    await wrapper.findAll('.meta-actions .meta-btn-primary').at(-1)!.trigger('click')
    await flushPromises()
    expect(channelsService.connectWhatsApp).toHaveBeenCalledWith({ phone_number_id: 'PN1', access_token: 'new-token' })
  })

  it('a number from the customer\'s own app still needs its secret to reconnect', async () => {
    const wrapper = mountModal({ ...ACCOUNT, needs_reconnect: true, webhook_url: 'https://api.example.com/x' })
    await flushPromises()
    await wrapper.find('.meta-reconnect button').trigger('click')
    await flushPromises()
    await wrapper.find('#meta-phone_number_id').setValue('PN1')
    await wrapper.find('#meta-access_token').setValue('new-token')
    await wrapper.findAll('.meta-actions .meta-btn-primary').at(-1)!.trigger('click')
    await flushPromises()
    expect(channelsService.connectWhatsApp).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Please fill in: App secret')
  })

  it('refused for a missing secret, then connects once it is entered', async () => {
    vi.mocked(channelsService.connectWhatsApp)
      .mockRejectedValueOnce({ response: { status: 400, data: { detail: "Enter your Meta app's secret, from App settings → Basic." } } })
      .mockResolvedValueOnce({ ...ACCOUNT, needs_reconnect: false })
    const wrapper = mountModal({ ...ACCOUNT, needs_reconnect: true })
    await flushPromises()
    await wrapper.find('.meta-reconnect button').trigger('click')
    await flushPromises()
    await wrapper.find('#meta-phone_number_id').setValue('PN1')
    await wrapper.find('#meta-access_token').setValue('new-token')
    const connect = () => wrapper.findAll('.meta-actions .meta-btn-primary').at(-1)!.trigger('click')
    await connect()
    await flushPromises()
    expect(toast.error).toHaveBeenCalledWith("Enter your Meta app's secret, from App settings → Basic.")
    expect(wrapper.find('#meta-phone_number_id').exists()).toBe(true) // still on the form, values kept

    await wrapper.find('#meta-app_secret').setValue('s3cret')
    await connect()
    await flushPromises()
    expect(channelsService.connectWhatsApp).toHaveBeenLastCalledWith(
      { phone_number_id: 'PN1', access_token: 'new-token', app_secret: 's3cret' })
    expect(wrapper.text()).toContain('is connected')
  })

  it('does not ask about one-click until the customer reconnects', async () => {
    mountModal({ ...ACCOUNT, needs_reconnect: true })
    await flushPromises()
    expect(channelsService.getEmbeddedSignupConfig).not.toHaveBeenCalled()
  })

  it('Reconnect offers one-click when it is on: a signup number has no app secret to enter', async () => {
    vi.mocked(channelsService.getEmbeddedSignupConfig).mockResolvedValueOnce(
      { enabled: true, app_id: 'APP1', config_id: 'CFG1', graph_version: 'v21.0' } as any)
    const wrapper = mountModal({ ...ACCOUNT, needs_reconnect: true })
    await flushPromises()
    await wrapper.find('.meta-reconnect button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.meta-signup').exists()).toBe(true)
    expect(wrapper.find('#meta-phone_number_id').exists()).toBe(false)
  })

  it('shows the server\'s reason when a connect is refused', async () => {
    vi.mocked(channelsService.connectWhatsApp).mockRejectedValueOnce({ response: { status: 422, data: {
      detail: [{ msg: 'Value error, Enter your Meta app\'s secret' }] } } })
    const wrapper = mountModal({ ...ACCOUNT, needs_reconnect: true })
    await flushPromises()
    await wrapper.find('.meta-reconnect button').trigger('click')
    await flushPromises()
    for (const [key, value] of [['phone_number_id', 'PN1'], ['access_token', 't'], ['app_secret', 's']]) {
      await wrapper.find(`#meta-${key}`).setValue(value)
    }
    await wrapper.findAll('.meta-actions .meta-btn-primary').at(-1)!.trigger('click')
    await flushPromises()
    expect(toast.error).toHaveBeenCalledWith("Enter your Meta app's secret")
  })
})

describe('MetaChannelConnect first paint', () => {
  beforeEach(() => vi.clearAllMocks())

  const mountNew = () => mount(MetaChannelConnect, {
    props: { channel: 'whatsapp' },
    global: { stubs: { 'font-awesome-icon': true } },
  })
  const pending = () => {
    let answer!: (value: unknown) => void
    vi.mocked(channelsService.getEmbeddedSignupConfig).mockReturnValueOnce(
      new Promise(resolve => { answer = resolve }) as any)
    return (value: unknown) => answer(value)
  }

  it('shows neither form while it asks whether one-click is offered', async () => {
    pending()
    const wrapper = mountNew()
    await flushPromises()
    expect(wrapper.find('.meta-signup-checking').exists()).toBe(true)
    expect(wrapper.find('#meta-phone_number_id').exists()).toBe(false)
    expect(wrapper.find('.meta-signup').exists()).toBe(false)
  })

  it('goes straight to one-click when it is offered, never past the manual form', async () => {
    const answer = pending()
    const wrapper = mountNew()
    await flushPromises()
    answer({ enabled: true, app_id: 'APP1', config_id: 'CFG1', graph_version: 'v21.0' })
    await flushPromises()
    expect(wrapper.find('.meta-signup').exists()).toBe(true)
    expect(wrapper.find('#meta-phone_number_id').exists()).toBe(false)
    expect(wrapper.find('.meta-signup-checking').exists()).toBe(false)
  })

  it('shows the manual form when one-click is off', async () => {
    const answer = pending()
    const wrapper = mountNew()
    answer({ enabled: false })
    await flushPromises()
    expect(wrapper.find('#meta-phone_number_id').exists()).toBe(true)
    expect(wrapper.find('.meta-signup-checking').exists()).toBe(false)
  })

  it('falls back to the manual form when the check fails', async () => {
    vi.mocked(channelsService.getEmbeddedSignupConfig).mockRejectedValueOnce(new Error('network'))
    const wrapper = mountNew()
    await flushPromises()
    expect(wrapper.find('#meta-phone_number_id').exists()).toBe(true)
    expect(wrapper.find('.meta-signup-checking').exists()).toBe(false)
  })
})
