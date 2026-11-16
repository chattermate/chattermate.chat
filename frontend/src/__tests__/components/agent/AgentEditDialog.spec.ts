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
import AgentEditDialog from '@/components/agent/AgentEditDialog.vue'
import { orbIndexForSeed, orbVariantToKeep } from '@/utils/orb'

const open = (props: Record<string, unknown> = {}) =>
  mount(AgentEditDialog, {
    props: { displayName: 'GlideAgent', role: 'Bodhiorchard Sales Guide', description: null, ...props },
    attachTo: document.body,
  })

describe('AgentEditDialog', () => {
  it('starts from the agent and emits the trimmed fields', async () => {
    const wrapper = open()
    const [name, role] = wrapper.findAll('input')
    expect((name.element as HTMLInputElement).value).toBe('GlideAgent')
    expect((role.element as HTMLInputElement).value).toBe('Bodhiorchard Sales Guide')

    await role.setValue('  GlideShip Sales Guide ')
    await wrapper.find('textarea').setValue(' Answers GlideShip questions. ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')?.[0]).toEqual([
      { display_name: 'GlideAgent', name: 'GlideShip Sales Guide', description: 'Answers GlideShip questions.' },
    ])
    wrapper.unmount()
  })

  it('never saves a blank role', async () => {
    const wrapper = open()
    await wrapper.findAll('input')[1].setValue('   ')

    expect(wrapper.find('.btn-primary').attributes('disabled')).toBeDefined()
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
    wrapper.unmount()
  })

  it('falls back to the role when the name is cleared', async () => {
    const wrapper = open()
    await wrapper.findAll('input')[0].setValue('')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')?.[0][0]).toMatchObject({ display_name: 'Bodhiorchard Sales Guide' })
    wrapper.unmount()
  })
})

describe('orbVariantToKeep', () => {
  it("keeps today's default orb when the role changes", () => {
    expect(orbVariantToKeep('Old role', 'New role', undefined)).toBe(orbIndexForSeed('Old role'))
  })

  it('does nothing for the same role or a chosen orb', () => {
    expect(orbVariantToKeep('Same', 'Same', undefined)).toBeNull()
    expect(orbVariantToKeep('Old', 'New', 3)).toBeNull()
  })
})
