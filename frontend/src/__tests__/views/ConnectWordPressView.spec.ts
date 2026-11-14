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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const query: Record<string, unknown> = {}
vi.mock('vue-router', () => ({ useRoute: () => ({ query }) }))

const getWidgets = vi.fn()
const getAllowedDomains = vi.fn()
const setAllowedDomains = vi.fn()
vi.mock('@/services/widget', () => ({
  widgetService: {
    getWidgets: (...args: unknown[]) => getWidgets(...args),
    getAllowedDomains: (...args: unknown[]) => getAllowedDomains(...args),
    setAllowedDomains: (...args: unknown[]) => setAllowedDomains(...args),
  },
}))

// The hosted build's learn option and token service; an empty object is the open-source build
const enterprise: { connectToken?: ReturnType<typeof vi.fn> } = {}
const LearnOption = {
  props: ['modelValue', 'siteHost', 'store'],
  emits: ['update:modelValue'],
  template: '<label class="learn-option"><input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />{{ store ? "store" : "site" }} {{ siteHost }}</label>',
}
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    moduleImports: { wordpressLearnOption: 'learn-option', wordpressSites: 'sites' },
    enterpriseComponent: () => (enterprise.connectToken ? LearnOption : { render: () => null }),
    loadModule: async () => (enterprise.connectToken ? { wordpressSites: { connectToken: enterprise.connectToken } } : null),
  }),
}))

import ConnectWordPressView from '@/views/ConnectWordPressView.vue'

const RETURN = 'https://shop.example.com/wp-admin/admin-post.php?action=chattermate_connect'
const WIDGETS = [
  { id: 'w-sales-0001', agent: { name: 'Sales', display_name: 'Mia' } },
  { id: 'w-support-0002', agent: { name: 'Support', display_name: null } },
]

const assign = vi.fn()

function mountView() {
  return mount(ConnectWordPressView, { global: { stubs: { 'router-link': { template: '<a><slot /></a>' } } } })
}

function returned(): URL {
  return new URL(assign.mock.calls[0][0])
}

beforeEach(() => {
  Object.keys(query).forEach((key) => delete query[key])
  Object.assign(query, { return_url: RETURN, state: 'nonce12345', site_name: 'Larkfield Goods' })
  getWidgets.mockResolvedValue(WIDGETS)
  getAllowedDomains.mockResolvedValue([])
  setAllowedDomains.mockResolvedValue([])
  vi.stubGlobal('location', { ...window.location, assign })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  delete enterprise.connectToken
})

