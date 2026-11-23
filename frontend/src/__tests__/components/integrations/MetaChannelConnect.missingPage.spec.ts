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

// A Page ticked in Meta's popup that Meta won't give a token for (the person has
// no role on it) must not vanish: the picker stays up and says why.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))
vi.mock('@/services/agent', () => ({
  agentService: { getOrganizationAgents: vi.fn().mockResolvedValue([{ id: 'ag1', name: 'Bot' }]) },
}))
vi.mock('@/services/channels', () => ({
  default: {
    getEmbeddedSignupConfig: vi.fn(),
    listMessengerSignupPages: vi.fn(),
    connectMessengerSignup: vi.fn(),
  },
}))
vi.mock('@/utils/metaSdk', async (original) => ({
  ...(await original<object>()),
  loadMetaSdk: vi.fn().mockResolvedValue(undefined),
  runBusinessLogin: vi.fn().mockResolvedValue('login-code'),
}))

import channelsService from '@/services/channels'
import MetaChannelConnect from '../../../components/integrations/MetaChannelConnect.vue'

const NOTICE = 'Page BIZ1 was shared, but your Facebook account has no role on it.'

const connectWithOneClick = async () => {
  vi.mocked(channelsService.getEmbeddedSignupConfig).mockResolvedValue(
    { enabled: true, app_id: 'APP1', config_id: 'CFG1', graph_version: 'v21.0' } as any)
  const wrapper = mount(MetaChannelConnect, {
    props: { channel: 'messenger' },
    global: { stubs: { 'font-awesome-icon': true } },
  })
  await flushPromises()
  await wrapper.find('.meta-signup-btn').trigger('click')
  await flushPromises()
  return wrapper
}

describe('MetaChannelConnect: a ticked Page Meta would not hand over', () => {
  beforeEach(() => vi.clearAllMocks())

  it('keeps the picker for a single Page and shows why the other is missing', async () => {
    vi.mocked(channelsService.listMessengerSignupPages).mockResolvedValue({
      signup_token: 'sealed', pages: [{ id: 'PAGE1', name: 'Acme Support' }], unavailable_notice: NOTICE,
    })
    const wrapper = await connectWithOneClick()
    expect(channelsService.connectMessengerSignup).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Acme Support')
    expect(wrapper.find('[role="note"]').text()).toContain('Page BIZ1 was shared')
  })

  it('still connects a single Page straight away when nothing is missing', async () => {
    vi.mocked(channelsService.listMessengerSignupPages).mockResolvedValue({
      signup_token: 'sealed', pages: [{ id: 'PAGE1', name: 'Acme Support' }], unavailable_notice: null,
    })
    vi.mocked(channelsService.connectMessengerSignup).mockResolvedValue({
      id: 'acc1', channel_type: 'messenger', external_account_id: 'PAGE1',
      display_name: 'Acme Support', is_active: true, agent_id: null, needs_reconnect: false,
    } as any)
    await connectWithOneClick()
    expect(channelsService.connectMessengerSignup).toHaveBeenCalledWith({ signup_token: 'sealed', page_id: 'PAGE1' })
  })
})
