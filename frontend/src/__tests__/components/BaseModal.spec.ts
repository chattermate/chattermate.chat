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
import BaseModal from '../../components/common/BaseModal.vue'

/**
 * jsdom reports offsetParent as null for everything, which the trap uses to
 * skip hidden controls. Force it so the visibility filter behaves as it does
 * in a browser.
 */
const withVisibleElements = () =>
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() { return this.parentNode },
  })

const mountModal = () => {
  withVisibleElements()
  return mount(BaseModal, {
    props: { title: 'Send a template' },
    slots: {
      default: '<input class="first" /><input class="middle" />',
      actions: '<button class="last">Send</button>',
    },
    attachTo: document.body,
  })
}

describe('BaseModal', () => {
  it('names the dialog for assistive tech', () => {
    const wrapper = mountModal()
    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-label')).toBe('Send a template')
    wrapper.unmount()
  })

  it('closes on Escape and on a backdrop click, but not on a click inside', async () => {
    const wrapper = mountModal()

    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toHaveLength(1)

    await wrapper.find('.bm-panel').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)   // still 1 — inside doesn't close

    await wrapper.find('[role="dialog"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
    wrapper.unmount()
  })

  // Focus order is [close ×, .first, .middle, .last]: the header's close button
  // is the first control in the DOM, which is what the wrap has to honour.
  it('wraps Tab from the last control back to the first', async () => {
    // aria-modal tells a screen reader the page behind is gone. Without the
    // trap, tabbing past the last button lands in content the AT has been told
    // does not exist.
    const wrapper = mountModal()
    ;(wrapper.find('.last').element as HTMLElement).focus()

    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Tab' })

    expect(document.activeElement).toBe(wrapper.find('.bm-close').element)
    wrapper.unmount()
  })

  it('wraps Shift+Tab from the first control to the last', async () => {
    const wrapper = mountModal()
    ;(wrapper.find('.bm-close').element as HTMLElement).focus()

    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(wrapper.find('.last').element)
    wrapper.unmount()
  })

  it('wraps Shift+Tab from the container, where focus starts', async () => {
    // The scrim is tabindex="-1" and takes focus on open, so it has to count as
    // "before the first control" — otherwise the very first Shift+Tab escapes.
    const wrapper = mountModal()

    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(wrapper.find('.last').element)
    wrapper.unmount()
  })

  it('leaves Tab alone in the middle of the dialog', async () => {
    const wrapper = mountModal()
    const middle = wrapper.find('.middle').element as HTMLElement
    middle.focus()

    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Tab' })

    // Not intercepted — the browser's own order still applies.
    expect(document.activeElement).toBe(middle)
    wrapper.unmount()
  })

  it('gives focus back to whatever opened it', async () => {
    withVisibleElements()
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mount(BaseModal, {
      props: { title: 'x' },
      slots: { default: '<input />' },
      attachTo: document.body,
    })
    expect(document.activeElement).not.toBe(trigger)

    wrapper.unmount()
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })
})
