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
vi.mock('@/services/channels', () => ({ default: { listAccounts: vi.fn().mockResolvedValue([]) } }))
vi.mock('@/services/crm', () => ({ default: { listConnections: vi.fn().mockResolvedValue([]) } }))

const stub = { template: '<div />' }

const mountView = async (): Promise<VueWrapper> => {
  const wrapper = mount(IntegrationsSettings, {
    global: {
      stubs: {
        TelegramConnectModal: stub,
        MetaChannelConnect: stub,
        WhatsAppTemplateManager: stub,
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
