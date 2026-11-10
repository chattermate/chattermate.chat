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

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomizationSection from '@/components/agent/CustomizationSection.vue'
import ColorSwatchPicker from '@/components/agent/ColorSwatchPicker.vue'
import { launcherSummary } from '@/composables/useLauncherSettings'
import { LAUNCHER_DEFAULTS } from '@/webclient/launcher-style'

const stubs = { 'font-awesome-icon': true }

describe('CustomizationSection', () => {
  const section = (open: boolean) => mount(CustomizationSection, {
    props: { id: 'launcher', title: 'Launcher', summary: 'Small · Circle', open },
    slots: { default: '<p>inside</p>' },
    global: { stubs },
  })

  it('is a region named by its title', () => {
    const wrapper = section(true)
    const labelledBy = wrapper.get('section').attributes('aria-labelledby')
    expect(wrapper.get(`#${labelledBy}`).text()).toBe('Launcher')
  })

  it('closed: says what is inside and hides the body', () => {
    const wrapper = section(false)
    const toggle = wrapper.get('button')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.attributes('aria-controls')).toBe('launcher-body')
    expect(wrapper.text()).toContain('Small · Circle')
    expect(wrapper.get('#launcher-body').isVisible()).toBe(false)
  })

  it('open: shows the body', () => {
    const wrapper = section(true)
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#launcher-body').isVisible()).toBe(true)
  })

  it('brings its header to the top of the scrolling panel when opened', async () => {
    const panel = document.createElement('div')
    panel.style.overflowY = 'auto'
    Object.defineProperty(panel, 'scrollHeight', { value: 2000 })
    Object.defineProperty(panel, 'clientHeight', { value: 600 })
    panel.getBoundingClientRect = () => ({ top: 100 } as DOMRect)
    panel.scrollTop = 900
    document.body.appendChild(panel)
    const wrapper = mount(CustomizationSection, {
      props: { id: 'launcher', title: 'Launcher', summary: '', open: false },
      attachTo: panel,
      global: { stubs },
    })
    wrapper.get('section').element.getBoundingClientRect = () => ({ top: -300 } as DOMRect)
    await wrapper.setProps({ open: true })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(panel.scrollTop).toBe(500)
    wrapper.unmount()
    panel.remove()
  })

  it('does not move anything when closed', async () => {
    const wrapper = section(true)
    const scroll = vi.fn()
    wrapper.get('section').element.scrollIntoView = scroll
    await wrapper.setProps({ open: false })
    expect(scroll).not.toHaveBeenCalled()
  })

  it('asks to toggle when its header is clicked', async () => {
    const wrapper = section(false)
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})

describe('ColorSwatchPicker', () => {
  const picker = (modelValue?: string) => mount(ColorSwatchPicker, {
    props: { modelValue, swatches: ['#C9F24E', '#6EA8FF'], label: 'Launcher color' },
  })

  it('marks the current colour, whatever its case', () => {
    const radios = picker('#6ea8ff').findAll('[role="radio"]')
    expect(radios.map((radio) => radio.attributes('aria-checked'))).toEqual(['false', 'true'])
  })

  it('a colour not in the swatches checks none', () => {
    expect(picker('#123456').findAll('[aria-checked="true"]')).toHaveLength(0)
  })

  it('picks a swatch', async () => {
    const wrapper = picker('#6EA8FF')
    await wrapper.get('[aria-label="#C9F24E"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['#C9F24E']])
  })

  it('takes a custom colour', async () => {
    const wrapper = picker()
    const input = wrapper.get('input[type="color"]')
    await input.setValue('#112233')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['#112233'])
    expect(input.attributes('aria-label')).toBe('Launcher color, custom')
  })
})

describe('launcherSummary', () => {
  it('names each choice', () => {
    expect(launcherSummary(LAUNCHER_DEFAULTS)).toBe('Large · Bubble · Dots · Classic')
    expect(launcherSummary({ ...LAUNCHER_DEFAULTS, icon: 'logo', size: 'sm', animation: 'swoosh' }))
      .toBe('Small · Bubble · Your logo · Swoosh')
  })
})
