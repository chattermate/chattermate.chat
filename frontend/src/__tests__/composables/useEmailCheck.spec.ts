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
import { useEmailCheck } from '@/composables/useEmailCheck'

const setUp = () => {
    const listeners: Record<string, (data: any) => void> = {}
    const emit = vi.fn()
    const announce = vi.fn()
    const onVerified = vi.fn()
    const check = useEmailCheck({ on: (event, fn) => { listeners[event] = fn }, emit, announce, onVerified })
    return { ...check, emit, announce, onVerified, hear: (event: string, data?: unknown) => listeners[event](data) }
}

describe('useEmailCheck', () => {
    it('goes email → code → verified, and tells the agent once confirmed', () => {
        const check = setUp()
        check.startEmailCheck(' jane@acme.com ')
        expect(check.emit).toHaveBeenCalledWith('email_check_start', { email: 'jane@acme.com' })
        expect(check.emailCheck.value.busy).toBe(true)
        check.hear('email_check_sent', { email_masked: 'j•••@acme.com' })
        expect(check.emailCheck.value).toMatchObject({ stage: 'code', busy: false, maskedEmail: 'j•••@acme.com' })
        check.verifyEmailCode('123456')
        expect(check.emit).toHaveBeenLastCalledWith('email_check_verify', { code: '123456' })
        check.hear('email_check_verified', { email_masked: 'j•••@acme.com' })
        expect(check.emailCheck.value.stage).toBe('verified')
        expect(check.announce).toHaveBeenCalledTimes(1)
    })

    it('sends nothing while busy, or a code that is not six digits', () => {
        const check = setUp()
        check.startEmailCheck('jane@acme.com')
        check.startEmailCheck('jane@acme.com')
        check.verifyEmailCode('12a456')
        expect(check.emit).toHaveBeenCalledTimes(1)
    })

    it('keeps the code step after a wrong code, and goes back to the email after a spent one', () => {
        const check = setUp()
        check.hear('email_check_sent', { email_masked: 'j•••@acme.com' })
        check.hear('email_check_error', { reason: 'wrong_code', attempts_left: 3 })
        expect(check.emailCheck.value).toMatchObject({ stage: 'code', error: 'wrong_code', attemptsLeft: 3 })
        check.hear('email_check_error', { reason: 'locked' })
        expect(check.emailCheck.value.stage).toBe('email')
    })

    it('starts over for another address', () => {
        const check = setUp()
        check.hear('email_check_sent', { email_masked: 'j•••@acme.com' })
        check.restartEmailCheck()
        expect(check.emailCheck.value).toMatchObject({ stage: 'email', maskedEmail: '', error: '' })
    })

    it('asked from the history screen: says so to the server, and tells the history, not the agent', () => {
        const check = setUp()
        check.startEmailCheck('jane@acme.com', 'history')
        expect(check.emit).toHaveBeenCalledWith('email_check_start', { email: 'jane@acme.com', purpose: 'history' })
        check.hear('email_check_sent', { email_masked: 'j•••@acme.com' })
        check.verifyEmailCode('123456')
        check.hear('email_check_verified', { email_masked: 'j•••@acme.com' })
        expect(check.announce).not.toHaveBeenCalled()
        expect(check.onVerified).toHaveBeenCalledWith('history')
    })

    it('another address keeps who asked', () => {
        const check = setUp()
        check.startEmailCheck('jane@acme.com', 'history')
        check.hear('email_check_sent', { email_masked: 'j•••@acme.com' })
        check.restartEmailCheck()
        expect(check.emailCheck.value).toMatchObject({ stage: 'email', purpose: 'history' })
    })

    it('a check the agent asked for still tells it', () => {
        const check = setUp()
        check.startEmailCheck('jane@acme.com')
        check.hear('email_check_verified', { email_masked: 'j•••@acme.com' })
        expect(check.onVerified).toHaveBeenCalledWith('chat')
        expect(check.announce).toHaveBeenCalledTimes(1)
    })
})
