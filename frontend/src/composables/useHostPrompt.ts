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

import { computed, ref, type Ref } from 'vue'
import type { Message } from '../types/chat'
import type { HostPrompt, PageChip } from '../webclient/actions/hostActionsClient'
import { useActionReceipts } from './useActionReceipts'
import { useHostActions } from './useHostActions'
import { useJourneys } from './useJourneys'
import { usePromptPlace } from './usePromptPlace'
import type { WidgetSocket } from './useWidgetSocket'

export interface HostPromptOptions {
    messages: Ref<Message[]>
    /** True while a reply is being written. */
    loading: Ref<boolean>
    /** The socket's events: page actions and journeys listen and answer on it. */
    on: WidgetSocket['on']
    emit: WidgetSocket['emit']
    /** Sends a tapped text reply through the normal message box. */
    sendQuickAction: (text: string) => void
}

const chatLine = (message: string, source: string): Message => ({
    message,
    message_type: 'bot',
    created_at: new Date().toISOString(),
    session_id: '',
    attributes: { source },
})

/**
 * What the embedding page puts in the chat: its in-app actions (confirm card and
 * receipts), a message it asked us to show (ChatterMate.prompt) and the journeys
 * the agent runs on the site. Call during setup: both clients listen to the page.
 */
export function useHostPrompt({ messages, loading, on, emit, sendQuickAction }: HostPromptOptions) {
    // In-app actions the embedding page registered (ChatterMate.registerActions), and
    // a message it asked us to show (ChatterMate.prompt). The prompt lives outside
    // `messages` so loading history can't wipe it; it joins the chat once answered.
    const hostPrompt = ref<HostPrompt | null>(null)
    // Each action leaves a line in the chat saying what it did.
    const { receipts, addReceipt, receiptsAfter } = useActionReceipts(messages)
    const { pendingConfirm, approveAction, declineAction, runLocalAction } = useHostActions(
        { on, emit },
        (prompt) => { hostPrompt.value = prompt },
        addReceipt,
    )

    // Journeys the agent runs on this site: a step's message and chips share the
    // page-message slot above; notices (a step's "then", the finish) join the chat.
    const { journeyProgress, chipBusy, runChip, skipStep, dismissJourney, noteActivity } = useJourneys({
        on,
        emit,
        currentPrompt: () => hostPrompt.value,
        showPrompt: (prompt) => { hostPrompt.value = prompt },
        addNotice: (text) => {
            messages.value.push(chatLine(text, 'journey'))
        },
        runLocalAction,
    })

    // A tapped reply reads as the visitor's answer. A text one goes through the
    // normal send; an action one runs straight away, so the step's message and the
    // reply join the chat here, and its receipt follows when the page is done.
    const onPageChip = (chip: PageChip) => {
        if (chip.kind === 'action' && !chipBusy.value && !pendingConfirm.value) {
            if (visiblePrompt.value) addPromptToChat(visiblePrompt.value)
            messages.value.push({ ...chatLine(chip.label, 'journey'), message_type: 'user' })
        }
        runChip(chip, (text) => sendQuickAction(text))
    }

    // A step's replies stay offered until the step moves on, so a declined or failed
    // action can be tried again; they make way while anything else is under way.
    const replyChips = computed(() => {
        const prompt = hostPrompt.value
        if (!prompt?.chips.length || pendingConfirm.value || loading.value) return []
        return prompt.chips
    })

    // The server sends a step's message on every sync until the step is done, and a
    // reply doesn't finish a step. Once it is in the chat (answered, or in the
    // loaded history) it isn't shown — or stored — a second time.
    const visiblePrompt = computed(() => {
        const prompt = hostPrompt.value
        if (!prompt || prompt.source !== 'journey') return prompt
        const inChat = messages.value.some(m => m.message_type === 'bot' && m.message === prompt.message)
        return inChat ? null : prompt
    })

    // A reply still being written comes first: a step that moves on mid-reply waits
    // for it, then keeps its place in the chat as anything newer arrives.
    const shownPrompt = computed(() => (loading.value ? null : visiblePrompt.value))
    const promptPlace = usePromptPlace(messages, shownPrompt)

    const addPromptToChat = (prompt: HostPrompt) => {
        messages.value.splice(promptPlace.index(), 0, chatLine(prompt.message, prompt.source))
    }

    // A page message being answered is stored with the reply (it never was before).
    // A journey step's replies stay until the step moves on; the server won't resend
    // them after a plain answer.
    const takeAnsweredPrompt = (): Record<string, unknown> => {
        noteActivity()
        const answeredPrompt = visiblePrompt.value
        if (answeredPrompt) addPromptToChat(answeredPrompt)
        if (hostPrompt.value?.source !== 'journey') hostPrompt.value = null
        return answeredPrompt ? { host_prompt: answeredPrompt.message, host_prompt_source: answeredPrompt.source } : {}
    }

    return {
        hostPrompt,
        receipts,
        receiptsAfter,
        pendingConfirm,
        approveAction,
        declineAction,
        journeyProgress,
        chipBusy,
        skipStep,
        dismissJourney,
        onPageChip,
        replyChips,
        shownPrompt,
        promptPlace,
        takeAnsweredPrompt,
    }
}
