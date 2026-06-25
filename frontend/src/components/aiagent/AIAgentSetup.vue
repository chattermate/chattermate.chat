<!--
ChatterMate - A I Agent Setup
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
import { onMounted, ref, defineAsyncComponent } from 'vue'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

// Lazy load components
const AISetup = defineAsyncComponent(() => import('../ai/AISetup.vue'))
const AgentList = defineAsyncComponent(() => import('../agent/AgentList.vue'))

import { useAgentStorage } from '@/utils/storage'
import { aiService } from '@/services/ai'
import { agentService } from '@/services/agent'
import { AxiosError } from 'axios'

const agentStorage = useAgentStorage()

const error = ref<string | null>(null)
const isLoading = ref(false)
const isAISetupMode = ref(false)

const props = defineProps<{
    model: string
}>()

const emit = defineEmits<{
    (e: 'toggle-fullscreen', isFullscreen: boolean): void
}>()

const checkAIConfig = async () => {
    try {
        isLoading.value = true
        await aiService.getOrganizationConfig()
        isAISetupMode.value = false
        await fetchAgents()
    } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.status === 404) {
            // No AI config found
            isAISetupMode.value = true
        } else {
            error.value = 'Failed to check AI configuration'
            console.error(err)
        }
    } finally {
        isLoading.value = false
    }
}

const fetchAgents = async () => {
    try {
        isLoading.value = true
        const agents = await agentService.getOrganizationAgents()
        if (agents.length > 0) {
            agentStorage.setAgents(agents)
        }
    } catch (err) {
        error.value = 'Failed to fetch agents'
        console.error(err)
    } finally {
        isLoading.value = false
    }
}

// Handle fullscreen toggle from agent list
const handleFullscreenToggle = (isFullscreen: boolean) => {
    emit('toggle-fullscreen', isFullscreen)
}

onMounted(async () => {
    const agents = agentStorage.getAgents()
    if (agents.length === 0) {
        await checkAIConfig()
    }
})
</script>

<template>
    <div class="chat-window">
        <div class="messages">
            <div v-if="isLoading" class="loading-container">
                <div class="loader"></div>
            </div>

            <div v-else-if="error" class="error-message">
                {{ error }}
            </div>

            <div v-else-if="isAISetupMode" class="setup-messages">
                <div class="ai-provider-setup">
                    <h3>Configure AI Provider</h3>
                    <div class="ai-setup-container">
                        <AISetup @ai-setup-complete="checkAIConfig" />
                    </div>
                </div>
            </div>
            <div v-else class="agent-list-container">
                <AgentList @toggle-fullscreen="handleFullscreenToggle" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-window {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0 auto;
    background: transparent;
}

.messages {
    flex: 1;
    background: transparent;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.ai-provider-setup {
    margin-bottom: var(--space-xl);
    padding: var(--space-xl);
}

.ai-provider-setup h3 {
    margin-bottom: var(--space-lg);
    color: var(--text);
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: 700;
    text-align: center;
}

.ai-setup-container {
    margin: 0 auto;
}

.error-message {
    padding: var(--space-md);
    background: var(--error-bg);
    color: var(--error-color);
    border-radius: var(--radius-lg);
    text-align: center;
    margin-bottom: var(--space-md);
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.loader {
    width: 48px;
    height: 48px;
    border: 3px solid var(--o10);
    border-bottom-color: var(--accent-ink);
    border-radius: 50%;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% { transform: rotate(0deg) }
    100% { transform: rotate(360deg) }
}
</style>