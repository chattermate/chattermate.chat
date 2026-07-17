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

import MessengerPagePicker from '../../../components/integrations/MessengerPagePicker.vue'

const PAGES = [
  { id: 'PAGE1', name: 'Acme Support' },
  { id: 'PAGE2', name: 'Acme Sales' },
]

const mountPicker = (connecting = false) =>
  mount(MessengerPagePicker, {
    props: { pages: PAGES, connecting },
    global: { stubs: { 'font-awesome-icon': true } },
  })

describe('MessengerPagePicker', () => {
  it('renders one row per Page', () => {
    const wrapper = mountPicker()
    expect(wrapper.findAll('.picker-row')).toHaveLength(2)
    expect(wrapper.text()).toContain('Acme Support')
    expect(wrapper.text()).toContain('Acme Sales')
  })

  it('emits select with the picked Page id', async () => {
    const wrapper = mountPicker()
    await wrapper.findAll('.picker-row')[1].trigger('click')
    expect(wrapper.emitted('select')).toEqual([['PAGE2']])
  })

  it('locks every row while a connect is in flight', () => {
    const wrapper = mountPicker(true)
    const rows = wrapper.findAll('.picker-row')
    expect(rows.every((row) => row.attributes('disabled') !== undefined)).toBe(true)
  })
})
