<!--
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
-->

<script setup lang="ts">
/**
 * Asks before a new chat ends the current one.
 *
 * Ending a chat cannot be undone, and the control used to say so only in a tooltip
 * and a hint that lapsed after a few seconds - easy to miss, and easy to trigger by
 * accident. This states the consequence inside the widget and waits for an answer.
 * Shared by the chat header and the Ask AI bar so both ask the same question.
 */
import {
    NEW_CHAT_CANCEL_ACTION,
    NEW_CHAT_CONFIRM_ACTION,
    NEW_CHAT_CONFIRM_QUESTION,
} from './new-chat'

defineProps<{
    /** Shown instead of the question when the last attempt failed. */
    error?: string
    /** Disables the actions while the close is in flight. */
    busy?: boolean
}>()

const emit = defineEmits<{
    (e: 'confirm'): void
    (e: 'cancel'): void
}>()
</script>

<template>
    <div class="new-chat-confirm" role="alertdialog" aria-live="polite" :aria-label="NEW_CHAT_CONFIRM_QUESTION">
        <p class="new-chat-confirm__question">{{ error || NEW_CHAT_CONFIRM_QUESTION }}</p>
        <div class="new-chat-confirm__actions">
            <button type="button" class="new-chat-confirm__button" :disabled="busy" @click="emit('cancel')">
                {{ NEW_CHAT_CANCEL_ACTION }}
            </button>
            <button type="button" class="new-chat-confirm__button new-chat-confirm__button--primary" :disabled="busy"
                @click="emit('confirm')">
                {{ NEW_CHAT_CONFIRM_ACTION }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.new-chat-confirm {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 10px 14px;
    border-bottom: 1px solid var(--cm-hairline, rgba(0, 0, 0, 0.07));
    background: var(--cm-agent-bg, rgba(0, 0, 0, 0.03));
    font-family: var(--cm-body-font, inherit);
}

.new-chat-confirm__question {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.35;
    color: var(--cm-text, inherit);
}

.new-chat-confirm__actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
}

.new-chat-confirm__button {
    padding: 5px 11px;
    border-radius: var(--cm-field-radius, 8px);
    border: 1px solid var(--cm-border, rgba(0, 0, 0, 0.12));
    background: transparent;
    color: var(--cm-text, inherit);
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s ease;
}

.new-chat-confirm__button--primary {
    border-color: transparent;
    background: var(--cm-accent, #f34611);
    color: var(--cm-on-accent, #ffffff);
}

.new-chat-confirm__button:disabled {
    opacity: 0.5;
    cursor: default;
}

.new-chat-confirm__button:not(:disabled):hover {
    opacity: 0.85;
}

/* Ending a chat cannot be undone, and on a phone this is a thumb hitting glass:
   give both answers a real touch target rather than a 27px pill. */
@media (pointer: coarse) {
    .new-chat-confirm {
        padding: 10px 12px;
    }

    .new-chat-confirm__button {
        min-height: 40px;
        padding: 8px 14px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .new-chat-confirm__button {
        transition: none;
    }
}
</style>
