<!--
ChatterMate - Agent List
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

import type { Agent } from '@/types/agent';
import { getAvatarUrl } from '@/utils/avatars'
import { useAgentStorage } from '@/utils/storage'
import { onMounted, ref } from 'vue';
import AgentDetail from './AgentDetail.vue'

const agentStorage = useAgentStorage()

const agents = ref<Agent[]>([])
const selectedAgent = ref<Agent | null>(null)

const refreshAgents = () => {
    agents.value = agentStorage.getAgents()
}

onMounted(() => {
    refreshAgents()
})

const handleAgentClose = () => {
    refreshAgents()
    selectedAgent.value = null
}

const getAgentPhotoUrl = (agent: Agent) => {
    if (!agent.customization?.photo_url) {
        return getAvatarUrl(agent.agent_type.toLowerCase())
    }
    
    // If it's an S3 URL (contains amazonaws.com), use it directly
    if (agent.customization.photo_url.includes('amazonaws.com')) {
        return agent.customization.photo_url
    }
    
    // For local storage, prepend the API URL
    return import.meta.env.VITE_API_URL + agent.customization.photo_url
}
</script>

<template>
    <div class="agent-list">
        <div v-if="!selectedAgent">
            <div class="list-header">
                <h3>Agent Management</h3>
                <p class="list-description">Manage and test your AI assistants. Configure settings, update
                    instructions,
                    and control knowledge bases for each agent.</p>
            </div>
            <div class="agents-grid">
                <div v-for="agent in agents" :key="agent.id" class="agent-card" @click="selectedAgent = agent">
                    <div class="agent-left">
                        <div class="agent-avatar">
                            <img :src="getAgentPhotoUrl(agent)" :alt="agent.name">
                        </div>
                        <div class="status">
                            <div class="status-indicator" :class="{ 'online': agent.is_active }"></div>
                            <span class="status-text">{{ agent.is_active ? 'Online' : 'Offline' }}</span>
                        </div>
                    </div>
                    <div class="agent-info">
                        <div class="agent-header">
                            <h4>{{ agent.display_name || agent.name }}</h4>
                            <span class="agent-name">{{ agent.name }}</span>
                        </div>
                        <p class="agent-description">{{ agent.description }}</p>
                    </div>
                </div>
            </div>
        </div>
        <AgentDetail v-else :agent="selectedAgent" @close="handleAgentClose" />
    </div>
</template>

<style scoped>
.agent-list {
    padding: var(--space-lg);
    max-width: 1200px;
    margin: 0 auto;
}

.list-header {
    margin-bottom: var(--space-xl);
    background: linear-gradient(to right, var(--primary-soft), var(--background-soft));
    padding: var(--space-xl);
    border-radius: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.list-header h3 {
    font-size: 2rem;
    margin-bottom: var(--space-sm);
    background: linear-gradient(to right, var(--primary-color), var(--text-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.list-description {
    color: var(--text-muted);
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 700px;
}

.agents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg);
}

.agent-card {
    background: var(--background-base);
    padding: var(--space-lg);
    border-radius: 24px;
    border: 1px solid var(--border-color);
    display: flex;
    gap: var(--space-lg);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.agent-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
}

.agent-avatar {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    overflow: hidden;
    background: var(--background-soft);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.agent-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.agent-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.agent-header {
    margin-bottom: var(--space-xs);
}

.agent-header h4 {
    font-size: 1.25rem;
    margin: 0;
    color: var(--text-color);
    font-weight: 600;
}

.agent-name {
    display: block;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-family: 'Roboto Mono', monospace;
    margin-top: var(--space-xs);
}

.agent-description {
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
}

.status {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--background-soft);
    border-radius: var(--radius-full);
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--error-color);
}

.status-indicator.online {
    background: var(--success-color);
}

.status-text {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
}

.agent-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.15);
    border-color: var(--primary-color);
}

.agent-card:hover .agent-avatar img {
    transform: scale(1.05);
}

@media (max-width: 768px) {
    .agent-list {
        padding: var(--space-md);
    }

    .list-header {
        padding: var(--space-lg);
    }

    .list-header h3 {
        font-size: 1.5rem;
    }

    .agents-grid {
        grid-template-columns: 1fr;
    }
}
</style>