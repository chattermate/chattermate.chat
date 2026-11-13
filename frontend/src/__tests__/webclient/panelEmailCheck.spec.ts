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
import { type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import MessageItem from '@/webclient/panel/MessageItem.vue'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'
import type { WidgetMessage } from '@/types/widget'

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController
afterEach(() => { wrapper?.unmount(); wrapper = undefined })

const asking = (): WidgetMessage =>
    ({ message_type: 'bot', message: 'Confirm your email below.', created_at: '', session_id: '', attributes: { email_check: true } })

const mountReply = (messages: WidgetMessage[], index = 0) => {
    ctrl = fakeController()
    ctrl.messages.value = messages
    wrapper = mountWithController(MessageItem, ctrl, { message: messages[index], index })
}

describe('the email check card', () => {
    it('asks for the email and sends it', async () => {
        mountReply([asking()])
        const card = wrapper!.get('section[aria-label="Confirm your email"]')
        await card.get('input[type="email"]').setValue('jane@acme.com')
        await card.get('form').trigger('submit')
        expect(ctrl.startEmailCheck).toHaveBeenCalledWith('jane@acme.com', 'chat')
    })

    it('takes the code, sending it once all six digits are in', async () => {
        mountReply([asking()])
        ctrl.emailCheck.value = { ...ctrl.emailCheck.value, stage: 'code', maskedEmail: 'j•••@acme.com' }
        await nextTick()
        const field = wrapper!.get('input[autocomplete="one-time-code"]')
        expect(wrapper!.text()).toContain('Enter the code we sent to j•••@acme.com.')
        await field.setValue('12 34a5')
        expect(ctrl.verifyEmailCode).not.toHaveBeenCalled()
        await field.setValue('123456')
        expect(ctrl.verifyEmailCode).toHaveBeenCalledWith('123456')
    })

    it('says what went wrong and how many tries are left', async () => {
        mountReply([asking()])
        ctrl.emailCheck.value = { ...ctrl.emailCheck.value, stage: 'code', error: 'wrong_code', attemptsLeft: 2 }
        await nextTick()
        expect(wrapper!.get('[role="alert"]').text()).toBe("That code isn't right. 2 tries left.")
        expect(wrapper!.get('input[autocomplete="one-time-code"]').attributes('aria-invalid')).toBe('true')
    })

    it('shows the confirmed email once done', async () => {
        mountReply([asking()])
        ctrl.emailCheck.value = { ...ctrl.emailCheck.value, stage: 'verified', maskedEmail: 'j•••@acme.com' }
        await nextTick()
        expect(wrapper!.get('[role="status"]').text()).toBe('Email confirmed: j•••@acme.com')
        expect(wrapper!.find('input').exists()).toBe(false)
    })

    it('shows once, on the latest reply that asked', () => {
        mountReply([asking(), { message_type: 'user', message: 'ok', created_at: '', session_id: '' }, asking()], 0)
        expect(wrapper!.find('.cm-email-check').exists()).toBe(false)
    })
})
