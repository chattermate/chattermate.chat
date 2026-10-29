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

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const kb = vi.hoisted(() => ({
  getKnowledgeByAgent: vi.fn(),
  getKnowledgeByOrganization: vi.fn(),
  getAgentQueueItems: vi.fn(),
  getOrgQueueItems: vi.fn(),
  addUrls: vi.fn(),
  deleteKnowledge: vi.fn(),
  linkToAgent: vi.fn(),
}))
const agents = vi.hoisted(() => ({ getOrganizationAgents: vi.fn() }))
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), custom: vi.fn(), dismiss: vi.fn() }))

vi.mock('@/services/knowledge', () => ({ knowledgeService: kb }))
vi.mock('@/services/agent', () => ({ agentService: agents }))
vi.mock('vue-sonner', () => ({ toast }))
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({ hasEnterpriseModule: false, loadModule: vi.fn(), moduleImports: {} }),
}))

import KnowledgeExplorer from '@/components/knowledge/KnowledgeExplorer.vue'

const ORG = 'org-1'
const AGENT = 'agent-1'
const LIMIT = 'Cannot add URLs: Maximum number of knowledge sources (1) would be exceeded'
const STAGING = { id: 413, name: 'https://reportage-alpha.vercel.app/en', type: 'website', agents: [], pages: [] }
const page = (knowledge: unknown[]) => ({ knowledge, pagination: { total: knowledge.length } })

const mountExplorer = async (mode: 'agent' | 'org') => {
  const wrapper = mount(KnowledgeExplorer, {
    props: { mode, organizationId: ORG, agentId: mode === 'agent' ? AGENT : undefined },
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  })
  await flushPromises()
  return wrapper
}
type Wrapper = Awaited<ReturnType<typeof mountExplorer>>
const warning = (wrapper: Wrapper) => wrapper.find('.banner--warn')

const addSite = async (wrapper: Wrapper, url = 'https://reportagebeyondeg.com') => {
  await wrapper.findAll('button').find((b) => b.text() === 'Add source')!.trigger('click')
  await wrapper.find('#kb-add-url').setValue(url)
}
const clickAdd = async (wrapper: Wrapper) => {
  await wrapper.find('.modal button.btn--primary').trigger('click')
  await flushPromises()
}

beforeEach(() => {
  vi.clearAllMocks()
  kb.getKnowledgeByAgent.mockResolvedValue(page([]))
  kb.getKnowledgeByOrganization.mockResolvedValue(page([]))
  kb.getAgentQueueItems.mockResolvedValue({ queue_items: [] })
  kb.getOrgQueueItems.mockResolvedValue({ queue_items: [] })
  kb.addUrls.mockResolvedValue({ queue_items: [{ id: 1, status: 'pending' }] })
  kb.deleteKnowledge.mockResolvedValue({})
  agents.getOrganizationAgents.mockResolvedValue([])
})

describe('KnowledgeExplorer: an agent with no knowledge', () => {
  it('warns, and points at the organization’s unlinked sources', async () => {
    kb.getKnowledgeByOrganization.mockResolvedValue(page([STAGING, { ...STAGING, id: 414 }]))
    const wrapper = await mountExplorer('agent')
    expect(warning(wrapper).text()).toContain('This agent isn’t using any knowledge')
    expect(warning(wrapper).text()).toContain('Your organization has 2 sources it could use.')

    await warning(wrapper).find('.banner__action').trigger('click')
    await flushPromises()
    expect(wrapper.findComponent({ name: 'KnowledgeLinkModal' }).exists()).toBe(true)
  })

  it('counts every organization source, not just the first page', async () => {
    // The count is read from a one-row page: the server's total is what matters
    kb.getKnowledgeByOrganization.mockResolvedValue({ knowledge: [STAGING], pagination: { total: 12, total_pages: 12 } })
    const wrapper = await mountExplorer('agent')
    expect(warning(wrapper).text()).toContain('Your organization has 12 sources it could use.')
  })

  it('with nothing in the organization either, offers to add a source', async () => {
    const wrapper = await mountExplorer('agent')
    expect(warning(wrapper).text()).not.toContain('could use')
    await warning(wrapper).find('.banner__action').trigger('click')
    expect(wrapper.find('#kb-add-url').exists()).toBe(true)
  })

  it('is quiet while its first crawl is still running', async () => {
    kb.getAgentQueueItems.mockResolvedValue({
      queue_items: [{ id: 9, source: 'https://x.com', source_type: 'website', status: 'processing', created_at: '' }],
    })
    const wrapper = await mountExplorer('agent')
    expect(warning(wrapper).exists()).toBe(false)
  })

  it('still warns when its only crawl failed', async () => {
    kb.getAgentQueueItems.mockResolvedValue({
      queue_items: [{ id: 9, source: 'https://x.com', source_type: 'website', status: 'failed', created_at: '' }],
    })
    const wrapper = await mountExplorer('agent')
    expect(warning(wrapper).exists()).toBe(true)
  })

  it('is quiet once a source is linked', async () => {
    kb.getKnowledgeByAgent.mockResolvedValue(page([STAGING]))
    const wrapper = await mountExplorer('agent')
    expect(warning(wrapper).exists()).toBe(false)
  })

  it('if the organization count fails to load, still warns (without a count)', async () => {
    kb.getKnowledgeByOrganization.mockRejectedValue(new Error('down'))
    const wrapper = await mountExplorer('agent')
    expect(warning(wrapper).text()).toContain('can only give general answers')
    expect(warning(wrapper).text()).not.toContain('could use')
  })

  it('is not claimed when the agent’s sources failed to load', async () => {
    kb.getKnowledgeByAgent.mockRejectedValue(new Error('down'))
    const wrapper = await mountExplorer('agent')
    expect(warning(wrapper).exists()).toBe(false)
    expect(wrapper.find('.banner[role="alert"]').text()).toContain('Failed to load knowledge sources')
  })

  it('never shows on the organization page', async () => {
    const wrapper = await mountExplorer('org')
    expect(warning(wrapper).exists()).toBe(false)
  })
})

