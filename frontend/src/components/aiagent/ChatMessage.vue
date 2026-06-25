<!--
ChatterMate - Chat Message
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
-->

<script setup lang="ts">
import robotIcon from '@/assets/robot.png'
import userIcon from '@/assets/user.png'

defineProps<{
    role: 'user' | 'bot' | 'error' | 'agent'
    content: string
    agent?: string
    avatar?: string
    isLoading?: boolean
}>()
</script>

<template>
    <div class="message" :class="role">
        <div class="avatar" :class="role">
            <template v-if="role === 'user'">
                <img :src="userIcon" alt="User" class="user-icon" />
            </template>
            <template v-else-if="role === 'bot'">
                <img :src="avatar || robotIcon" :alt="agent || 'AI Assistant'" class="robot-icon" />
            </template>
            <template v-else>
                ⚠️
            </template>
        </div>
        <div class="bubble">
            <template v-if="isLoading && role === 'bot'">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </template>
            <template v-else>
                {{ content }}
            </template>
        </div>
    </div>
</template>

<style scoped>
.message {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-sm);
    margin-bottom: var(--space-md);
    animation: fadeIn 0.3s ease-out;
}

.message.user {
    flex-direction: row-reverse;
}

.avatar {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    font-size: 1.2em;
}

.avatar.assistant {
    background: var(--primary-soft);
    padding: var(--space-xs);
}

.robot-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.avatar.user {
    background: var(--background-soft);
    padding: var(--space-xs);
}

.user-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.bubble {
    max-width: 70%;
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    line-height: 1.5;
    position: relative;
}

.message.assistant .bubble {
    background: #313131;
    border-top-left-radius: 4px;
    /* Slightly darker light black background */
    border-top-left-radius: 4px;
}

.message.user .bubble {
    background: var(--primary-color);
    color: black;
    border-top-right-radius: 4px;
}

.message.error .bubble {
    background: var(--error-soft, #fef2f2);
    color: var(--error-color, #dc2626);
    border: 1px solid var(--error-color, #dc2626);
}

.avatar.error {
    background: var(--error-soft, #fef2f2);
    color: var(--error-color, #dc2626);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: var(--space-xs);
    opacity: 0.8;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    background: var(--primary-color, var(--accent-ink));
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes typing {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1.0);
    }
}
</style>