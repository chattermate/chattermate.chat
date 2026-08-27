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
