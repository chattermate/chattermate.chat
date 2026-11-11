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

import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import FormFields from '@/webclient/panel/screens/FormFields.vue'
import FormCard from '@/webclient/panel/messages/FormCard.vue'
import FullScreenForm from '@/webclient/panel/screens/FullScreenForm.vue'
import LandingScreen from '@/webclient/panel/screens/LandingScreen.vue'
import { fieldOptions } from '@/webclient/forms/options'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'
import type { WorkflowField } from '@/composables/useWorkflowScreens'

/**
 * Workflow forms with a stand-in controller: the shared fields, the form in the
 * chat, the full-screen form and the landing page. Validation and sending are the
 * controller's (useWorkflowScreens: its own spec, and widgetPanel.spec end to end).
 */

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    document.body.innerHTML = ''
})

const FIELDS: WorkflowField[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'seats', label: 'Seats', type: 'number', minLength: 1, maxLength: 50 },
    { name: 'notes', label: 'Notes', type: 'textarea', maxLength: 500 },
    { name: 'plan', label: 'Plan', type: 'select', options: 'Starter\nPro\n', placeholder: 'Pick a plan' },
    { name: 'terms', label: 'Terms', type: 'checkbox', required: true, placeholder: 'I accept the terms' },
    { name: 'contact', label: 'Contact by', type: 'radio', options: ['Email', 'Phone'] },
]

const mountPart = (component: any, overrides: Partial<FakeController> = {}, props: Record<string, unknown> = {}) => {
    ctrl = fakeController(overrides)
    wrapper = mountWithController(component, ctrl, props)
    return wrapper
}

describe('the shared form fields', () => {
    const fields = (overrides: Partial<FakeController> = {}) =>
        mountPart(FormFields, overrides, { fields: FIELDS, idPrefix: 'f' })

    it('gives every field an accessible name, the required ones marked as required', () => {
        fields()
        expect(wrapper!.get('#f-name').attributes('required')).toBeDefined()
        expect(wrapper!.get('label[for="f-name"]').text()).toContain('Name')
        expect(wrapper!.get('#f-email').attributes('type')).toBe('email')
        expect(wrapper!.get('#f-email').attributes('autocomplete')).toBe('email')
        expect(wrapper!.get('#f-phone').attributes('type')).toBe('tel')
        expect(wrapper!.get('#f-seats').attributes('type')).toBe('number')
        expect(wrapper!.get('#f-seats').attributes('min')).toBe('1')
        expect(wrapper!.get('#f-seats').attributes('max')).toBe('50')
        expect(wrapper!.get('textarea#f-notes').attributes('maxlength')).toBe('500')
        expect(wrapper!.get('#f-terms').element.closest('label')!.textContent).toContain('I accept the terms')
        // The checkbox's own label stays visible above it: its errors name it ("Terms is required").
        expect(wrapper!.get('#f-terms').element.closest('fieldset')!.querySelector('legend')!.textContent).toContain('Terms')
        expect(wrapper!.findAll('fieldset legend').map(l => l.text())).toEqual(['Terms *', 'Contact by'])
    })

    it('lists select and radio choices, given as a list or one per line', () => {
        fields()
        expect(wrapper!.findAll('#f-plan option').map(o => o.text())).toEqual(['Pick a plan', 'Starter', 'Pro'])
        expect(wrapper!.findAll('input[type="radio"]').map(r => r.attributes('value'))).toEqual(['Email', 'Phone'])
        expect(fieldOptions(' a \n\nb')).toEqual(['a', 'b'])
        expect(fieldOptions(undefined)).toEqual([])
    })

    it('hands every change to the controller, as each type holds its value', async () => {
        fields()
        await wrapper!.get('#f-name').setValue('Ada')
        await wrapper!.get('#f-plan').setValue('Pro')
        await wrapper!.get('#f-terms').setValue(true)
        await wrapper!.findAll('input[type="radio"]')[1].setValue(true)
        expect(ctrl.handleFieldChange).toHaveBeenCalledWith('name', 'Ada')
        expect(ctrl.handleFieldChange).toHaveBeenCalledWith('plan', 'Pro')
        expect(ctrl.handleFieldChange).toHaveBeenCalledWith('terms', true)
        expect(ctrl.handleFieldChange).toHaveBeenCalledWith('contact', 'Phone')
    })

    it('shows the values the controller holds', () => {
        fields({ formData: ref({ name: 'Ada', plan: 'Starter', terms: true, contact: 'Email' }) })
        expect((wrapper!.get('#f-name').element as HTMLInputElement).value).toBe('Ada')
        expect((wrapper!.get('#f-plan').element as HTMLSelectElement).value).toBe('Starter')
        expect((wrapper!.get('#f-terms').element as HTMLInputElement).checked).toBe(true)
        expect((wrapper!.findAll('input[type="radio"]')[0].element as HTMLInputElement).checked).toBe(true)
    })

    it('ties each error to its field', () => {
        fields({ formErrors: ref({ email: 'Please enter a valid email address' }) })
        const email = wrapper!.get('#f-email')
        expect(email.attributes('aria-invalid')).toBe('true')
        expect(wrapper!.get(`#${email.attributes('aria-describedby')}`).text()).toBe('Please enter a valid email address')
        expect(wrapper!.get('#f-name').attributes('aria-invalid')).toBe('false')
    })

    it('locks every field while the form is sent', async () => {
        fields()
        await wrapper!.setProps({ disabled: true })
        expect(wrapper!.findAll('input, select, textarea').every(el => el.attributes('disabled') !== undefined)).toBe(true)
    })
})

