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
import { onMounted, ref, defineAsyncComponent } from 'vue'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

// Lazy load components
const AISetup = defineAsyncComponent(() => import('../ai/AISetup.vue'))
const AgentList = defineAsyncComponent(() => import('../agent/AgentList.vue'))
const AIAgentOnboarding = defineAsyncComponent(() => import('./onboarding/AIAgentOnboarding.vue'))

import { useAgentStorage } from '@/utils/storage'
import { aiService } from '@/services/ai'
import { agentService } from '@/services/agent'
import { AxiosError } from 'axios'

const agentStorage = useAgentStorage()

const error = ref<string | null>(null)
const isLoading = ref(false)
const isAISetupMode = ref(false)
// First-run guided setup: shown when the org has no agents (and didn't skip)
const showOnboarding = ref(false)

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

// Onboarding wizard finished (or was skipped) — refresh and show the list
const handleOnboardingComplete = async () => {
    showOnboarding.value = false
    isAISetupMode.value = false
    await fetchAgents()
}

const resumeOnboarding = () => {
    showOnboarding.value = true
}

onMounted(async () => {
    try {
        isLoading.value = true
        // Authoritative check: does this org have any agents yet?
        const agents = await agentService.getOrganizationAgents()
        if (agents.length > 0) {
            agentStorage.setAgents(agents)
            return
        }
        // No agents yet → always show the guided first-agent setup. "Skip for
        // now" only dismisses it for the current view; it returns on reload /
        // re-entry until the first agent actually exists.
        showOnboarding.value = true
    } catch (err) {
        error.value = 'Failed to load agents'
        console.error(err)
    } finally {
        isLoading.value = false
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

            <div v-else-if="showOnboarding" class="onboarding-container">
                <AIAgentOnboarding @complete="handleOnboardingComplete" />
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
                <AgentList @toggle-fullscreen="handleFullscreenToggle" @resume-onboarding="resumeOnboarding" />
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