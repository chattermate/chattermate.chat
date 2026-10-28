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

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KnowledgeAddSourceModal from '../../../components/knowledge/KnowledgeAddSourceModal.vue'

const routes = vi.hoisted(() => ({ hasPlans: true }))
vi.mock('vue-router', () => ({ useRouter: () => ({ hasRoute: (name: string) => name === 'subscription' && routes.hasPlans }) }))

const SALES = { id: 'a-sales', name: 'Sales' }
const SUPPORT = { id: 'a-support', name: 'Support' }
const LIMIT = 'Cannot add URLs: Maximum number of knowledge sources (1) would be exceeded'

type Props = InstanceType<typeof KnowledgeAddSourceModal>['$props']

const mountModal = async (props: Props = {}) => {
  const wrapper = mount(KnowledgeAddSourceModal, {
    props,
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :data-route="to.name"><slot /></a>' } } },
  })
  await wrapper.find('#kb-add-url').setValue('https://reportagebeyondeg.com')
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountModal>>
const addButton = (wrapper: Wrapper) => wrapper.find('button.btn--primary')
const submitted = (wrapper: Wrapper) => wrapper.emitted('submit')?.[0]?.[0] as Record<string, unknown>

describe('KnowledgeAddSourceModal: which agent answers from the source', () => {
  it('with several agents, asks which one and will not add until answered', async () => {
    const wrapper = await mountModal({ agents: [SALES, SUPPORT] })
    const options = wrapper.findAll('#kb-add-agent option').map((o) => o.text())
    expect(options).toEqual(['Choose an agent', 'Sales', 'Support', 'None for now'])
    expect(addButton(wrapper).attributes('disabled')).toBeDefined()

    await addButton(wrapper).trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('sends the chosen agent with the source', async () => {
    const wrapper = await mountModal({ agents: [SALES, SUPPORT] })
    await wrapper.find('#kb-add-agent').setValue('a-support')
    await addButton(wrapper).trigger('click')
    expect(submitted(wrapper)).toMatchObject({ type: 'website', agentId: 'a-support' })
  })

  it('"None for now" adds it unlinked and says what that means', async () => {
    const wrapper = await mountModal({ agents: [SALES, SUPPORT] })
    await wrapper.find('#kb-add-agent').setValue('none')
    expect(wrapper.text()).toContain('No agent will use it until you link it')
    await addButton(wrapper).trigger('click')
    expect(submitted(wrapper)).not.toHaveProperty('agentId')
  })

  it('with one agent, just says that agent will use it (the server links it)', async () => {
    const wrapper = await mountModal({ agents: [SALES] })
    expect(wrapper.find('#kb-add-agent').exists()).toBe(false)
    expect(wrapper.text()).toContain('Sales will answer from this source.')
    await addButton(wrapper).trigger('click')
    expect(submitted(wrapper)).not.toHaveProperty('agentId')
  })

  it('on an agent’s own tab (no agents passed) there is no question', async () => {
    const wrapper = await mountModal()
    expect(wrapper.find('#kb-add-agent').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('will answer from this source')
  })

  it('the choice applies to every source type', async () => {
    const wrapper = await mountModal({ agents: [SALES, SUPPORT] })
    await wrapper.find('#kb-add-agent').setValue('a-sales')
    await wrapper.findAll('.type').find((t) => t.text().includes('Text'))!.trigger('click')
    await wrapper.find('#kb-add-title').setValue('Refunds')
    await wrapper.find('#kb-add-content').setValue('14 days.')
    await addButton(wrapper).trigger('click')
    expect(submitted(wrapper)).toEqual({ type: 'text', title: 'Refunds', content: '14 days.', agentId: 'a-sales' })
  })
})

describe('KnowledgeAddSourceModal: the plan’s source limit', () => {
  const sources = [{ id: 413, name: 'https://reportage-alpha.vercel.app/en', usedBy: [] as string[] }]

  it('is not shown until the limit refuses an add', async () => {
    const wrapper = await mountModal({ replaceable: sources })
    expect(wrapper.find('.limit').exists()).toBe(false)
  })

  it('says the plan’s source is in use and offers to replace it', async () => {
    const wrapper = await mountModal({ limitMessage: LIMIT, replaceable: sources })
    expect(wrapper.find('.limit').text()).toContain('Your plan includes 1 knowledge source, and it’s in use.')
    expect(wrapper.find('.limit__name').text()).toBe('https://reportage-alpha.vercel.app/en')
    expect(wrapper.find('.limit__plans').attributes('data-route')).toBe('subscription')
  })

  it('without the plans page (community edition) it offers no plans link', async () => {
    routes.hasPlans = false
    try {
      const wrapper = await mountModal({ limitMessage: LIMIT, replaceable: sources })
      expect(wrapper.find('.limit__plans').exists()).toBe(false)
      expect(wrapper.find('.limit__replace').exists()).toBe(true)
    } finally {
      routes.hasPlans = true
    }
  })

  it('replace sends the old source and the new one, with the chosen agent', async () => {
    const wrapper = await mountModal({ limitMessage: LIMIT, replaceable: sources, agents: [SALES, SUPPORT] })
    await wrapper.find('#kb-add-agent').setValue('a-sales')
    await wrapper.find('.limit__replace').trigger('click')
    const [replacedId, payload] = wrapper.emitted('replace')![0]
    expect(replacedId).toBe(413)
    expect(payload).toMatchObject({ type: 'website', url: 'https://reportagebeyondeg.com', agentId: 'a-sales' })
  })

  it('replace waits for an agent choice too, and for an add in flight', async () => {
    const pending = await mountModal({ limitMessage: LIMIT, replaceable: sources, agents: [SALES, SUPPORT] })
    expect(pending.find('.limit__replace').attributes('disabled')).toBeDefined()

    const busy = await mountModal({ limitMessage: LIMIT, replaceable: sources, submitting: true })
    expect(busy.find('.limit__replace').attributes('disabled')).toBeDefined()
    await busy.find('.limit__replace').trigger('click')
    expect(busy.emitted('replace')).toBeUndefined()
  })

  it('says which agents lose a source before it is replaced', async () => {
    const wrapper = await mountModal({
      limitMessage: LIMIT,
      replaceable: [{ ...sources[0], usedBy: ['Sales', 'Support'] }, { id: 9, name: 'Pricing', usedBy: [] }],
    })
    const rows = wrapper.findAll('.limit__row')
    expect(rows[0].find('.limit__used').text()).toBe('Used by Sales, Support')
    expect(rows[1].find('.limit__used').exists()).toBe(false)
  })

  it('scrolls itself into view, since it opens below the form', async () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    await mountModal({ limitMessage: LIMIT, replaceable: sources })
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
  })

  it('counts several sources in the headline', async () => {
    const wrapper = await mountModal({
      limitMessage: 'Maximum number of knowledge sources (3) would be exceeded',
      replaceable: sources,
    })
    expect(wrapper.find('.limit__title').text()).toBe('Your plan includes 3 knowledge sources, and they’re all in use.')
  })

  it('without a number in the message, still explains', async () => {
    const wrapper = await mountModal({ limitMessage: 'Maximum number of knowledge sources reached', replaceable: sources })
    expect(wrapper.find('.limit__title').text()).toBe('Your plan’s knowledge sources are all in use.')
  })

  it('when only a crawl in progress fills the plan, says so instead of an empty list', async () => {
    const wrapper = await mountModal({ limitMessage: LIMIT, replaceable: [] })
    expect(wrapper.find('.limit__replace').exists()).toBe(false)
    expect(wrapper.text()).toContain('A crawl still in progress counts too.')
  })
})
