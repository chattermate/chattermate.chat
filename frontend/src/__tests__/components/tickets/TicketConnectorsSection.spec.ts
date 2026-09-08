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

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import TicketConnectorsSection from '@/components/tickets/TicketConnectorsSection.vue'
import { mcpService } from '@/services/mcp'
import type { MCPTool } from '@/types/mcp'

vi.mock('@/services/mcp', () => ({
  mcpService: {
    getOrganizationMCPTools: vi.fn(),
    createMCPTool: vi.fn(),
    updateMCPTool: vi.fn(),
    deleteMCPTool: vi.fn(),
    getMCPToolReferences: vi.fn(),
  },
}))
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const CONNECTOR: MCPTool = {
  id: 7,
  name: 'Elastic prod',
  transport_type: 'http',
  enabled: true,
  url: 'https://kibana/api/agent_builder/mcp',
  usage_guidance: 'Order id is fields.order_ref.',
  organization_id: 'org-1',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z',
}

function mountIt(connectors: MCPTool[] = []) {
  vi.mocked(mcpService.getOrganizationMCPTools).mockResolvedValue(connectors)
  return mount(TicketConnectorsSection, {
    props: { selectedIds: [] },
    global: { stubs: { 'font-awesome-icon': true } },
  })
}

describe('TicketConnectorsSection guidance', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends the guidance the operator wrote when creating a connector', async () => {
    vi.mocked(mcpService.createMCPTool).mockResolvedValue({ ...CONNECTOR, id: 9 })
    const wrapper = mountIt()
    await flushPromises()

    await wrapper.findAll('.preset-tile').at(-1)!.trigger('click')
    await wrapper.find('.field-input').setValue('Elastic prod')
    await wrapper.find('.guidance-input').setValue('Order id is fields.order_ref.')
    await wrapper.find('.connect-btn').trigger('click')
    await flushPromises()

    expect(vi.mocked(mcpService.createMCPTool).mock.calls[0][0]).toMatchObject({
      usage_guidance: 'Order id is fields.order_ref.',
    })
  })

  it('sends null rather than an empty string when no guidance is written', async () => {
    vi.mocked(mcpService.createMCPTool).mockResolvedValue({ ...CONNECTOR, id: 9 })
    const wrapper = mountIt()
    await flushPromises()

    await wrapper.findAll('.preset-tile').at(-1)!.trigger('click')
    await wrapper.find('.field-input').setValue('Bare connector')
    await wrapper.find('.connect-btn').trigger('click')
    await flushPromises()

    expect(vi.mocked(mcpService.createMCPTool).mock.calls[0][0].usage_guidance).toBeNull()
  })

  it('never seeds guidance from a preset description', async () => {
    /**
     * A preset's `desc` is a one-line marketing subtitle ("Errors, issues and
     * traces"). Letting it become prompt text is exactly the failure this
     * field exists to fix, so it must stay empty even though `description`
     * is filled.
     */
    const wrapper = mountIt()
    await flushPromises()

    await wrapper.findAll('.preset-tile')[0].trigger('click')

    expect((wrapper.find('.guidance-input').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.find('.field-input').element as HTMLInputElement).value).toBe('Grafana')
  })

  it('loads existing guidance into the edit form and marks the row as guided', async () => {
    const wrapper = mountIt([CONNECTOR])
    await flushPromises()

    expect(wrapper.find('.guided-tag').exists()).toBe(true)

    await wrapper.find('.row-btn').trigger('click')
    expect((wrapper.find('.guidance-input').element as HTMLTextAreaElement).value).toBe(
      'Order id is fields.order_ref.',
    )
  })

  it('shows no guided chip for an undocumented connector', async () => {
    const wrapper = mountIt([{ ...CONNECTOR, usage_guidance: null }])
    await flushPromises()

    expect(wrapper.find('.guided-tag').exists()).toBe(false)
  })
})
