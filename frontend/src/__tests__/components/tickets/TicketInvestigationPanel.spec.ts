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

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import TicketInvestigationPanel from '../../../components/tickets/TicketInvestigationPanel.vue'
import type { InvestigationDetail, InvestigationRun } from '../../../types/ticket'

const baseRun: InvestigationRun = {
  id: 'r1',
  run_type: 'investigation',
  status: 'completed',
  trigger: 'manual',
  tool_calls_used: 0,
}

const mountPanel = (run: Partial<InvestigationRun>) =>
  mount(TicketInvestigationPanel, {
    props: {
      investigation: {
        run: { ...baseRun, ...run },
        hypotheses: [],
        events: [],
      } as InvestigationDetail,
    },
  })

describe('TicketInvestigationPanel connector warning', () => {
  it('warns when the run loaded fewer connectors than configured', () => {
    const wrapper = mountPanel({
      connector_status: {
        configured: 1,
        loaded: 0,
        failed: [{ name: 'Elasticsearch', error: "[Errno 2] No such file or directory: 'npx'" }],
      },
    })
    const warning = wrapper.find('.connector-warning')
    expect(warning.exists()).toBe(true)
    expect(warning.text()).toContain('0 of 1 configured connector')
    expect(warning.text()).toContain('Elasticsearch')
    expect(warning.text()).toContain('npx')
  })

  it('stays silent when every configured connector loaded', () => {
    const wrapper = mountPanel({
      connector_status: { configured: 2, loaded: 2, failed: [] },
    })
    expect(wrapper.find('.connector-warning').exists()).toBe(false)
  })

  it('warns when every connector loaded but the provider refused their tools', () => {
    // The #303 case: nothing "failed", so the loaded-vs-configured check alone
    // reports a clean run that gathered no evidence at all.
    const wrapper = mountPanel({
      connector_status: {
        configured: 1,
        loaded: 1,
        failed: [],
        provider_errors: ["The model provider rejected a connected tool's schema."],
      },
    })
    const warning = wrapper.find('.connector-warning')
    expect(warning.exists()).toBe(true)
    expect(warning.text()).toContain("couldn't be used")
    expect(warning.text()).toContain('rejected a connected tool')
  })

  it('stays silent when the run has no connector status (older runs)', () => {
    const wrapper = mountPanel({})
    expect(wrapper.find('.connector-warning').exists()).toBe(false)
  })
})

describe('TicketInvestigationPanel errored tool calls', () => {
  /**
   * A connector can come up, load its tools, and then error on every query.
   * That reports loaded === configured with no provider errors, so before
   * #318 the run rendered completely clean with a confident wrong answer.
   */
  it('warns when every tool call errored, even with all connectors loaded', () => {
    const wrapper = mountPanel({
      connector_status: {
        configured: 1,
        loaded: 1,
        failed: [],
        tool_calls: 3,
        tool_calls_failed: 3,
      },
    })

    const text = wrapper.find('.connector-warning').text()
    expect(text).toContain('3 of 3 tool calls errored')
    expect(text).toContain('no finding here is evidence-backed')
  })

  it('reports a partial failure without claiming nothing was gathered', () => {
    const wrapper = mountPanel({
      connector_status: {
        configured: 1,
        loaded: 1,
        failed: [],
        tool_calls: 4,
        tool_calls_failed: 1,
      },
    })

    const text = wrapper.find('.connector-warning').text()
    expect(text).toContain('1 of 4 tool calls errored')
    expect(text).not.toContain('evidence-backed')
  })

  it('stays silent on a clean run', () => {
    const wrapper = mountPanel({
      connector_status: {
        configured: 2,
        loaded: 2,
        failed: [],
        tool_calls: 5,
        tool_calls_failed: 0,
      },
    })

    expect(wrapper.find('.connector-warning').exists()).toBe(false)
  })

  it('handles a run recorded before these counts existed', () => {
    const wrapper = mountPanel({
      connector_status: { configured: 1, loaded: 1, failed: [] },
    })

    expect(wrapper.find('.connector-warning').exists()).toBe(false)
  })
})
