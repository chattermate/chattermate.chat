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

import { ref, type Ref } from 'vue'
import { validateFormField, type FormFieldRule } from '../webclient/forms/validation'

/** A form field as the workflow sends it: the validation rules plus its key. */
export type WorkflowField = FormFieldRule & { name: string }

export interface WorkflowForm {
    fields?: WorkflowField[]
    form_full_screen?: boolean
    [key: string]: any
}

/** What the server says the workflow is showing (the socket's `workflow_state`). */
export interface WorkflowState {
    type?: string
    button_text?: string
    landing_page_data?: any
    form_data?: WorkflowForm
}

/** The fields the workflow screens read and write on a chat message. */
export interface WorkflowMessage {
    message?: string
    message_type?: string
    attributes?: Record<string, any>
    created_at?: string
    isSubmitted?: boolean
    userInputValue?: string
    submittedValue?: string | null
}

export interface WorkflowScreensOptions {
    messages: Ref<WorkflowMessage[]>
    /** The inline form the socket last received. */
    currentForm: Ref<WorkflowForm | null>
    submitForm: (data: Record<string, any>) => Promise<unknown>
    proceedWorkflow: () => Promise<unknown>
    sendMessage: (text: string, email: string) => Promise<unknown>
    emailInput: Ref<string>
}

const DEFAULT_BUTTON_TEXT = 'Start Chat'

const isOpenForm = (msg: WorkflowMessage) => msg.message_type === 'form' && !msg.isSubmitted

const errorsFor = (fields: WorkflowField[], data: Record<string, any>) => {
    const errors: Record<string, string> = {}
    for (const field of fields) {
        const error = validateFormField(field, data[field.name])
        if (error) errors[field.name] = error
    }
    return errors
}

/**
 * The screens a workflow agent puts in front of the chat (a landing page, a full
 * screen form), the forms it drops into the chat, and its free-text questions.
 */
export function useWorkflowScreens({
    messages,
    currentForm,
    submitForm,
    proceedWorkflow,
    sendMessage,
    emailInput,
}: WorkflowScreensOptions) {
    const formData = ref<Record<string, any>>({})
    const isSubmittingForm = ref(false)
    const formErrors = ref<Record<string, string>>({})

    const showLandingPage = ref(false)
    const landingPageData = ref<any>(null)
    const workflowButtonText = ref(DEFAULT_BUTTON_TEXT)

    const showFullScreenForm = ref(false)
    const fullScreenFormData = ref<WorkflowForm | null>(null)

    const showScreens = (landing: boolean, fullScreenForm: boolean) => {
        showLandingPage.value = landing
        showFullScreenForm.value = fullScreenForm
    }

    // An inline form joins the chat once; a repeated state does not add a second.
    const addInlineForm = (form: WorkflowForm | undefined) => {
        if (messages.value.some(isOpenForm)) return
        messages.value.push({
            message: '',
            message_type: 'form',
            attributes: { form_data: form },
            created_at: new Date().toISOString(),
            isSubmitted: false,
        })
    }

    // Registered with the socket's onWorkflowState by the widget.
    const handleWorkflowState = (data: WorkflowState) => {
        workflowButtonText.value = data.button_text || DEFAULT_BUTTON_TEXT

        if (data.type === 'landing_page') {
            landingPageData.value = data.landing_page_data
            showScreens(true, false)
        } else if ((data.type === 'form' || data.type === 'display_form') && data.form_data?.form_full_screen === true) {
            fullScreenFormData.value = data.form_data
            showFullScreenForm.value = true
            showLandingPage.value = false
        } else if (data.type === 'form' || data.type === 'display_form') {
            addInlineForm(data.form_data)
            showScreens(false, false)
        } else {
            showScreens(false, false)
        }
    }

    const handleLandingPageProceed = async () => {
        try {
            showLandingPage.value = false
            landingPageData.value = null
            await proceedWorkflow()
        } catch (error) {
            console.error('Failed to proceed workflow:', error)
        }
    }

    // An inline form in the chat.
    const handleFormSubmit = async (formConfig: WorkflowForm) => {
        if (isSubmittingForm.value) return

        // No fallback for a form without fields: it throws here, as it always has.
        formErrors.value = errorsFor(formConfig.fields as WorkflowField[], formData.value)
        if (Object.keys(formErrors.value).length > 0) return

        try {
            isSubmittingForm.value = true
            await submitForm(formData.value)

            // The submitted form leaves the chat.
            const formIndex = messages.value.findIndex(isOpenForm)
            if (formIndex !== -1) messages.value.splice(formIndex, 1)

            formData.value = {}
            formErrors.value = {}
        } catch (error) {
            console.error('Failed to submit form:', error)
        } finally {
            isSubmittingForm.value = false
        }
    }

    // Pinned current behaviour (odd): live validation looks the field up in the full
    // screen form or the socket's currentForm, and a chat form is in neither.
    const fieldConfigFor = (fieldName: string) =>
        fullScreenFormData.value?.fields?.find(f => f.name === fieldName)
        || currentForm.value?.fields?.find(f => f.name === fieldName)
        || null

    const handleFieldChange = (fieldName: string, value: any) => {
        formData.value[fieldName] = value

        // Clear the error when the field is cleared.
        if (!value || value.toString().trim() === '') {
            delete formErrors.value[fieldName]
            return
        }
        const fieldConfig = fieldConfigFor(fieldName)
        if (!fieldConfig) return
        const error = validateFormField(fieldConfig, value)
        if (error) {
            formErrors.value[fieldName] = error
        } else {
            delete formErrors.value[fieldName]
        }
    }

    const submitFullScreenForm = async () => {
        if (isSubmittingForm.value || !fullScreenFormData.value) return

        try {
            isSubmittingForm.value = true
            formErrors.value = errorsFor(fullScreenFormData.value.fields || [], formData.value)
            if (Object.keys(formErrors.value).length > 0) return

            await submitForm(formData.value)

            showFullScreenForm.value = false
            fullScreenFormData.value = null
            formData.value = {}
        } catch (error) {
            console.error('Failed to submit full screen form:', error)
        } finally {
            isSubmittingForm.value = false
        }
    }

    // A workflow question answered in free text continues the workflow as a message.
    const handleUserInputSubmit = async (message: WorkflowMessage) => {
        try {
            const userInput = message.userInputValue?.trim()
            if (!userInput) return

            message.isSubmitted = true
            message.submittedValue = userInput
            await sendMessage(userInput, emailInput.value)
        } catch (error) {
            console.error('Failed to submit user input:', error)
            message.isSubmitted = false
            message.submittedValue = null
        }
    }

    return {
        formData,
        isSubmittingForm,
        formErrors,
        showLandingPage,
        landingPageData,
        workflowButtonText,
        showFullScreenForm,
        fullScreenFormData,
        handleWorkflowState,
        handleLandingPageProceed,
        handleFormSubmit,
        handleFieldChange,
        submitFullScreenForm,
        handleUserInputSubmit,
    }
}
