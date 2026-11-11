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
import { nextTick, ref } from 'vue'
import { useComposer, type StagedAttachment } from '@/composables/useComposer'

interface SetupOptions {
    hasStartedChat?: boolean
    email?: string
    collectEmail?: boolean
    workflowAgent?: boolean
    attachments?: StagedAttachment[]
}

const setup = ({
    hasStartedChat = true,
    email = '',
    collectEmail = false,
    workflowAgent = false,
    attachments = [],
}: SetupOptions = {}) => {
    const socket = {
        loading: ref(false),
        hasStartedChat: ref(hasStartedChat),
        connectionStatus: ref('connected'),
        sendMessage: vi.fn().mockResolvedValue(undefined),
    }
    const beforeSend = vi.fn().mockReturnValue({})
    const afterSend = vi.fn()
    const authorize = vi.fn().mockResolvedValue(true)
    const emailInput = ref(email)
    const uploadedAttachments = ref<StagedAttachment[]>(attachments)
    const composer = useComposer({
        socket,
        emailGate: { emailInput, shouldCollectEmail: ref(collectEmail) },
        hasConversationToken: ref(true),
        isAskAnythingStyle: ref(false),
        uploadedAttachments,
        authorize,
        beforeSend,
        afterSend,
        isWorkflowAgent: () => workflowAgent,
    })
    return { ...composer, socket, beforeSend, afterSend, authorize, emailInput, uploadedAttachments }
}

const keyEvent = (shiftKey: boolean) => ({
    key: 'Enter',
    shiftKey,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
}) as unknown as KeyboardEvent