describe('KnowledgeExplorer: the organization page', () => {
  it('flags a source no agent answers from', async () => {
    agents.getOrganizationAgents.mockResolvedValue([{ id: AGENT, name: 'reportage', display_name: 'Reportage' }])
    kb.getKnowledgeByOrganization.mockResolvedValue(
      page([STAGING, { ...STAGING, id: 414, name: 'https://reportagebeyondeg.com', agents: [{ id: AGENT, name: 'Reportage' }] }]),
    )
    const wrapper = await mountExplorer('org')
    const rows = wrapper.findAll('.src__row')
    expect(rows[0].find('.unlinked').text()).toBe('No agent')
    expect(rows[1].find('.unlinked').exists()).toBe(false)
  })

  it('does not flag anything when the organization has no agents yet', async () => {
    kb.getKnowledgeByOrganization.mockResolvedValue(page([STAGING]))
    const wrapper = await mountExplorer('org')
    expect(wrapper.find('.unlinked').exists()).toBe(false)
  })

  it('asks which agent when there are several, and sends that agent', async () => {
    agents.getOrganizationAgents.mockResolvedValue([
      { id: 'a-1', name: 'sales', display_name: 'Sales' },
      { id: 'a-2', name: 'support', display_name: '' },
    ])
    const wrapper = await mountExplorer('org')
    await addSite(wrapper)
    expect(wrapper.findAll('#kb-add-agent option').map((o) => o.text())).toContain('support')
    await wrapper.find('#kb-add-agent').setValue('a-2')
    await clickAdd(wrapper)
    expect(kb.addUrls).toHaveBeenCalledWith(ORG, ['https://reportagebeyondeg.com'], 'a-2', undefined, undefined, 'host')
  })
})

describe('KnowledgeExplorer: replacing a source at the plan limit', () => {
  const refuseOnce = () => kb.addUrls.mockRejectedValueOnce(new Error(LIMIT))

  it('the agent tab’s refused add offers the organization’s sources to replace, not a dead-end toast', async () => {
    kb.getKnowledgeByOrganization.mockResolvedValue(page([STAGING]))
    refuseOnce()
    const wrapper = await mountExplorer('agent')
    await addSite(wrapper)
    await clickAdd(wrapper)

    expect(toast.error).not.toHaveBeenCalled()
    expect(wrapper.find('.limit__name').text()).toBe(STAGING.name)
  })

  it('replace deletes the old source, then adds the new one to this agent', async () => {
    kb.getKnowledgeByOrganization.mockResolvedValue(page([STAGING]))
    refuseOnce()
    const wrapper = await mountExplorer('agent')
    await addSite(wrapper)
    await clickAdd(wrapper)

    await wrapper.find('.limit__replace').trigger('click')
    await flushPromises()
    expect(kb.deleteKnowledge).toHaveBeenCalledWith(413)
    expect(kb.addUrls).toHaveBeenLastCalledWith(ORG, ['https://reportagebeyondeg.com'], AGENT, undefined, undefined, 'host')
    expect(kb.deleteKnowledge.mock.invocationCallOrder[0]).toBeLessThan(kb.addUrls.mock.invocationCallOrder[1])
    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('if the delete fails, nothing is added and the dialog stays open', async () => {
    kb.getKnowledgeByOrganization.mockResolvedValue(page([STAGING]))
    refuseOnce()
    kb.deleteKnowledge.mockRejectedValueOnce(new Error('Delete failed'))
    const wrapper = await mountExplorer('agent')
    await addSite(wrapper)
    await clickAdd(wrapper)

    await wrapper.find('.limit__replace').trigger('click')
    await flushPromises()
    expect(kb.addUrls).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith('Could not replace source', { description: 'Delete failed' })
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('if the new add fails after the delete, the deleted source leaves the list', async () => {
    kb.getKnowledgeByOrganization.mockResolvedValue(page([STAGING]))
    kb.getKnowledgeByAgent.mockResolvedValueOnce(page([STAGING])).mockResolvedValue(page([]))
    refuseOnce()
    kb.addUrls.mockRejectedValueOnce(new Error('Failed to add URLs'))
    const wrapper = await mountExplorer('agent')
    await addSite(wrapper)
    await clickAdd(wrapper)

    await wrapper.find('.limit__replace').trigger('click')
    await flushPromises()
    expect(kb.deleteKnowledge).toHaveBeenCalledWith(413)
    expect(toast.error).toHaveBeenCalledWith('Could not add source', { description: 'Failed to add URLs' })
    expect(wrapper.find('.grid__tree').text()).not.toContain(STAGING.name)
  })

  it('reopening the dialog starts clean', async () => {
    kb.getKnowledgeByOrganization.mockResolvedValue(page([STAGING]))
    refuseOnce()
    const wrapper = await mountExplorer('agent')
    await addSite(wrapper)
    await clickAdd(wrapper)
    await wrapper.find('.modal .btn--ghost').trigger('click')

    await addSite(wrapper)
    expect(wrapper.find('.limit').exists()).toBe(false)
  })

  it('other failures keep the plain error toast', async () => {
    kb.addUrls.mockRejectedValueOnce(new Error('Failed to add URLs'))
    const wrapper = await mountExplorer('agent')
    await addSite(wrapper)
    await clickAdd(wrapper)
    expect(toast.error).toHaveBeenCalledWith('Could not add source', { description: 'Failed to add URLs' })
    expect(wrapper.find('.limit').exists()).toBe(false)
  })
})
