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

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import IntegrationsSettings from '@/views/settings/IntegrationsSettings.vue'
import channelsService from '@/services/channels'
import { WORDPRESS_PLUGIN_URL } from '@/config/docs'

vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))
vi.mock('@/layouts/DashboardLayout.vue', () => ({
  default: { name: 'DashboardLayout', template: '<div><slot /></div>' },
}))
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    enterpriseComponent: () => defineComponent({ render: () => h('div') }),
    moduleImports: {},
  }),
}))
vi.mock('@/services/jira', () => ({
  checkJiraConnection: vi.fn().mockResolvedValue(false),
  getJiraAuthUrl: vi.fn(),
  disconnectJira: vi.fn(),
}))
vi.mock('@/services/shopify', () => ({
  checkShopifyConnection: vi.fn().mockResolvedValue({ connected: false }),
  getShopifyShops: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/services/channels', () => ({
  default: {
    listAccounts: vi.fn().mockResolvedValue([]),
    getAccountLimits: vi.fn().mockResolvedValue({ whatsapp: 2 }),
  },
}))
vi.mock('@/services/crm', () => ({ default: { listConnections: vi.fn().mockResolvedValue([]) } }))

const stub = { template: '<div />' }

const mountView = async (): Promise<VueWrapper> => {
  const wrapper = mount(IntegrationsSettings, {
    global: {
      stubs: {
        TelegramConnectModal: stub,
        MetaChannelConnect: stub,
        WhatsAppTemplateManager: stub,
        WhatsAppNumbersModal: stub,
        ChannelConnectModal: stub,
      },
    },
  })
  await flushPromises()
  return wrapper
}

const cardNamed = (wrapper: VueWrapper, name: string) =>
  wrapper.findAll('.integration-card').find(card => card.find('.integration-name').text() === name)

describe('IntegrationsSettings: WordPress + WooCommerce card', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountView()
  })

  it('links to the plugin on WordPress.org in a new tab', () => {
    const card = cardNamed(wrapper, 'WordPress + WooCommerce')
    expect(card).toBeDefined()
    const link = card!.find('a.int-btn-connect')
    expect(link.attributes('href')).toBe(WORDPRESS_PLUGIN_URL)
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
    expect(link.text()).toContain('Get the plugin')
  })

  it('shows no connection state, since the plugin connects from WordPress', () => {
    const card = cardNamed(wrapper, 'WordPress + WooCommerce')!
    expect(card.find('.status-badge').exists()).toBe(false)
    expect(card.find('button.int-btn-connect').exists()).toBe(false)
    expect(card.find('.int-btn-disconnect').exists()).toBe(false)
  })

  it('leaves the card out of the connected count', () => {
    const cards = wrapper.findAll('.integration-card')
    const connected = cards.filter(card => card.find('.status-badge.connected').exists()).length
    expect(wrapper.find('.int-summary').text()).toBe(`${connected}/${cards.length - 1} connected`)
  })

  it('is found by searching for WooCommerce', async () => {
    await wrapper.find('input').setValue('woocommerce')
    const names = wrapper.findAll('.integration-name').map(n => n.text())
    expect(names).toEqual(['WordPress + WooCommerce'])
  })

  it('still offers Install on the Shopify card', () => {
    const card = cardNamed(wrapper, 'Shopify')!
    expect(card.find('.status-badge.not-connected').exists()).toBe(true)
    expect(card.find('button.int-btn-connect').text()).toContain('Install')
  })
})

describe('IntegrationsSettings: WhatsApp numbers', () => {
  const numbersStub = defineComponent({
    name: 'WhatsAppNumbersModal',
    props: { accounts: { type: Array, required: true }, limit: { type: Number, default: null } },
    emits: ['close', 'add', 'manage', 'disconnected'],
    setup: () => () => h('div', { class: 'numbers-stub' }),
  })
  const metaStub = defineComponent({
    name: 'MetaChannelConnect',
    props: { channel: String, existingAccount: { type: Object, default: null } },
    setup: () => () => h('div', { class: 'meta-stub' }),
  })
  const numbers = [
    { id: 'n1', channel_type: 'whatsapp', external_account_id: 'PN1', display_name: 'Sales', is_active: true },
    { id: 'n2', channel_type: 'whatsapp', external_account_id: 'PN2', display_name: 'Support', is_active: true },
  ]

  const mountWithNumbers = async () => {
    vi.mocked(channelsService.listAccounts).mockResolvedValueOnce(numbers as never)
    const wrapper = mount(IntegrationsSettings, {
      global: {
        stubs: {
          TelegramConnectModal: stub,
          MetaChannelConnect: metaStub,
          WhatsAppTemplateManager: stub,
          WhatsAppNumbersModal: numbersStub,
          ChannelConnectModal: stub,
        },
      },
    })
    await flushPromises()
    await cardNamed(wrapper, 'WhatsApp')!.findAll('button').find(b => b.text() === 'Manage')!.trigger('click')
    return wrapper
  }

  it('Manage lists every number with the plan limit', async () => {
    const wrapper = await mountWithNumbers()
    const modal = wrapper.findComponent(numbersStub)

    expect(modal.exists()).toBe(true)
    expect(modal.props('accounts')).toHaveLength(2)
    expect(modal.props('limit')).toBe(2)
  })

  it('adding a number opens a blank connect form in place of the list', async () => {
    const wrapper = await mountWithNumbers()
    wrapper.findComponent(numbersStub).vm.$emit('add')
    await flushPromises()

    expect(wrapper.findComponent(numbersStub).exists()).toBe(false)
    const form = wrapper.findComponent(metaStub)
    expect(form.props('channel')).toBe('whatsapp')
    expect(form.props('existingAccount')).toBeNull()
  })

  it('managing one number opens its own connect form', async () => {
    const wrapper = await mountWithNumbers()
    wrapper.findComponent(numbersStub).vm.$emit('manage', numbers[1])
    await flushPromises()

    expect(wrapper.findComponent(metaStub).props('existingAccount')).toEqual(numbers[1])
  })

  it('reads the plan limit again when the list opens', async () => {
    vi.mocked(channelsService.getAccountLimits).mockClear()
    await mountWithNumbers()
    // Once on load, once more when Manage opened the list
    expect(channelsService.getAccountLimits).toHaveBeenCalledTimes(2)
  })

  it('warns that the card\'s Disconnect removes every number', async () => {
    vi.mocked(channelsService.listAccounts).mockResolvedValueOnce(numbers as never)
    const wrapper = mount(IntegrationsSettings, {
      global: { stubs: { TelegramConnectModal: stub, MetaChannelConnect: stub, WhatsAppTemplateManager: stub,
        WhatsAppNumbersModal: stub, ChannelConnectModal: stub } },
    })
    await flushPromises()
    await cardNamed(wrapper, 'WhatsApp')!.findAll('button').find(b => b.text() === 'Disconnect')!.trigger('click')

    expect(wrapper.find('[data-testid="whatsapp-disconnect-all"]').text())
      .toBe('This disconnects all 2 WhatsApp numbers. To remove just one, use Manage.')
  })

  it('drops a disconnected number from the card', async () => {
    const wrapper = await mountWithNumbers()
    wrapper.findComponent(numbersStub).vm.$emit('disconnected', numbers[0])
    await flushPromises()

    expect(wrapper.findComponent(numbersStub).props('accounts')).toHaveLength(1)
    expect(cardNamed(wrapper, 'WhatsApp')!.text()).not.toContain('Sales')
  })
})
