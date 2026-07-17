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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import type { WhatsAppTemplate } from '../../services/channels'

const listWhatsAppTemplates = vi.fn()
vi.mock('../../services/channels', () => ({
  default: {
    listWhatsAppTemplates: (...args: unknown[]) => listWhatsAppTemplates(...args),
  },
}))

import WhatsAppTemplateSelect from '../../components/conversations/WhatsAppTemplateSelect.vue'

/**
 * The same template in three languages is three templates — Meta has no
 * multilingual template, and the auth-template flow creates exactly this shape
 * by design. These rows are what broke the picker: it treated them as one.
 */
const multilingual: WhatsAppTemplate[] = [
  {
    name: 'order_update', language: 'en_US', status: 'APPROVED', category: 'UTILITY',
    components: [{ type: 'BODY', text: 'Hi {{1}}, your order shipped.' }],
  },
  {
    name: 'order_update', language: 'es_ES', status: 'APPROVED', category: 'UTILITY',
    components: [{ type: 'BODY', text: 'Hola {{1}}, tu pedido ha sido enviado.' }],
  },
  {
    name: 'order_update', language: 'hi_IN', status: 'APPROVED', category: 'UTILITY',
    components: [{ type: 'BODY', text: 'नमस्ते {{1}}, आपका ऑर्डर भेज दिया गया है।' }],
  },
]

const mountSelect = async (templates: WhatsAppTemplate[], props = {}) => {
  listWhatsAppTemplates.mockResolvedValue(templates)
  const wrapper = mount(WhatsAppTemplateSelect, {
    props: { accountId: 'acc-1', ...props },
    global: { stubs: { 'font-awesome-icon': true } },
  })
  await flushPromises()
  return wrapper
}

describe('WhatsAppTemplateSelect — same-named templates in different languages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists every language as its own choice', async () => {
    const wrapper = await mountSelect(multilingual)
    expect(wrapper.findAll('.tps-option')).toHaveLength(3)
  })

  it('selects only the language clicked, not every row sharing the name', async () => {
    const wrapper = await mountSelect(multilingual)
    await wrapper.findAll('.tps-option')[1].trigger('click')

    const pressed = wrapper.findAll('.tps-option')
      .filter((option) => option.attributes('aria-pressed') === 'true')
    expect(pressed).toHaveLength(1)
  })

  it('switches language when a same-named sibling is clicked', async () => {
    // The bug: select() early-returned on a name match, so this click was a
    // silent no-op and the send went out in the language already chosen.
    const wrapper = await mountSelect(multilingual)

    await wrapper.findAll('.tps-option')[0].trigger('click')
    expect(wrapper.emitted('update:selection')?.at(-1)?.[0]).toMatchObject({
      template: { language: 'en_US' },
    })

    await wrapper.findAll('.tps-option')[1].trigger('click')
    expect(wrapper.emitted('update:selection')?.at(-1)?.[0]).toMatchObject({
      template: { language: 'es_ES' },
    })
  })

  it('keeps typed values when the SAME row is re-clicked', async () => {
    // The behaviour the early return exists for — it must survive the fix.
    const wrapper = await mountSelect(multilingual)
    await wrapper.findAll('.tps-option')[0].trigger('click')
    await wrapper.find('.tps-input').setValue('Priya')

    await wrapper.findAll('.tps-option')[0].trigger('click')

    expect((wrapper.find('.tps-input').element as HTMLInputElement).value).toBe('Priya')
  })
})

describe('WhatsAppTemplateSelect — filtering and errors', () => {
  beforeEach(() => vi.clearAllMocks())

  it('offers only the categories asked for', async () => {
    const mixed: WhatsAppTemplate[] = [
      multilingual[0],
      { name: 'promo', language: 'en_US', status: 'APPROVED', category: 'MARKETING',
        components: [{ type: 'BODY', text: 'Sale!' }] },
    ]
    const wrapper = await mountSelect(mixed, { categories: ['UTILITY', 'AUTHENTICATION'] })
    expect(wrapper.findAll('.tps-option')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('promo')
  })

  it('distinguishes a failed load from an empty list', async () => {
    listWhatsAppTemplates.mockRejectedValue({ response: { data: { detail: 'Nope' } } })
    const wrapper = mount(WhatsAppTemplateSelect, {
      props: { accountId: 'acc-1' },
      global: { stubs: { 'font-awesome-icon': true } },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Nope')
  })
})
