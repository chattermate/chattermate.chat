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
import GuidanceTextarea from '@/components/common/GuidanceTextarea.vue'
import { MAX_GUIDANCE_CHARS } from '@/utils/mcp'

const EXAMPLE = 'Indices: app-logs-*.\nOrder id is fields.order_ref.'

function mountIt(modelValue: string | null = '', example = EXAMPLE) {
  return mount(GuidanceTextarea, {
    props: { modelValue, label: 'How to query this source', hint: 'A hint.', example },
    global: { stubs: { 'font-awesome-icon': true } },
  })
}

describe('GuidanceTextarea', () => {
  it('emits what the operator types', async () => {
    const wrapper = mountIt()
    await wrapper.find('textarea').setValue('app-logs-*')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['app-logs-*'])
  })

  it('caps input at the limit the backend enforces', () => {
    expect(mountIt().find('textarea').attributes('maxlength')).toBe(String(MAX_GUIDANCE_CHARS))
  })

  it('keeps the example hidden until asked for', async () => {
    const wrapper = mountIt()
    expect(wrapper.find('.guidance-example').exists()).toBe(false)

    await wrapper.find('.example-toggle').trigger('click')
    expect(wrapper.find('.example-text').text()).toContain('fields.order_ref')
  })

  it('offers the example as a starting point only while the field is empty', async () => {
    const empty = mountIt('')
    await empty.find('.example-toggle').trigger('click')
    expect(empty.find('.example-use').exists()).toBe(true)

    await empty.find('.example-use').trigger('click')
    expect(empty.emitted('update:modelValue')?.[0]).toEqual([EXAMPLE])

    // With real work in the box the button is gone, so it can never clobber it.
    const written = mountIt('my own notes')
    await written.find('.example-toggle').trigger('click')
    expect(written.find('.example-use').exists()).toBe(false)
  })

  it('warns as the operator approaches the limit', async () => {
    const under = mountIt('x'.repeat(10))
    expect(under.find('.guidance-count').classes()).not.toContain('near')

    const near = mountIt('x'.repeat(MAX_GUIDANCE_CHARS))
    expect(near.find('.guidance-count').classes()).toContain('near')
  })

  it('hides the disclosure entirely when no example is supplied', () => {
    expect(mountIt('', '').find('.example-toggle').exists()).toBe(false)
  })

  it('survives the null the API returns for an undocumented connector', async () => {
    const wrapper = mountIt(null)
    expect(wrapper.find('.guidance-count').text()).toContain('0 /')

    // And still offers the example, since the field is effectively empty.
    await wrapper.find('.example-toggle').trigger('click')
    expect(wrapper.find('.example-use').exists()).toBe(true)
  })

  it('labels the textarea for screen readers', () => {
    expect(mountIt().find('textarea').attributes('aria-label')).toBe('How to query this source')
  })
})