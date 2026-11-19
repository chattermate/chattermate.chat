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

import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getOrganizationConfig = vi.fn()
const setupAI = vi.fn()
vi.mock('@/services/ai', () => ({
  aiService: {
    getOrganizationConfig: (...args: unknown[]) => getOrganizationConfig(...args),
    setupAI: (...args: unknown[]) => setupAI(...args),
  },
}))
const getOrganizationAgents = vi.fn()
const createAgent = vi.fn()
vi.mock('@/services/agent', () => ({
  agentService: {
    getOrganizationAgents: (...args: unknown[]) => getOrganizationAgents(...args),
    createAgent: (...args: unknown[]) => createAgent(...args),
  },
}))
const createAgentWidget = vi.fn()
vi.mock('@/services/widget', () => ({
  widgetService: { createAgentWidget: (...args: unknown[]) => createAgentWidget(...args) },
}))

import { ensureAiConfig } from '@/utils/aiConfig'
import { agentWithoutWidget, createSiteWidget, siteAgentName } from '@/utils/siteAgent'
import { AGENT_TYPE_DEFAULTS } from '@/utils/agentDefaults'

const httpError = (status: number) =>
  new AxiosError(String(status), String(status), undefined, undefined, {
    status, statusText: '', headers: {}, config: { headers: new AxiosHeaders() }, data: {},
  })

beforeEach(() => {
  vi.clearAllMocks()
  getOrganizationConfig.mockResolvedValue({ model_type: 'CHATTERMATE' })
  getOrganizationAgents.mockResolvedValue([])
  createAgent.mockImplementation(async (data) => ({ id: 'a-1', ...data }))
  createAgentWidget.mockResolvedValue({ id: 'w-1' })
})

describe('ensureAiConfig', () => {
  it('is ready when the organization already has a model', async () => {
    expect(await ensureAiConfig(false)).toBe(true)
    expect(setupAI).not.toHaveBeenCalled()
  })

  it('switches on the managed AI when there is none and it is available', async () => {
    getOrganizationConfig.mockRejectedValue(httpError(404))
    expect(await ensureAiConfig(true)).toBe(true)
    expect(setupAI).toHaveBeenCalledWith({ model_type: 'CHATTERMATE', model_name: 'chattermate', api_key: '' })
  })

  it('asks for a provider in open source', async () => {
    getOrganizationConfig.mockRejectedValue(httpError(404))
    expect(await ensureAiConfig(false)).toBe(false)
    expect(setupAI).not.toHaveBeenCalled()
  })

  it('passes on any other failure', async () => {
    getOrganizationConfig.mockRejectedValue(httpError(500))
    await expect(ensureAiConfig(true)).rejects.toBeInstanceOf(AxiosError)
    expect(setupAI).not.toHaveBeenCalled()
  })
})

describe('siteAgentName', () => {
  it("uses the site's name, else its host", () => {
    expect(siteAgentName(' Larkfield Goods ', 'shop.example.com')).toBe('Larkfield Goods')
    expect(siteAgentName('', 'shop.example.com')).toBe('shop.example.com')
  })

  it('keeps a long name short', () => {
    expect(siteAgentName('x'.repeat(200), 'a.example')).toHaveLength(60)
  })
})

describe('createSiteWidget', () => {
  it('makes a support agent named after the site, and its widget', async () => {
    const widget = await createSiteWidget('Larkfield Goods', true)

    expect(createAgent).toHaveBeenCalledWith({
      name: 'Larkfield Goods',
      display_name: 'Larkfield Goods',
      agent_type: 'customer_support',
      instructions: [AGENT_TYPE_DEFAULTS.customer_support],
      is_active: true,
      use_workflow: false,
    })
    expect(createAgentWidget).toHaveBeenCalledWith('a-1', 'Larkfield Goods')
    expect(widget).toEqual({ id: 'w-1', agent: { name: 'Larkfield Goods', display_name: 'Larkfield Goods' } })
  })

  it('gives the agent the page offered the widget, not a second agent', async () => {
    const offered = { id: 'a-old', name: 'Support', display_name: 'Mia' } as never
    const widget = await createSiteWidget('Larkfield Goods', true, offered)

    expect(createAgent).not.toHaveBeenCalled()
    expect(createAgentWidget).toHaveBeenCalledWith('a-old', 'Mia')
    expect(widget).toEqual({ id: 'w-1', agent: { name: 'Support', display_name: 'Mia' } })
  })

  it('makes nothing when open source still needs an AI provider', async () => {
    getOrganizationConfig.mockRejectedValue(httpError(404))
    expect(await createSiteWidget('Larkfield Goods', false)).toBeNull()
    expect(createAgent).not.toHaveBeenCalled()
    expect(createAgentWidget).not.toHaveBeenCalled()
  })
})

describe('agentWithoutWidget', () => {
  it('offers an active agent the account already has', async () => {
    getOrganizationAgents.mockResolvedValue([
      { id: 'a-off', name: 'Old test', is_active: false },
      { id: 'a-on', name: 'Support', is_active: true },
    ])
    expect(await agentWithoutWidget()).toMatchObject({ id: 'a-on' })
  })

  it('offers none when there are only inactive agents, or none at all', async () => {
    getOrganizationAgents.mockResolvedValue([{ id: 'a-off', name: 'Old test', is_active: false }])
    expect(await agentWithoutWidget()).toBeNull()
    getOrganizationAgents.mockResolvedValue([])
    expect(await agentWithoutWidget()).toBeNull()
  })
})
