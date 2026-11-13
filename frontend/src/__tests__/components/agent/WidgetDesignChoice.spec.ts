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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const updateCustomization = vi.hoisted(() => vi.fn())
vi.mock('@/services/agent', () => ({ agentService: { updateCustomization } }))
vi.mock('@/composables/useEnterpriseFeatures', () => ({ useEnterpriseFeatures: () => ({ hasEnterpriseModule: false }) }))
vi.mock('webfontloader', () => ({ default: { load: vi.fn() } }))
vi.mock('@/config/api', async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    getGoogleFontsApiKey: () => '',
}))

import WidgetDesignChoice from '@/components/agent/WidgetDesignChoice.vue'
import AgentCustomizationView from '@/components/agent/AgentCustomizationView.vue'

/**
 * The Original / New widget design control: what it shows, and that the choice is
 * saved in customization_metadata.widget_ui with the rest of the customization.
 */

describe('WidgetDesignChoice', () => {
    const radios = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('input[type="radio"]')

    it('shows the stored design as the checked option, and asks for the other', async () => {
        const wrapper = mount(WidgetDesignChoice, { props: { modelValue: 2 } })
        expect(wrapper.find('legend').text()).toBe('Widget design')
        expect(wrapper.findAll('label').map(label => label.text())).toEqual(['Original', 'New'])
        const [original, next] = radios(wrapper)
        expect((next.element as HTMLInputElement).checked).toBe(true)
        expect((original.element as HTMLInputElement).checked).toBe(false)
        await original.setValue(true)
        expect(wrapper.emitted('update:modelValue')).toEqual([[1]])
    })

    it('is one group of native radios: one tab stop, arrow keys from the browser', () => {
        const wrapper = mount(WidgetDesignChoice, { props: { modelValue: 1 } })
        const names = radios(wrapper).map(radio => radio.attributes('name'))
        expect(new Set(names).size).toBe(1)
        expect(wrapper.find('fieldset').exists()).toBe(true)
    })

    it('says so, in one line, when this server serves visitors the original widget only', () => {
        const off = mount(WidgetDesignChoice, { props: { modelValue: 2, served: false } })
        expect(off.text()).toContain('Visitors see the original widget until the new design is turned on for this server.')
        // Choosing stays possible.
        expect(radios(off).every(radio => radio.attributes('disabled') === undefined)).toBe(true)
        const on = mount(WidgetDesignChoice, { props: { modelValue: 2, served: true } })
        expect(on.text()).not.toContain('Visitors see the original widget')
    })
})

describe('WidgetDesignChoice for an agent created on the new design', () => {
    it('offers no choice, only the server note when the redesign is off', () => {
        const locked = mount(WidgetDesignChoice, { props: { modelValue: 2, choosable: false } })
        expect(locked.find('fieldset').exists()).toBe(false)
        expect(locked.text()).toBe('')
        const off = mount(WidgetDesignChoice, { props: { modelValue: 2, choosable: false, served: false } })
        expect(off.find('input').exists()).toBe(false)
        expect(off.text()).toBe('Visitors see the original widget until the new design is turned on for this server.')
    })
})

describe('the design control in the customization form', () => {
    const agent = (metadata: Record<string, unknown>, served?: boolean) => ({
        id: 'agent-1',
        name: 'ada',
        customization: { id: 7, chat_style: 'SUNRISE', customization_metadata: metadata },
        widget_ui_v2_enabled: served,
    }) as never

    const mountForm = (metadata: Record<string, unknown>, served?: boolean) => mount(AgentCustomizationView, {
        props: { agent: agent(metadata, served) },
        global: { stubs: { LauncherSection: true, ColorSwatchPicker: true, 'font-awesome-icon': true } },
    })

    const design = (wrapper: ReturnType<typeof mountForm>) => wrapper.find('fieldset.widget-design')
    const checked = (wrapper: ReturnType<typeof mountForm>) =>
        design(wrapper).findAll('label').find(label => (label.find('input').element as HTMLInputElement).checked)!.text()
    const choose = (wrapper: ReturnType<typeof mountForm>, index: number) =>
        design(wrapper).findAll('input[type="radio"]')[index].setValue(true)

    beforeEach(() => {
        updateCustomization.mockReset()
        updateCustomization.mockImplementation(async (_id: string, c: unknown) => c)
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })
    afterEach(() => vi.restoreAllMocks())

    it('hides the choice for an agent created on the new design, and keeps it for the others', () => {
        const created = mountForm({ widget_ui: { version: 2, created_on_ui: 2 } })
        expect(design(created).exists()).toBe(false)
        expect(created.text()).not.toContain('Original')
        expect(design(mountForm({ widget_ui: { version: 2 } })).exists()).toBe(true)
        expect(design(mountForm({})).exists()).toBe(true)
    })

    it('shows an agent created on the new design only the note when this server has it off', () => {
        const off = mountForm({ widget_ui: { version: 2, created_on_ui: 2 } }, false)
        expect(design(off).exists()).toBe(false)
        expect(off.find('input[name="widget-design"]').exists()).toBe(false)
        expect(off.text()).toContain('Visitors see the original widget until the new design is turned on for this server.')
        expect(mountForm({ widget_ui: { version: 2, created_on_ui: 2 } }, true).text())
            .not.toContain('Visitors see the original widget until')
    })

    it('reflects the stored choice: Original when none is stored', () => {
        expect(checked(mountForm({}))).toBe('Original')
        expect(checked(mountForm({ widget_ui: { version: 2 } }))).toBe('New')
    })

    it('notes the server\'s switch only when the server says it is off', () => {
        const note = 'Visitors see the original widget until'
        expect(mountForm({}, false).text()).toContain(note)
        expect(mountForm({}, true).text()).not.toContain(note)
        // Older servers say nothing: no note.
        expect(mountForm({}).text()).not.toContain(note)
    })

    it('saves New as widget_ui.version 2, keeping the rest of the metadata, and previews it at once', async () => {
        const wrapper = mountForm({ widget_display: { mode: 'floating', side: 'left' } })
        await choose(wrapper, 1)

        const previews = wrapper.emitted('preview') as Array<[Record<string, any>]>
        expect(previews.at(-1)![0].customization_metadata.widget_ui).toEqual({ version: 2 })

        await (wrapper.vm as unknown as { save: () => Promise<boolean> }).save()
        await flushPromises()
        expect(updateCustomization).toHaveBeenCalledTimes(1)
        const [, saved] = updateCustomization.mock.calls[0]
        expect(saved.customization_metadata).toEqual({
            widget_display: { mode: 'floating', side: 'left' },
            widget_ui: { version: 2 },
        })
    })

    it('saves Original back as version 1', async () => {
        const wrapper = mountForm({ widget_ui: { version: 2 } })
        await choose(wrapper, 0)
        await (wrapper.vm as unknown as { save: () => Promise<boolean> }).save()
        expect(updateCustomization.mock.calls[0][1].customization_metadata.widget_ui).toEqual({ version: 1 })
    })
})
