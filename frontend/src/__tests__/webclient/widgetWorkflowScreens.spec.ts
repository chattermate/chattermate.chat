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
import { DOMWrapper } from '@vue/test-utils'

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

import { mountWidget, resetSocket, settle, socket, socketCalls } from './widgetHarness'

/**
 * Workflow screens: the landing page, the full-screen form, the form posted into
 * the chat and the free-text "user input" step. Characterization tests: they pin
 * what the widget does today so the v2 rewrite can be checked against it. A
 * visitor stuck on a screen that never submits is a dead workflow.
 */

let wrapper: any

beforeEach(() => resetSocket())
afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
})

/** Mount, attached so a submit button submits its form as in the frame. */
const mountAttached = async () => {
    ;({ wrapper } = await mountWidget({ initialData: { workflow: true } }))
    document.body.appendChild(wrapper.element)
}

/** Mount and hand back the onWorkflowState callback the widget registers. */
const mountWorkflow = async () => {
    await mountAttached()
    await vi.waitFor(() => expect(socketCalls.onWorkflowState).toHaveBeenCalled())
    const pushState = async (data: Record<string, any>) => {
        socketCalls.onWorkflowState.mock.calls[0][0](data)
        await settle(wrapper)
    }
    return pushState
}

/** A heading anywhere in the widget, by its text. */
const heading = (text: string) =>
    wrapper.findAll('h1, h2, h3, h4').find((h: any) => h.text().trim() === text)

/**
 * The screen a heading or field belongs to: its nearest ancestor holding a button.
 * Lets a test look inside one screen without naming the classes that build it.
 */
const screenAround = (el: any) => {
    let node: HTMLElement | null = el.element.parentElement
    while (node && !node.querySelector('button')) node = node.parentElement
    return new DOMWrapper(node as HTMLElement)
}
const screenTitled = (text: string) => screenAround(heading(text))

const buttonIn = (screen: any, name: string) =>
    screen.findAll('button').find((b: any) => b.text().trim() === name)

/** The field a label names, as getByLabel would find it. */
const fieldLabelled = (screen: any, label: string) => {
    const tag = screen.findAll('label').find((l: any) => l.text().replace(/\*/g, '').trim() === label)
    return screen.find(`[id="${tag.attributes('for')}"]`)
}

/** A form posted into the chat, by its title (a line, not a heading). */
const chatForm = (title: string) =>
    wrapper.findAll('form').find((f: any) => f.text().startsWith(title))

/** How many times a piece of text appears on screen. */
const occurrences = (text: string) => wrapper.text().split(text).length - 1

const contactFields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
]

describe('the workflow landing screen', () => {
    const showLanding = async (state: Record<string, any> = {}) => {
        const pushState = await mountWorkflow()
        await pushState({
            type: 'landing_page',
            button_text: 'Begin',
            landing_page_data: { heading: 'Welcome aboard', content: 'We answer in minutes.' },
            ...state,
        })
        return pushState
    }

    it('shows the heading, content and the server-sent button label', async () => {
        await showLanding()

        const screen = screenTitled('Welcome aboard')
        expect(screen.text()).toContain('We answer in minutes.')
        expect(buttonIn(screen, 'Begin')).toBeDefined()
    })

    it('falls back to "Start Chat" when the server sends no button text', async () => {
        await showLanding({ button_text: undefined })

        expect(buttonIn(screenTitled('Welcome aboard'), 'Start Chat')).toBeDefined()
    })

    it('hides itself and proceeds the workflow when the visitor clicks the button', async () => {
        await showLanding()
        expect(heading('Welcome aboard')).toBeDefined()

        await buttonIn(screenTitled('Welcome aboard'), 'Begin').trigger('click')
        await settle(wrapper)

        expect(socketCalls.proceedWorkflow).toHaveBeenCalledTimes(1)
        expect(heading('Welcome aboard')).toBeUndefined()
        expect(wrapper.text()).not.toContain('We answer in minutes.')
    })

    it('is dismissed by any other workflow state', async () => {
        const pushState = await showLanding()
        expect(heading('Welcome aboard')).toBeDefined()

        await pushState({ type: 'chat' })

        expect(heading('Welcome aboard')).toBeUndefined()
        expect(wrapper.text()).not.toContain('We answer in minutes.')
    })
})

