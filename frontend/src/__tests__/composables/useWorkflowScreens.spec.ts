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

import { describe, it, expect, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { useWorkflowScreens, type WorkflowForm, type WorkflowMessage } from '@/composables/useWorkflowScreens'

const emailField = { name: 'email', label: 'Email', type: 'email', required: true }

const setup = () => {
    const messages = ref<WorkflowMessage[]>([])
    const currentForm = ref<WorkflowForm | null>(null)
    const submitForm = vi.fn().mockResolvedValue(undefined)
    const proceedWorkflow = vi.fn().mockResolvedValue(undefined)
    const sendMessage = vi.fn().mockResolvedValue(undefined)
    const screens = useWorkflowScreens({
        messages,
        currentForm,
        submitForm,
        proceedWorkflow,
        sendMessage,
        emailInput: ref('ada@example.com'),
    })
    return { ...screens, messages, currentForm, submitForm, proceedWorkflow, sendMessage }
}

const silenceConsoleError = () => vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useWorkflowScreens', () => {
    afterEach(() => vi.restoreAllMocks())

    it('shows a landing page with its button text', () => {
        const screens = setup()
        screens.handleWorkflowState({ type: 'landing_page', button_text: 'Go', landing_page_data: { heading: 'Hi' } })
        expect(screens.showLandingPage.value).toBe(true)
        expect(screens.workflowButtonText.value).toBe('Go')
    })

    it('adds an inline form to the chat once', () => {
        const screens = setup()
        const state = { type: 'form', form_data: { fields: [emailField] } }
        screens.handleWorkflowState(state)
        screens.handleWorkflowState(state)
        expect(screens.messages.value.filter(m => m.message_type === 'form')).toHaveLength(1)
        expect(screens.workflowButtonText.value).toBe('Start Chat')
    })

    it('treats a display_form state like a form', () => {
        const inline = setup()
        inline.handleWorkflowState({ type: 'display_form', form_data: { fields: [emailField] } })
        expect(inline.messages.value).toHaveLength(1)
        expect(inline.messages.value[0]).toMatchObject({ message_type: 'form', isSubmitted: false })
        expect(inline.showFullScreenForm.value).toBe(false)

        const fullScreen = setup()
        fullScreen.handleWorkflowState({ type: 'display_form', form_data: { form_full_screen: true, fields: [emailField] } })
        expect(fullScreen.showFullScreenForm.value).toBe(true)
        expect(fullScreen.messages.value).toHaveLength(0)
    })

    it('hides the screens for any other workflow state', () => {
        const screens = setup()
        screens.handleWorkflowState({ type: 'landing_page', landing_page_data: {} })
        screens.handleWorkflowState({ type: 'chat' })
        expect(screens.showLandingPage.value).toBe(false)
        expect(screens.showFullScreenForm.value).toBe(false)
        expect(screens.messages.value).toHaveLength(0)
    })

    it('leaves the landing page and moves the workflow on', async () => {
        const screens = setup()
        screens.handleWorkflowState({ type: 'landing_page', landing_page_data: { heading: 'Hi' } })
        await screens.handleLandingPageProceed()
        expect(screens.showLandingPage.value).toBe(false)
        expect(screens.landingPageData.value).toBeNull()
        expect(screens.proceedWorkflow).toHaveBeenCalledOnce()
    })

    it('swallows a failure to move the workflow on', async () => {
        const consoleError = silenceConsoleError()
        const screens = setup()
        screens.proceedWorkflow.mockRejectedValue(new Error('down'))
        await expect(screens.handleLandingPageProceed()).resolves.toBeUndefined()
        expect(screens.showLandingPage.value).toBe(false)
        expect(consoleError).toHaveBeenCalled()
    })

    it('submits a valid inline form and takes it out of the chat', async () => {
        const screens = setup()
        const form = { fields: [emailField] }
        screens.handleWorkflowState({ type: 'form', form_data: form })
        screens.formData.value = { email: 'ada@example.com' }

        await screens.handleFormSubmit(form)
        expect(screens.submitForm).toHaveBeenCalledWith({ email: 'ada@example.com' })
        expect(screens.messages.value).toHaveLength(0)
        expect(screens.formData.value).toEqual({})
        expect(screens.formErrors.value).toEqual({})
        expect(screens.isSubmittingForm.value).toBe(false)
    })

    it('keeps an invalid inline form in the chat with its errors', async () => {
        const screens = setup()
        const form = { fields: [emailField] }
        screens.handleWorkflowState({ type: 'form', form_data: form })

        await screens.handleFormSubmit(form)
        expect(screens.formErrors.value).toEqual({ email: 'Email is required' })
        expect(screens.submitForm).not.toHaveBeenCalled()
        expect(screens.messages.value).toHaveLength(1)
    })

    it('validates a full-screen form before submitting it', async () => {
        const screens = setup()
        screens.handleWorkflowState({ type: 'form', form_data: { form_full_screen: true, fields: [emailField] } })
        expect(screens.showFullScreenForm.value).toBe(true)

        await screens.submitFullScreenForm()
        expect(screens.formErrors.value.email).toBeTruthy()
        expect(screens.submitForm).not.toHaveBeenCalled()

        screens.handleFieldChange('email', 'ada@example.com')
        expect(screens.formErrors.value.email).toBeUndefined()
        await screens.submitFullScreenForm()
        expect(screens.submitForm).toHaveBeenCalledWith({ email: 'ada@example.com' })
        expect(screens.showFullScreenForm.value).toBe(false)
    })

    it('keeps the full-screen form and its answers when the submit fails', async () => {
        silenceConsoleError()
        const screens = setup()
        screens.handleWorkflowState({ type: 'form', form_data: { form_full_screen: true, fields: [emailField] } })
        screens.handleFieldChange('email', 'ada@example.com')
        screens.submitForm.mockRejectedValue(new Error('down'))

        await screens.submitFullScreenForm()
        expect(screens.showFullScreenForm.value).toBe(true)
        expect(screens.fullScreenFormData.value).not.toBeNull()
        expect(screens.formData.value).toEqual({ email: 'ada@example.com' })
        expect(screens.isSubmittingForm.value).toBe(false)
    })

    it('clears a field error when the field is emptied', () => {
        const screens = setup()
        screens.handleWorkflowState({ type: 'form', form_data: { form_full_screen: true, fields: [emailField] } })
        screens.handleFieldChange('email', 'not-an-email')
        expect(screens.formErrors.value.email).toBe('Please enter a valid email address')

        screens.handleFieldChange('email', '   ')
        expect(screens.formErrors.value.email).toBeUndefined()
        expect(screens.formData.value.email).toBe('   ')
    })

    it('validates a field live against the form the socket last received', () => {
        const screens = setup()
        screens.currentForm.value = { fields: [emailField] }
        screens.handleFieldChange('email', 'not-an-email')
        expect(screens.formErrors.value.email).toBe('Please enter a valid email address')

        screens.handleFieldChange('unknown', 'anything')
        expect(screens.formErrors.value.unknown).toBeUndefined()
    })

    it('does not validate an inline chat form field live', () => {
        const screens = setup()
        screens.handleWorkflowState({ type: 'form', form_data: { fields: [emailField] } })
        // Pinned current behaviour (odd): the chat form is in neither the full-screen
        // form nor currentForm, so live validation finds no field config.
        screens.handleFieldChange('email', 'not-an-email')
        expect(screens.formErrors.value.email).toBeUndefined()
    })

    it('sends a free-text answer with the visitor email', async () => {
        const screens = setup()
        const message: WorkflowMessage = { message_type: 'user_input', userInputValue: ' yes ' }
        await screens.handleUserInputSubmit(message)
        expect(screens.sendMessage).toHaveBeenCalledWith('yes', 'ada@example.com')
        expect(message).toMatchObject({ isSubmitted: true, submittedValue: 'yes' })
    })

    it('does not send a blank free-text answer', async () => {
        const screens = setup()
        const message: WorkflowMessage = { message_type: 'user_input', userInputValue: '   ' }
        await screens.handleUserInputSubmit(message)
        expect(screens.sendMessage).not.toHaveBeenCalled()
        expect(message.isSubmitted).toBeUndefined()
    })

    it('reopens a free-text answer when sending it fails', async () => {
        silenceConsoleError()
        const screens = setup()
        screens.sendMessage.mockRejectedValue(new Error('down'))
        const message: WorkflowMessage = { message_type: 'user_input', userInputValue: 'yes' }
        await screens.handleUserInputSubmit(message)
        expect(message).toMatchObject({ isSubmitted: false, submittedValue: null, userInputValue: 'yes' })
    })
})
