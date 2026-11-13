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

import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
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
    /** True while a reply that arrived is still typing out on screen (useTypewriter). */
    revealing: Readonly<Ref<boolean>>
    /** The socket's events: page actions and journeys listen and answer on it. */
    on: WidgetSocket['on']
    emit: WidgetSocket['emit']
    /** Sends a tapped text reply through the normal message box. */
    sendQuickAction: (text: string) => void
    /** The visitor answered with an action reply: bring the chat to its end, as a send does. */
    afterAnswer: () => void
}

// A tap hides the reply buttons until what it started is over; if nothing more
// comes (a refused send, an action that left the step as it was) they come back.
const TAP_SETTLE_MS = 10_000

/** A step's identity: a sync re-sends the same step, and only a different one counts. */
const promptKey = (prompt: HostPrompt | null) => JSON.stringify([prompt?.message, prompt?.chips.map(c => c.label)])

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
export function useHostPrompt({
    messages, loading, revealing, on, emit, sendQuickAction, afterAnswer,
}: HostPromptOptions) {
    // In-app actions the embedding page registered (ChatterMate.registerActions), and
    // a message it asked us to show (ChatterMate.prompt). The prompt lives outside
    // `messages` so loading history can't wipe it; it joins the chat once answered.
    const hostPrompt = ref<HostPrompt | null>(null)
    // A tap hides the reply buttons until what it started is over (see below).
    const tapped = ref(false)
    // The last message when a new step came: choices it offered no longer hold the step back.
    const retiredChoices = ref<unknown>(null)
    /** Shows a page message. A sync re-sends the same step: only a different one counts. */
    const showHostPrompt = (prompt: HostPrompt | null) => {
        // An identical re-send keeps the shown one, so nothing watching it scrolls a reader back down
        if (JSON.stringify(prompt) === JSON.stringify(hostPrompt.value)) return
        if (promptKey(prompt) !== promptKey(hostPrompt.value)) {
            tapped.value = false
            retiredChoices.value = messages.value[messages.value.length - 1] ?? null
        }
        hostPrompt.value = prompt
    }
    // Each action leaves a line in the chat saying what it did.
    const { receipts, addReceipt, receiptsAfter } = useActionReceipts(messages)
    const { pendingConfirm, approveAction, declineAction, runLocalAction } = useHostActions(
        { on, emit },
        showHostPrompt,
        addReceipt,
    )

    // Journeys the agent runs on this site: a step's message and chips share the
    // page-message slot above; notices (a step's "then", the finish) join the chat.
    const { journeyProgress, chipBusy, runChip, skipStep, dismissJourney, noteActivity } = useJourneys({
        on,
        emit,
        currentPrompt: () => hostPrompt.value,
        showPrompt: showHostPrompt,
        addNotice: (text) => {
            messages.value.push(chatLine(text, 'journey'))
        },
        runLocalAction,
    })

    // A tapped reply reads as the visitor's answer. A text one goes through the
    // normal send; an action one runs straight away, so the step's message and the
    // reply join the chat here, and its receipt follows when the page is done.
    const onPageChip = (chip: PageChip) => {
        tapped.value = true
        if (chip.kind === 'action' && !chipBusy.value && !pendingConfirm.value) {
            if (visiblePrompt.value) addPromptToChat(visiblePrompt.value)
            messages.value.push({ ...chatLine(chip.label, 'journey'), message_type: 'user' })
            // What it starts (a confirm card, the receipt) shows below: the
            // visitor follows it even if they had scrolled up a little.
            afterAnswer()
        }
        // A done action moves the step on (new replies arrive with it); one declined
        // or failed brings these back to try again.
        runChip(chip, (text) => sendQuickAction(text), (status) => { if (status !== 'ok') tapped.value = false })
    }

    // The agent is still answering: on its way, or typing out on screen.
    const replying = computed(() => loading.value || revealing.value)

    // A tap answers at once: the replies go that moment, and stay gone until what
    // it started (the reply, or the page's action) has finished.
    let tapFallback: ReturnType<typeof setTimeout> | undefined
    const settleTapLater = () => {
        clearTimeout(tapFallback)
        tapFallback = setTimeout(() => { if (!replying.value && !chipBusy.value) tapped.value = false }, TAP_SETTLE_MS)
    }
    watch(tapped, (isTapped) => { if (isTapped) settleTapLater(); else clearTimeout(tapFallback) })
    watch(chipBusy, (busy) => { if (!busy && tapped.value) settleTapLater() })
    // What the tap started is over: its reply has typed out (a new step resets it in showHostPrompt).
    watch(replying, (isReplying, was) => { if (was && !isReplying) tapped.value = false })
    onUnmounted(() => clearTimeout(tapFallback))

    // The agent's own choices, under its latest answer as chips (AnswerMessage), stand
    // in for the step's buttons until answered; a new step after them takes over.
    const answerOffersChoices = computed(() => {
        const last = messages.value[messages.value.length - 1]
        if (!last || last === retiredChoices.value || last.message_type !== 'bot') return false
        const choices = last.attributes?.quick_replies
        return Array.isArray(choices) && choices.length > 0
    })

    // A step's replies stay offered until the step moves on, so a declined or failed
    // action can be tried again; they make way while anything else is under way.
    const replyChips = computed<PageChip[]>(() => {
        if (pendingConfirm.value || replying.value || tapped.value || answerOffersChoices.value) return []
        return hostPrompt.value?.chips ?? []
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

    // A reply still being written, or still typing out, comes first: a step that
    // moves on mid-reply waits for it, then keeps its place as anything newer arrives.
    const shownPrompt = computed(() => (replying.value ? null : visiblePrompt.value))
    const promptPlace = usePromptPlace(messages, shownPrompt)

    const addPromptToChat = (prompt: HostPrompt) => {
        messages.value.splice(promptPlace.index(), 0, chatLine(prompt.message, prompt.source))
    }

    // A page message being answered is stored with the reply (it never was before).
    // A journey step's replies stay until the step moves on; the server won't resend
    // them after a plain answer.
    const takeAnsweredPrompt = (): Record<string, unknown> => {
        noteActivity()
        // Only one on screen: a step still waiting for a reply to type out wasn't seen.
        const answeredPrompt = shownPrompt.value
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