describe('the full-screen workflow form', () => {
    const showForm = async (extra: Record<string, any> = {}) => {
        const pushState = await mountWorkflow()
        await pushState({
            type: 'form',
            form_data: {
                form_full_screen: true,
                title: 'Tell us about you',
                description: 'So we can reach you back.',
                submit_button_text: 'Send details',
                fields: contactFields,
                ...extra,
            },
        })
        return screenTitled('Tell us about you')
    }

    it('renders the title, description and a labelled field per entry', async () => {
        const form = await showForm()

        expect(form.text()).toContain('So we can reach you back.')
        expect(fieldLabelled(form, 'Name').attributes('type')).toBe('text')
        expect(fieldLabelled(form, 'Email').attributes('type')).toBe('email')
        expect(fieldLabelled(form, 'Phone').attributes('type')).toBe('tel')
    })

    it('shows a "required" error per empty required field and does not submit', async () => {
        const form = await showForm()

        await buttonIn(form, 'Send details').trigger('click')
        await settle(wrapper)

        expect(form.text()).toContain('Name is required')
        expect(form.text()).toContain('Email is required')
        expect(socketCalls.submitForm).not.toHaveBeenCalled()
    })

    it('flags a bad email as the visitor types and clears it once fixed', async () => {
        const form = await showForm()
        const email = fieldLabelled(form, 'Email')

        await email.setValue('not-an-email')
        expect(form.text()).toContain('Please enter a valid email address')

        await email.setValue('ada@example.com')
        expect(form.text()).not.toContain('Please enter a valid email address')
    })

    it('rejects a phone number with fewer than 7 digits', async () => {
        const form = await showForm()

        await fieldLabelled(form, 'Name').setValue('Ada')
        await fieldLabelled(form, 'Email').setValue('ada@example.com')
        await fieldLabelled(form, 'Phone').setValue('12-34')
        await buttonIn(form, 'Send details').trigger('click')
        await settle(wrapper)

        expect(form.text()).toContain('Please enter a valid phone number')
        expect(socketCalls.submitForm).not.toHaveBeenCalled()
    })

    it('submits the values and closes the form when they are valid', async () => {
        const form = await showForm()

        await fieldLabelled(form, 'Name').setValue('Ada')
        await fieldLabelled(form, 'Email').setValue('ada@example.com')
        await fieldLabelled(form, 'Phone').setValue('+44 20 7946 0958')
        await buttonIn(form, 'Send details').trigger('click')
        await settle(wrapper)

        expect(socketCalls.submitForm).toHaveBeenCalledWith({
            name: 'Ada',
            email: 'ada@example.com',
            phone: '+44 20 7946 0958',
        })
        expect(heading('Tell us about you')).toBeUndefined()
        expect(wrapper.text()).not.toContain('So we can reach you back.')
    })

    it('submits once when Submit is pressed twice before the form re-renders', async () => {
        const form = await showForm()
        await fieldLabelled(form, 'Name').setValue('Ada')
        await fieldLabelled(form, 'Email').setValue('ada@example.com')

        // Both clicks land in the same tick, before the re-render disables the button.
        const submit = buttonIn(form, 'Send details')
        submit.trigger('click')
        submit.trigger('click')
        await settle(wrapper)

        expect(socketCalls.submitForm).toHaveBeenCalledTimes(1)
    })

    it('labels the button "Submit" when the form names none', async () => {
        const form = await showForm({ submit_button_text: undefined })

        expect(buttonIn(form, 'Submit')).toBeDefined()
    })
})

