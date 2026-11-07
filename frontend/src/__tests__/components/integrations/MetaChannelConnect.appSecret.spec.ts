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
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'

import MetaChannelConnect from '../../../components/integrations/MetaChannelConnect.vue'
import channelsService from '../../../services/channels'
import { toast } from 'vue-sonner'

vi.mock('vue-sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('../../../services/channels', () => ({
  default: { connectWhatsApp: vi.fn(), connectMessenger: vi.fn(), connectInstagram: vi.fn() },
}))
vi.mock('../../../services/agent', () => ({ agentService: { getOrganizationAgents: vi.fn().mockResolvedValue([]) } }))
// The manual form, as when Meta's one-click signup isn't offered
vi.mock('../../../composables/useMetaSignup', () => ({
  useMetaSignup: () => ({
    checkSignup: vi.fn(), signupChecked: ref(true), signupEnabled: ref(false), signingUp: ref(false), showManualForm: ref(true), signupPages: ref([]),
    connectingPage: ref(false), copy: { intro: '', cta: '' }, startSignup: vi.fn(), onPageSelected: vi.fn(),
  }),
}))

const OWN_APP_ACCOUNT = {
  id: 'acc-1', channel_type: 'whatsapp', external_account_id: 'PN9', is_active: true, display_name: 'Acme',
  webhook_url: 'https://api.example.com/api/v1/webhooks/meta/acc-1', webhook_verify_token: 'tok', webhook_auto_configured: false,
}

const fill = async (wrapper: ReturnType<typeof mount>, values: Record<string, string>) => {
  for (const [key, value] of Object.entries(values)) {
    await wrapper.find(`#meta-${key}`).setValue(value)
  }
  await wrapper.findAll('button').find(b => b.text() === 'Connect')!.trigger('click')
  await flushPromises()
}

describe('MetaChannelConnect app secret', () => {
  beforeEach(() => vi.clearAllMocks())

  it('refuses to connect without a secret', async () => {
    const wrapper = mount(MetaChannelConnect, { props: { channel: 'whatsapp' }, global: { stubs: { 'font-awesome-icon': true } } })
    await fill(wrapper, { phone_number_id: 'PN9', access_token: 'EAAG-x', app_secret: '   ' })
    expect(channelsService.connectWhatsApp).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Please fill in: App secret')
  })

  it('asks for the secret on Messenger too', async () => {
    const wrapper = mount(MetaChannelConnect, { props: { channel: 'messenger' }, global: { stubs: { 'font-awesome-icon': true } } })
    await fill(wrapper, { page_id: 'PAGE9', page_access_token: 'EAAG-p' })
    expect(channelsService.connectMessenger).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Please fill in: App secret')
  })

  it('sends the secret and shows where webhooks go', async () => {
    vi.mocked(channelsService.connectWhatsApp).mockResolvedValue(OWN_APP_ACCOUNT as any)
    const wrapper = mount(MetaChannelConnect, { props: { channel: 'whatsapp' }, global: { stubs: { 'font-awesome-icon': true } } })
    await fill(wrapper, { phone_number_id: 'PN9', access_token: 'EAAG-x', app_secret: ' s3cret ' })
    expect(channelsService.connectWhatsApp).toHaveBeenCalledWith(
      { phone_number_id: 'PN9', access_token: 'EAAG-x', app_secret: 's3cret' })
    expect(wrapper.text()).toContain('Callback URL')
    expect(wrapper.text()).toContain('WhatsApp → Configuration')
  })

  it('offers the secret on Messenger too, not Instagram', () => {
    const has = (channel: 'messenger' | 'instagram') =>
      mount(MetaChannelConnect, { props: { channel }, global: { stubs: { 'font-awesome-icon': true } } })
        .find('#meta-app_secret').exists()
    expect(has('messenger')).toBe(true)
    expect(has('instagram')).toBe(false)
  })
})