describe('the form in the chat', () => {
    const FORM = { title: 'Before we connect you to a teammate', description: 'So they can reach you.', fields: FIELDS.slice(0, 2), submit_button_text: 'Send details' }
    const card = (overrides: Partial<FakeController> = {}) => mountPart(FormCard, overrides, {
        message: { message_type: 'form', message: '', created_at: '', session_id: '', attributes: { form_data: FORM } },
        index: 0,
    })

    it('keeps the form-message hook and shows its title, description and fields', () => {
        card()
        expect(wrapper!.classes()).toEqual(expect.arrayContaining(['message', 'form-message']))
        expect(wrapper!.text()).toContain('Before we connect you to a teammate')
        expect(wrapper!.text()).toContain('So they can reach you.')
        expect(wrapper!.findAll('input')).toHaveLength(2)
    })

    it('submits the form through the controller', async () => {
        card()
        await wrapper!.trigger('submit')
        expect(ctrl.handleFormSubmit).toHaveBeenCalledWith(FORM)
    })

    it('says what to fix and takes the visitor to the first field when the submit is refused', async () => {
        card()
        ctrl.handleFormSubmit.mockImplementation(async () => {
            ctrl.formErrors.value = { name: 'Name is required', email: 'Email is required' }
        })
        const status = wrapper!.get('[role="status"]')
        expect(status.text()).toBe('')
        await wrapper!.trigger('submit')
        await flushPromises()
        expect(status.text()).toBe('Please fix 2 fields: Name is required. Email is required')
        expect(document.activeElement?.getAttribute('aria-invalid')).toBe('true')
        expect((document.activeElement as HTMLElement).id).toContain('name')

        // The same errors again are said again (the region empties first).
        await wrapper!.trigger('submit')
        await nextTick()
        expect(status.text()).toBe('')
        await flushPromises()
        expect(status.text()).toContain('Please fix 2 fields')
    })

    it('shows a checkbox with no wording of its own under its label', () => {
        mountPart(FormFields, {}, { fields: [{ name: 'ok', label: 'Keep me posted', type: 'checkbox' }], idPrefix: 'g' })
        expect(wrapper!.get('#g-ok').element.closest('label')!.textContent).toContain('Keep me posted')
        expect(wrapper!.find('fieldset').exists()).toBe(false)
    })

    it('says it is submitting and locks itself meanwhile', () => {
        card({ isSubmittingForm: ref(true) })
        const submit = wrapper!.get('button[type="submit"]')
        expect(submit.text()).toBe('Submitting...')
        expect(submit.attributes('disabled')).toBeDefined()
    })

    it('falls back to "Submit" when the form names no button', () => {
        ctrl = fakeController()
        wrapper = mountWithController(FormCard, ctrl, {
            message: { message_type: 'form', message: '', created_at: '', session_id: '', attributes: { form_data: { fields: [] } } },
            index: 0,
        })
        expect(wrapper.get('button[type="submit"]').text()).toBe('Submit')
    })
})

describe('the full-screen form and the landing page', () => {
    it('shows the full-screen form and submits it through the controller', async () => {
        mountPart(FullScreenForm, { fullScreenFormData: ref({ title: 'Your details', description: 'First, a few things.', fields: FIELDS.slice(0, 1) }) })
        expect(wrapper!.get('h2').text()).toBe('Your details')
        expect(wrapper!.text()).toContain('First, a few things.')
        expect(wrapper!.find('#cm-fullscreen-name').exists()).toBe(true)
        await wrapper!.trigger('submit')
        expect(ctrl.submitFullScreenForm).toHaveBeenCalledTimes(1)
    })

    it('shows the landing page and starts the workflow from its button', async () => {
        mountPart(LandingScreen, {
            landingPageData: ref({ heading: 'Welcome to Acme', content: 'We will set you up.' }),
            workflowButtonText: ref('Start Chat'),
        })
        expect(wrapper!.get('h2').text()).toBe('Welcome to Acme')
        expect(wrapper!.text()).toContain('We will set you up.')
        await wrapper!.get('button').trigger('click')
        expect(ctrl.handleLandingPageProceed).toHaveBeenCalledTimes(1)
    })
})