describe('a workflow form posted into the chat', () => {
    const showInlineForm = async () => {
        const pushState = await mountWorkflow()
        await pushState({ type: 'form', form_data: { title: 'Quick question', fields: contactFields } })
        return pushState
    }

    it('adds one form message to the conversation, never a duplicate', async () => {
        const pushState = await showInlineForm()
        await pushState({ type: 'display_form', form_data: { fields: contactFields } })

        expect(socket.messages.value.filter((m) => m.message_type === 'form')).toHaveLength(1)
        expect(occurrences('Quick question')).toBe(1)
        expect(fieldLabelled(chatForm('Quick question'), 'Email').attributes('type')).toBe('email')
    })

    it('shows validation errors on submit and keeps the form', async () => {
        await showInlineForm()
        const form = chatForm('Quick question')

        await fieldLabelled(form, 'Email').setValue('nope')
        await fieldLabelled(form, 'Phone').setValue('123')
        await buttonIn(form, 'Submit').trigger('click')
        await settle(wrapper)

        expect(form.text()).toContain('Name is required')
        expect(form.text()).toContain('Please enter a valid email address')
        expect(form.text()).toContain('Please enter a valid phone number')
        expect(socketCalls.submitForm).not.toHaveBeenCalled()
        expect(chatForm('Quick question')).toBeDefined()
    })

    it('does not validate as the visitor types (only on submit)', async () => {
        // Pinned current behaviour (odd): live validation looks the field up in the
        // full-screen form or the socket's currentForm, and a chat form is in neither.
        await showInlineForm()

        await fieldLabelled(chatForm('Quick question'), 'Email').setValue('nope')

        expect(wrapper.text()).not.toContain('Please enter a valid email address')
    })

    it('submits the values and removes the form message', async () => {
        await showInlineForm()
        const form = chatForm('Quick question')

        await fieldLabelled(form, 'Name').setValue('Ada')
        await fieldLabelled(form, 'Email').setValue('ada@example.com')
        await buttonIn(form, 'Submit').trigger('click')
        await settle(wrapper)

        expect(socketCalls.submitForm).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com' })
        expect(socket.messages.value.some((m) => m.message_type === 'form')).toBe(false)
        expect(chatForm('Quick question')).toBeUndefined()
    })
})

describe('a workflow step asking for free text', () => {
    const showUserInput = async (attributes: Record<string, any> = {}) => {
        await mountAttached()
        socket.messages.value = [{
            message: '',
            message_type: 'user_input',
            attributes: { prompt_message: 'What is your order number?', confirmation_message: 'Thanks, looking it up.', ...attributes },
        }]
        await settle(wrapper)
    }

    // The box is labelled by the prompt above it; its placeholder is what the visitor reads.
    const answerBox = () => wrapper.find('textarea[placeholder="Type your message here..."]')
    const submit = () => buttonIn(screenAround(answerBox()), 'Submit')
    /** The lines that echo what was sent: "Your input", the answer, any confirmation. */
    const submittedLines = () => {
        const label = wrapper.findAll('p').find((p: any) => p.text().trim() === 'Your input')
        if (!label) return undefined
        return new DOMWrapper(label.element.parentElement as HTMLElement).findAll('p').map((p: any) => p.text().trim())
    }

    it('shows the prompt and keeps Submit disabled while the box is empty or blank', async () => {
        await showUserInput()

        expect(wrapper.text()).toContain('What is your order number?')
        expect(submit().attributes('disabled')).toBeDefined()

        await answerBox().setValue('   ')
        expect(submit().attributes('disabled')).toBeDefined()
    })

    it('sends the trimmed value and shows it with the confirmation message', async () => {
        await showUserInput()
        expect(answerBox().exists()).toBe(true)

        await answerBox().setValue('  #1042  ')
        await submit().trigger('click')
        await settle(wrapper)

        expect(socketCalls.sendMessage).toHaveBeenCalledTimes(1)
        expect(socketCalls.sendMessage.mock.calls[0][0]).toBe('#1042')
        expect(submittedLines()).toEqual(['Your input', '#1042', 'Thanks, looking it up.'])
        expect(answerBox().exists()).toBe(false)
    })

    it('also submits on Ctrl+Enter', async () => {
        await showUserInput()

        const box = answerBox()
        await box.setValue('#7')
        await box.trigger('keydown.enter', { ctrlKey: true })
        await settle(wrapper)

        expect(socketCalls.sendMessage.mock.calls[0][0]).toBe('#7')
    })

    it('omits the confirmation line when the step has none', async () => {
        await showUserInput({ confirmation_message: '  ' })

        await answerBox().setValue('#9')
        await submit().trigger('click')
        await settle(wrapper)

        expect(submittedLines()).toEqual(['Your input', '#9'])
    })

    it('reopens the box when sending fails', async () => {
        await showUserInput()
        socketCalls.sendMessage.mockRejectedValueOnce(new Error('offline'))

        await answerBox().setValue('#5')
        await submit().trigger('click')
        await settle(wrapper)

        expect(submittedLines()).toBeUndefined()
        expect((answerBox().element as HTMLTextAreaElement).value).toBe('#5')
    })
})
