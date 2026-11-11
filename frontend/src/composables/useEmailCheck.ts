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

import { ref } from 'vue'

/**
 * The email check (app/services/email_check.py): the visitor proves an email is
 * theirs with a code sent to it. One check per widget; its card shows it.
 *   email_check_start {email}  -> email_check_sent {email_masked}
 *   email_check_verify {code}  -> email_check_verified {email_masked}
 * Either may answer email_check_error {reason, retry_in, attempts_left}.
 */

export type EmailCheckStage = 'email' | 'code' | 'verified'

export interface EmailCheckState {
    stage: EmailCheckStage
    busy: boolean
    /** The address the code went to, masked by the server ("j•••@acme.com"). */
    maskedEmail: string
    /** Why the last step failed (a server reason), or ''. */
    error: string
    retryIn: number
    attemptsLeft: number
}

const fresh = (): EmailCheckState =>
    ({ stage: 'email', busy: false, maskedEmail: '', error: '', retryIn: 0, attemptsLeft: 0 })

export function useEmailCheck(options: {
    on: (event: string, listener: (...args: any[]) => void) => void
    emit: (event: string, data?: unknown) => void
    /** Tell the agent, as the visitor, that the email is confirmed. */
    announce: () => void
}) {
    const emailCheck = ref<EmailCheckState>(fresh())
    const update = (fields: Partial<EmailCheckState>) => { emailCheck.value = { ...emailCheck.value, ...fields } }

    options.on('email_check_sent', (data: { email_masked?: string }) => {
        update({ stage: 'code', busy: false, error: '', maskedEmail: data?.email_masked || '' })
    })
    options.on('email_check_verified', (data: { email_masked?: string }) => {
        update({ stage: 'verified', busy: false, error: '', maskedEmail: data?.email_masked || emailCheck.value.maskedEmail })
        options.announce()
    })
    options.on('email_check_error', (data: { reason?: string; retry_in?: number; attempts_left?: number }) => {
        const reason = typeof data?.reason === 'string' ? data.reason : 'send_failed'
        // A spent or expired code needs a new one: back to the email step.
        const restart = reason === 'locked' || reason === 'expired'
        update({
            busy: false,
            error: reason,
            retryIn: typeof data?.retry_in === 'number' ? data.retry_in : 0,
            attemptsLeft: typeof data?.attempts_left === 'number' ? data.attempts_left : 0,
            ...(restart ? { stage: 'email' } : {}),
        })
    })

    const startEmailCheck = (email: string) => {
        if (emailCheck.value.busy || !email.trim()) return
        update({ busy: true, error: '' })
        options.emit('email_check_start', { email: email.trim() })
    }
    const verifyEmailCode = (code: string) => {
        if (emailCheck.value.busy || !/^[0-9]{6}$/.test(code)) return
        update({ busy: true, error: '' })
        options.emit('email_check_verify', { code })
    }
    /** Another address: back to the first step. */
    const restartEmailCheck = () => { emailCheck.value = fresh() }

    return { emailCheck, startEmailCheck, verifyEmailCode, restartEmailCheck }
}
