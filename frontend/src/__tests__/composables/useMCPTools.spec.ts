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
import { useMCPTools } from '@/composables/useMCPTools'
import { mcpService } from '@/services/mcp'

vi.mock('@/services/mcp', () => ({
  mcpService: {
    testMCPTool: vi.fn(),
  },
}))
vi.mock('vue-sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe('useMCPTools connection test', () => {
  beforeEach(() => {
    vi.mocked(mcpService.testMCPTool).mockReset()
  })

  it('stores the probe result per tool id', async () => {
    vi.mocked(mcpService.testMCPTool).mockResolvedValue({
      success: true,
      functions: ['search', 'get_index'],
      error: null,
    })
    const { testMCPTool, testResults, testingToolId } = useMCPTools('agent1')

    await testMCPTool(7)

    expect(testResults.value[7]).toEqual({
      success: true,
      functions: ['search', 'get_index'],
      error: null,
    })
    expect(testingToolId.value).toBeNull()
  })

  it('turns a request failure into a failed result for the tool', async () => {
    vi.mocked(mcpService.testMCPTool).mockRejectedValue({
      response: { data: { detail: 'MCP tool not found' } },
    })
    const { testMCPTool, testResults, testingToolId } = useMCPTools('agent1')

    await testMCPTool(9)

    expect(testResults.value[9]).toEqual({
      success: false,
      functions: [],
      error: 'MCP tool not found',
    })
    expect(testingToolId.value).toBeNull()
  })

  it('marks the tool as testing while the probe runs', async () => {
    let resolveProbe: (v: any) => void = () => {}
    vi.mocked(mcpService.testMCPTool).mockReturnValue(
      new Promise((resolve) => {
        resolveProbe = resolve
      }),
    )
    const { testMCPTool, testingToolId } = useMCPTools('agent1')

    const probe = testMCPTool(3)
    expect(testingToolId.value).toBe(3)
    resolveProbe({ success: true, functions: [], error: null })
    await probe
    expect(testingToolId.value).toBeNull()
  })
})

describe('useMCPTools guidance', () => {
  it('carries guidance through the create form and clears it on reset', () => {
    const { createForm, resetCreateForm, applyPreset, mcpPresets } = useMCPTools('agent-1')

    createForm.usage_guidance = 'Order id is fields.order_ref.'
    resetCreateForm()
    expect(createForm.usage_guidance).toBe('')

    // A preset's own description must never become prompt text.
    applyPreset(mcpPresets[0])
    expect(createForm.usage_guidance).toBe('')
    expect(createForm.description).toBe(mcpPresets[0].description)
  })

  it('loads a connector\'s stored guidance when editing it', () => {
    const { createForm, startEdit } = useMCPTools('agent-1')

    startEdit({
      id: 3,
      name: 'Elastic',
      transport_type: 'http',
      enabled: true,
      usage_guidance: 'Indices: app-logs-*.',
      organization_id: 'o',
      created_at: '',
      updated_at: '',
    } as any)

    expect(createForm.usage_guidance).toBe('Indices: app-logs-*.')
  })

  it('turns a null guidance from the API into an empty field', () => {
    const { createForm, startEdit } = useMCPTools('agent-1')

    startEdit({
      id: 4, name: 'Bare', transport_type: 'http', enabled: true,
      usage_guidance: null, organization_id: 'o', created_at: '', updated_at: '',
    } as any)

    expect(createForm.usage_guidance).toBe('')
  })
})