describe('ConnectWordPressView', () => {
  it('allows the public host from site_url, not the admin host', async () => {
    query.site_url = 'https://www.larkfield.example/'
    getAllowedDomains.mockResolvedValue(['www.example.org'])
    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('.connect-domain input').setValue(true)
    await wrapper.find('.connect-actions button').trigger('click')
    await flushPromises()

    expect(setAllowedDomains).toHaveBeenCalledWith('w-sales-0001', ['www.example.org', 'www.larkfield.example'])
  })

  it('names the site and lists each agent by its visitor-facing name', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('Connect Larkfield Goods')
    expect(wrapper.text()).toContain('shop.example.com')
    const agents = wrapper.findAll('.connect-agent strong').map((node) => node.text())
    expect(agents).toEqual(['Mia', 'Support'])
    expect(wrapper.findAll('.connect-agent .connect-muted')[0].text()).toBe('Widget w-sales-')
  })

  it('sends the chosen widget back to WordPress with the nonce', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper.findAll('input[type="radio"]')[1].setValue(true)
    await flushPromises()
    await wrapper.find('.connect-actions button').trigger('click')
    await flushPromises()

    expect(returned().searchParams.get('widget_id')).toBe('w-support-0002')
    expect(returned().searchParams.get('state')).toBe('nonce12345')
    expect(returned().searchParams.get('action')).toBe('chattermate_connect')
    expect(setAllowedDomains).not.toHaveBeenCalled()
  })

  it('adds the site to a widget limited to other sites when the admin ticks it', async () => {
    getAllowedDomains.mockResolvedValue(['www.example.org'])
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.connect-domain').exists()).toBe(true)
    await wrapper.find('.connect-domain input').setValue(true)
    await wrapper.find('.connect-actions button').trigger('click')
    await flushPromises()

    expect(setAllowedDomains).toHaveBeenCalledWith('w-sales-0001', ['www.example.org', 'shop.example.com'])
    expect(returned().searchParams.get('widget_id')).toBe('w-sales-0001')
  })

  it('never widens the list unless asked: the box starts unticked', async () => {
    getAllowedDomains.mockResolvedValue(['www.example.org'])
    const wrapper = mountView()
    await flushPromises()

    expect((wrapper.find('.connect-domain input').element as HTMLInputElement).checked).toBe(false)
    await wrapper.find('.connect-actions button').trigger('click')
    await flushPromises()

    expect(setAllowedDomains).not.toHaveBeenCalled()
    expect(assign).toHaveBeenCalledOnce()
  })

  it('stays on the page and says why when the site cannot be added', async () => {
    getAllowedDomains.mockResolvedValue(['www.example.org'])
    setAllowedDomains.mockRejectedValue(new Error('403'))
    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('.connect-domain input').setValue(true)
    await wrapper.find('.connect-actions button').trigger('click')
    await flushPromises()

    expect(assign).not.toHaveBeenCalled()
    expect(wrapper.find('[role="alert"]').text()).toContain('shop.example.com')
    expect(wrapper.find('.connect-actions button').attributes('disabled')).toBeUndefined()
  })

  it('says nothing about domains for a widget allowed everywhere', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.connect-domain').exists()).toBe(false)
  })

  it('returns to WordPress as cancelled', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper.findAll('.connect-actions button')[1].trigger('click')

    expect(returned().searchParams.get('error')).toBe('cancelled')
    expect(returned().searchParams.has('widget_id')).toBe(false)
  })

  it('points to creating an agent when there is none', async () => {
    getWidgets.mockResolvedValue([])
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain("don't have an AI agent")
    expect(wrapper.find('.connect-actions').exists()).toBe(false)
  })

  it('offers a retry hint when the agents cannot be loaded', async () => {
    getWidgets.mockRejectedValue(new Error('500'))
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toContain("couldn't load your agents")
  })

  it('refuses a link that would return somewhere other than the plugin', async () => {
    query.return_url = 'https://evil.example/collect?action=chattermate_connect'
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe("This link isn't complete")
    expect(getWidgets).not.toHaveBeenCalled()
  })

  describe('teaching the agent the site (hosted)', () => {
    beforeEach(() => {
      enterprise.connectToken = vi.fn().mockResolvedValue('tok-123')
      Object.assign(query, { site_url: 'https://shop.example/', store: '1' })
    })

    it('is ticked by default and sends the token back with the widget', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.learn-option').text()).toContain('store shop.example')

      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()

      expect(enterprise.connectToken).toHaveBeenCalledWith('w-sales-0001', 'https://shop.example/')
      expect(returned().searchParams.get('connect_token')).toBe('tok-123')
      expect(returned().searchParams.get('widget_id')).toBe('w-sales-0001')
    })

    it('connects without learning when unticked', async () => {
      const wrapper = mountView()
      await flushPromises()
      await wrapper.find('.learn-option input').setValue(false)
      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()

      expect(enterprise.connectToken).not.toHaveBeenCalled()
      expect(returned().searchParams.has('connect_token')).toBe(false)
    })

    it('stays on the page and says why when learning cannot be set up', async () => {
      enterprise.connectToken!.mockRejectedValue(new Error('403'))
      const wrapper = mountView()
      await flushPromises()
      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()

      expect(assign).not.toHaveBeenCalled()
      expect(wrapper.find('.connect-error').text()).toContain("couldn't set up learning for shop.example")
      expect(wrapper.find('.connect-actions button').attributes('disabled')).toBeUndefined()
    })
  })

  it('offers no learning and sends no token in the open-source build', async () => {
    query.site_url = 'https://shop.example/'
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('.learn-option').exists()).toBe(false)
    await wrapper.find('.connect-actions button').trigger('click')
    await flushPromises()
    expect(returned().searchParams.has('connect_token')).toBe(false)
  })
})
