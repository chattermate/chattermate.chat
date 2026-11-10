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
import LauncherPreviewStage from '@/components/agent/LauncherPreviewStage.vue'
import { BRAND_COLORS } from '@/config/brand'
import { LAUNCHER_DEFAULTS, launcherLook, type LauncherStyle } from '@/webclient/launcher-style'

function stage(style: Partial<LauncherStyle> = {}, props: Record<string, unknown> = {}, logoUrl: string | null = null) {
  return mount(LauncherPreviewStage, {
    props: {
      look: launcherLook({ ...LAUNCHER_DEFAULTS, ...style }, logoUrl),
      logoUrl,
      brand: '#2F5BEA',
      agentName: 'Support',
      side: 'right',
      windowWidth: 400,
      windowHeight: 560,
      greeting: 'Hello!',
      greetingCount: 2,
      hidden: false,
      backdrop: 'light',
      ...props,
    },
    global: { stubs: { 'font-awesome-icon': true } },
  })
}

const launcherButton = (wrapper: ReturnType<typeof stage>) => wrapper.find('.launcher-stage-button')

describe('LauncherPreviewStage', () => {
  it('draws the launcher at real size', () => {
    expect(launcherButton(stage({ size: 'sm' })).attributes('style')).toContain('width: 48px')
  })

  it('shows the greeting and its count until opened', async () => {
    const wrapper = stage()
    expect(wrapper.find('.greeting').text()).toBe('Hello!')
    expect(wrapper.find('.stage-badge').text()).toBe('2')
    await launcherButton(wrapper).trigger('click')
    expect(wrapper.find('.greeting').exists()).toBe(false)
    expect(wrapper.find('.stage-badge').exists()).toBe(false)
  })

  it('has no greeting or badge without one', () => {
    const wrapper = stage({}, { greeting: null, greetingCount: 0 })
    expect(wrapper.find('.greeting').exists()).toBe(false)
    expect(wrapper.find('.stage-badge').exists()).toBe(false)
  })

  it('opens the window at 75%', async () => {
    const wrapper = stage({}, { windowWidth: 360, windowHeight: 520 })
    await launcherButton(wrapper).trigger('click')
    const style = wrapper.find('.chat-window').attributes('style')
    expect(style).toContain('width: 270px')
    expect(style).toContain('height: 390px')
    expect(launcherButton(wrapper).attributes('aria-expanded')).toBe('true')
    expect(launcherButton(wrapper).attributes('aria-label')).toBe('Close chat')
  })

  it('never lets a tall window run off the stage', async () => {
    const wrapper = stage({}, { windowHeight: 900 })
    await launcherButton(wrapper).trigger('click')
    const style = wrapper.find('.chat-window').attributes('style')
    expect(style).toContain('height: 675px')
    expect(style).toContain(`max-height: calc(100% - ${20 + 64 + 12 + 12}px)`)
  })

  it('puts a button behind the chevron when the logo has no background', async () => {
    const wrapper = stage({ icon: 'logo', background: 'none', size: 'sm' }, {}, 'blob:logo')
    expect(launcherButton(wrapper).classes()).toContain('bare')
    expect(wrapper.find('.stage-icon img').attributes('src')).toBe('blob:logo')
    await launcherButton(wrapper).trigger('click')
    expect(launcherButton(wrapper).classes()).not.toContain('bare')
    expect(launcherButton(wrapper).attributes('style')).toContain('background: rgb(47, 91, 234)')
  })

  it('draws the site light or dark', () => {
    expect(stage().find('.stage').classes()).toContain('stage-light')
    expect(stage({}, { backdrop: 'dark' }).find('.stage').classes()).toContain('stage-dark')
  })

  it('mirrors to the left', () => {
    expect(launcherButton(stage({}, { side: 'left' })).classes()).toContain('at-left')
  })

  it('has no launcher when it is hidden', () => {
    const wrapper = stage({}, { hidden: true })
    expect(launcherButton(wrapper).exists()).toBe(false)
    expect(wrapper.find('.greeting').exists()).toBe(false)
  })
})

describe('LauncherPreviewStage brand mark', () => {
  it('draws lime and coral dots on the ChatterMate colour only', () => {
    const mark = stage({}, { brand: BRAND_COLORS.ink })
    expect(mark.find('.brand-dots').exists()).toBe(true)
    expect(mark.find('.brand-dots').attributes('style')).toContain(`--dot-a: ${BRAND_COLORS.lime}`)
    expect(stage().find('.brand-dots').exists()).toBe(false)
  })
})
