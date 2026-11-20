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

// Making an agent for a new account (its own tests cover what it does)
const createSiteWidget = vi.fn()
const agentWithoutWidget = vi.fn()
vi.mock('@/utils/siteAgent', () => ({
  createSiteWidget: (...args: unknown[]) => createSiteWidget(...args),
  agentWithoutWidget: (...args: unknown[]) => agentWithoutWidget(...args),
  siteAgentName: (siteName: string, siteHost: string) => siteName || siteHost,
}))

// The hosted build's learn option and token service; an empty object is the open-source build
const enterprise: { connectToken?: ReturnType<typeof vi.fn> } = {}
const LearnOption = {
  props: ['siteHost', 'store'],
  template: '<div class="learn-option">{{ store ? "store" : "site" }} {{ siteHost }}</div>',
}
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({
    moduleImports: { wordpressLearnOption: 'learn-option', wordpressSites: 'sites' },
    hasEnterpriseModule: Boolean(enterprise.connectToken),
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

  describe('a new account with no agent yet', () => {
    const NEW_WIDGET = { id: 'w-new-0003', agent: { name: 'Larkfield Goods', display_name: 'Larkfield Goods' } }

    beforeEach(() => {
      getWidgets.mockResolvedValue([])
      agentWithoutWidget.mockResolvedValue(null)
      createSiteWidget.mockResolvedValue(NEW_WIDGET)
    })

    it('makes the agent named after the site and sends its widget back, with no click', async () => {
      mountView()
      await flushPromises()

      expect(createSiteWidget).toHaveBeenCalledWith('Larkfield Goods', false, null)
      expect(returned().origin + returned().pathname).toBe('https://shop.example.com/wp-admin/admin-post.php')
      expect(returned().searchParams.get('widget_id')).toBe('w-new-0003')
      expect(returned().searchParams.get('state')).toBe('nonce12345')
    })

    it('says what it is doing while it sets the agent up, never a list', async () => {
      createSiteWidget.mockReturnValue(new Promise(() => {}))
      const wrapper = mountView()
      await flushPromises()

      expect(wrapper.find('[role="status"]').text()).toContain('Setting up your AI agent from shop.example.com')
      expect(wrapper.find('.connect-agents').exists()).toBe(false)
      expect(wrapper.find('.connect-actions button').text()).toBe('Setting up…')
    })

    it('asks for an AI provider first in open source, without leaving', async () => {
      createSiteWidget.mockResolvedValue(null)
      const wrapper = mountView()
      await flushPromises()

      expect(wrapper.find('[role="alert"]').text()).toContain('needs an AI model first')
      expect(wrapper.find('.connect-actions button').text()).toBe('Create my AI agent and connect')
      expect(assign).not.toHaveBeenCalled()
    })

    it('says so when the agent cannot be made, and the button tries again', async () => {
      createSiteWidget.mockRejectedValueOnce(new Error('500'))
      const wrapper = mountView()
      await flushPromises()

      expect(wrapper.find('[role="alert"]').text()).toContain("couldn't create your AI agent")
      expect(assign).not.toHaveBeenCalled()

      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()
      expect(returned().searchParams.get('widget_id')).toBe('w-new-0003')
    })

    it('sets up an agent the account already has, by itself', async () => {
      const mia = { id: 'a-old', name: 'Support', display_name: 'Mia', is_active: true }
      agentWithoutWidget.mockResolvedValue(mia)
      createSiteWidget.mockResolvedValueOnce(null)
      const wrapper = mountView()
      await flushPromises()

      expect(createSiteWidget).toHaveBeenCalledWith('Larkfield Goods', false, mia)
      expect(wrapper.text()).toContain('Mia, your AI agent')
      expect(wrapper.find('.connect-actions button').text()).toBe('Connect my AI agent')
    })

    it('cancels back to the plugin when setting up stops', async () => {
      createSiteWidget.mockResolvedValue(null)
      const wrapper = mountView()
      await flushPromises()
      await wrapper.findAll('.connect-actions button')[1].trigger('click')

      expect(returned().searchParams.get('error')).toBe('cancelled')
    })
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
      Object.assign(query, { site_url: 'https://shop.example.com/', store: '1' })
    })

    it('is part of every connect: the token goes back with the widget', async () => {
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('.learn-option').text()).toContain('store shop.example.com')

      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()

      expect(enterprise.connectToken).toHaveBeenCalledWith('w-sales-0001', 'https://shop.example.com/', RETURN)
      expect(returned().searchParams.get('connect_token')).toBe('tok-123')
      expect(returned().searchParams.get('widget_id')).toBe('w-sales-0001')
    })

    it('stays on the page and says why when learning cannot be set up', async () => {
      enterprise.connectToken!.mockRejectedValue(new Error('403'))
      const wrapper = mountView()
      await flushPromises()
      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()

      expect(assign).not.toHaveBeenCalled()
      expect(wrapper.find('.connect-error').text()).toContain("couldn't set up learning for shop.example.com")
      expect(wrapper.find('.connect-actions button').attributes('disabled')).toBeUndefined()
    })

    it('says a missing permission is the reason, not to try again', async () => {
      enterprise.connectToken!.mockRejectedValue({ response: { status: 403 } })
      const wrapper = mountView()
      await flushPromises()
      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()

      expect(assign).not.toHaveBeenCalled()
      expect(wrapper.find('.connect-error').text()).toContain('needs permission to manage knowledge')
      expect(wrapper.find('.connect-error').text()).not.toContain('try again')
    })

    it('offers no way to connect without learning: trying again sends the token', async () => {
      enterprise.connectToken!.mockRejectedValueOnce(new Error('503'))
      const wrapper = mountView()
      await flushPromises()
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()
      expect(assign).not.toHaveBeenCalled()

      await wrapper.find('.connect-actions button').trigger('click')
      await flushPromises()
      expect(returned().searchParams.get('connect_token')).toBe('tok-123')
    })

    it("teaches a new account's agent the site too, on the managed AI", async () => {
      getWidgets.mockResolvedValue([])
      agentWithoutWidget.mockResolvedValue(null)
      createSiteWidget.mockResolvedValue({ id: 'w-new-0003', agent: { name: 'Larkfield Goods' } })
      mountView()
      await flushPromises()

      expect(createSiteWidget).toHaveBeenCalledWith('Larkfield Goods', true, null)
      expect(enterprise.connectToken).toHaveBeenCalledWith('w-new-0003', 'https://shop.example.com/', RETURN)
      expect(returned().searchParams.get('connect_token')).toBe('tok-123')
    })
  })

  it('never offers learning when the admin it returns to is another host than the site', async () => {
    enterprise.connectToken = vi.fn().mockResolvedValue('tok-123')
    Object.assign(query, { site_url: 'https://victim-shop.example/', store: '1' })
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('.learn-option').exists()).toBe(false)
    await wrapper.find('.connect-actions button').trigger('click')
    await flushPromises()
    expect(enterprise.connectToken).not.toHaveBeenCalled()
    expect(returned().searchParams.has('connect_token')).toBe(false)
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
