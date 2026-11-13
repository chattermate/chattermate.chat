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

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UpgradeCard from '@/components/agent/UpgradeCard.vue'
import { FEATURE_GATES } from '@/components/agent/featureGates'

const stubs = { 'font-awesome-icon': { template: '<i class="fa" />' } }

describe('UpgradeCard', () => {
  it('says what the gated feature does, and its button names it', () => {
    const card = mount(UpgradeCard, { props: { gate: 'follow-ups', lock: true }, global: { stubs } })
    expect(card.text()).toContain(FEATURE_GATES['follow-ups'].description)
    expect(card.get('button').attributes('aria-label')).toBe('Upgrade for Follow-up questions')
    expect(card.findAll('.fa')).toHaveLength(2)
  })

  it('takes a line of its own, without a lock', () => {
    const card = mount(UpgradeCard, { props: { message: 'Your own logo is on paid plans.' }, global: { stubs } })
    expect(card.text()).toContain('Your own logo is on paid plans.')
    expect(card.get('button').attributes('aria-label')).toBeUndefined()
    expect(card.findAll('.fa')).toHaveLength(1)
  })

  it('asks for the upgrade', async () => {
    const card = mount(UpgradeCard, { props: { gate: 'quick-actions' }, global: { stubs } })
    await card.get('button').trigger('click')
    expect(card.emitted('upgrade')).toHaveLength(1)
  })
})