describe('useComposer', () => {
    const originalRevoke = URL.revokeObjectURL
    afterEach(() => {
        URL.revokeObjectURL = originalRevoke
        vi.restoreAllMocks()
    })

    it('sends the typed message and clears the box', async () => {
        const composer = setup()
        composer.newMessage.value = 'hello'
        await composer.sendMessage()
        expect(composer.socket.sendMessage).toHaveBeenCalledWith('hello', '', [], {})
        expect(composer.newMessage.value).toBe('')
        expect(composer.beforeSend).toHaveBeenCalledOnce()
        expect(composer.afterSend).toHaveBeenCalledOnce()
    })

    it('holds a message typed during a reply and sends it when the reply lands', async () => {
        const composer = setup()
        composer.socket.loading.value = true
        composer.newMessage.value = 'one more thing'
        await composer.sendMessage()
        expect(composer.pendingSend.value).toBe(true)
        expect(composer.socket.sendMessage).not.toHaveBeenCalled()

        composer.socket.loading.value = false
        await nextTick()
        await nextTick()
        expect(composer.pendingSend.value).toBe(false)
        expect(composer.socket.sendMessage).toHaveBeenCalledWith('one more thing', '', [], {})
    })

    it('drops the hold, keeping the text, when the chat ended meanwhile', async () => {
        const composer = setup()
        composer.socket.loading.value = true
        composer.newMessage.value = 'late'
        await composer.sendMessage()
        composer.socket.hasStartedChat.value = false
        composer.socket.loading.value = false
        await nextTick()
        expect(composer.socket.sendMessage).not.toHaveBeenCalled()
        expect(composer.newMessage.value).toBe('late')
    })

    it('holds back a message that looks like a secret', async () => {
        const composer = setup()
        composer.newMessage.value = 'my card is 4111 1111 1111 1111'
        expect(composer.secretInMessage.value).toBe(true)
        await composer.sendMessage()
        expect(composer.socket.sendMessage).not.toHaveBeenCalled()
    })

    it('says Connecting... until the socket is up', () => {
        const composer = setup()
        expect(composer.placeholderText.value).toBe('Type a message...')
        composer.socket.connectionStatus.value = 'connecting'
        expect(composer.placeholderText.value).toBe('Connecting...')
        expect(composer.isMessageInputEnabled.value).toBe(false)
    })

    it('authorizes with the typed email before the first message goes out', async () => {
        const composer = setup({ hasStartedChat: false, email: 'ada@example.com', collectEmail: true })
        composer.newMessage.value = 'hi'
        await composer.sendMessage()
        expect(composer.authorize).toHaveBeenCalledOnce()
        expect(composer.authorize.mock.invocationCallOrder[0])
            .toBeLessThan(composer.socket.sendMessage.mock.invocationCallOrder[0])
        expect(composer.socket.sendMessage).toHaveBeenCalledWith('hi', 'ada@example.com', [], {})
    })

    it('does not authorize again once the chat has started', async () => {
        const composer = setup({ hasStartedChat: true, email: 'ada@example.com' })
        composer.newMessage.value = 'hi again'
        await composer.sendMessage()
        expect(composer.authorize).not.toHaveBeenCalled()
        expect(composer.socket.sendMessage).toHaveBeenCalledOnce()
    })

    it('sends the extra fields beforeSend returns, such as the host prompt', async () => {
        const composer = setup()
        composer.beforeSend.mockReturnValue({ host_prompt: 'Visitor is on the pricing page' })
        composer.newMessage.value = 'how much?'
        await composer.sendMessage()
        expect(composer.socket.sendMessage).toHaveBeenCalledWith(
            'how much?', '', [], { host_prompt: 'Visitor is on the pricing page' })
    })

    it('sends staged files in the outgoing shape and revokes their blob URLs after', async () => {
        const revoke = vi.fn()
        URL.revokeObjectURL = revoke
        const composer = setup({
            attachments: [{
                content: 'aGVsbG8=',
                filename: 'note.txt',
                type: 'text/plain',
                size: 5,
                url: 'blob:preview',
                file_url: 'blob:file',
            }],
        })
        composer.newMessage.value = 'see attached'
        await composer.sendMessage()
        expect(composer.socket.sendMessage).toHaveBeenCalledWith('see attached', '', [
            { content: 'aGVsbG8=', filename: 'note.txt', content_type: 'text/plain', size: 5 },
        ], {})
        expect(revoke).toHaveBeenCalledWith('blob:preview')
        expect(revoke).toHaveBeenCalledWith('blob:file')
        expect(revoke.mock.invocationCallOrder[0])
            .toBeGreaterThan(composer.socket.sendMessage.mock.invocationCallOrder[0])
        expect(composer.uploadedAttachments.value).toEqual([])
    })

    it('sends files on their own, with no text', async () => {
        const composer = setup({
            attachments: [{ content: 'eA==', filename: 'a.png', type: 'image/png', size: 1 }],
        })
        await composer.sendMessage()
        expect(composer.socket.sendMessage).toHaveBeenCalledOnce()
        expect(composer.socket.sendMessage.mock.calls[0][0]).toBe('')
    })

    it('keeps the text and files and skips afterSend when the send fails', async () => {
        const revoke = vi.fn()
        URL.revokeObjectURL = revoke
        const file = { content: 'eA==', filename: 'a.png', type: 'image/png', size: 1, url: 'blob:a' }
        const composer = setup({ attachments: [file] })
        composer.socket.sendMessage.mockRejectedValue(new Error('socket closed'))
        composer.newMessage.value = 'please keep me'
        await expect(composer.sendMessage()).rejects.toThrow('socket closed')
        expect(composer.newMessage.value).toBe('please keep me')
        expect(composer.uploadedAttachments.value).toEqual([file])
        expect(revoke).not.toHaveBeenCalled()
        expect(composer.afterSend).not.toHaveBeenCalled()
    })

    it('does nothing for an empty message with no files', async () => {
        const composer = setup()
        composer.newMessage.value = '   '
        await composer.sendMessage()
        expect(composer.beforeSend).not.toHaveBeenCalled()
        expect(composer.socket.sendMessage).not.toHaveBeenCalled()
        expect(composer.afterSend).not.toHaveBeenCalled()
    })

    it('sends on Enter but not on Shift+Enter', async () => {
        const composer = setup()
        composer.newMessage.value = 'line one'

        const shiftEnter = keyEvent(true)
        composer.handleKeyPress(shiftEnter)
        await nextTick()
        expect(shiftEnter.preventDefault).not.toHaveBeenCalled()
        expect(composer.socket.sendMessage).not.toHaveBeenCalled()

        const enter = keyEvent(false)
        composer.handleKeyPress(enter)
        await nextTick()
        expect(enter.preventDefault).toHaveBeenCalledOnce()
        expect(enter.stopPropagation).toHaveBeenCalledOnce()
        expect(composer.socket.sendMessage).toHaveBeenCalledWith('line one', '', [], {})
    })

    it('ignores a quick action while the box is closed', async () => {
        const composer = setup()
        composer.socket.connectionStatus.value = 'connecting'
        composer.newMessage.value = 'draft'
        composer.sendQuickAction('Track my order')
        await nextTick()
        expect(composer.newMessage.value).toBe('draft')
        expect(composer.socket.sendMessage).not.toHaveBeenCalled()
    })

    it('sends a quick action label through the normal send path', async () => {
        const composer = setup()
        composer.sendQuickAction('Track my order')
        await vi.waitFor(() => expect(composer.afterSend).toHaveBeenCalledOnce())
        expect(composer.socket.sendMessage).toHaveBeenCalledWith('Track my order', '', [], {})
        expect(composer.newMessage.value).toBe('')
    })

    it('lets the visitor keep typing while a reply is coming in', () => {
        const composer = setup()
        composer.socket.loading.value = true
        expect(composer.isMessageInputEnabled.value).toBe(false)
        expect(composer.canTypeMessage.value).toBe(true)
    })

    it('keeps the box closed until a valid email is typed', () => {
        const composer = setup({ hasStartedChat: false, collectEmail: true })
        expect(composer.isMessageInputEnabled.value).toBe(false)
        expect(composer.canTypeMessage.value).toBe(false)
        composer.emailInput.value = 'ada@example.com'
        expect(composer.isMessageInputEnabled.value).toBe(true)
    })

    it('opens the box for a workflow agent before an email is in', () => {
        const composer = setup({ hasStartedChat: false, collectEmail: true, workflowAgent: true })
        expect(composer.isMessageInputEnabled.value).toBe(true)
    })

    it('clearComposer empties the text and the staged files', () => {
        const composer = setup({
            attachments: [{ content: 'eA==', filename: 'a.png', type: 'image/png', size: 1 }],
        })
        composer.newMessage.value = 'half typed'
        composer.clearComposer()
        expect(composer.newMessage.value).toBe('')
        expect(composer.uploadedAttachments.value).toEqual([])
    })
})
