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
import type { Widget } from '@/types/widget';
import { getAvatarUrl } from '@/utils/avatars'
import { useAgentStorage, useSubscriptionStorage } from '@/utils/storage'
import { onMounted, ref, computed } from 'vue';
import AgentDetail from './AgentDetail.vue'
import CreateAgentModal from './CreateAgentModal.vue'
import { widgetService } from '@/services/widget'
import { toast } from 'vue-sonner'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const agentStorage = useAgentStorage()
const subscriptionStorage = useSubscriptionStorage()
const { hasEnterpriseModule } = useEnterpriseFeatures()

const agents = ref<Agent[]>([])
const selectedAgent = ref<Agent | null>(null)
const showCreateModal = ref(false)
const showUpgradeModal = ref(false)
const widgetLoadingMap = ref<Record<string, boolean>>({})
const widgetMap = ref<Record<string, Widget | null>>({})

const emit = defineEmits<{
    (e: 'toggle-fullscreen', isFullscreen: boolean): void
}>()

// Computed properties for agent limits
const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const planLimits = computed(() => subscriptionStorage.getPlanLimits())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())
const currentAgentCount = computed(() => agents.value.length)

// Check if agent creation is locked due to limits
const isAgentCreationLocked = computed(() => {
    // Only apply locking if enterprise module exists
    if (!hasEnterpriseModule) {
        return false
    }
    
    if (!currentSubscription.value || !isSubscriptionActive.value) {
        return true
    }
    
    const maxAgents = planLimits.value.maxAgents
    if (maxAgents === null) {
        return false // Unlimited agents
    }
    
    return currentAgentCount.value >= maxAgents
})

// Modal functions
const closeUpgradeModal = () => {
    showUpgradeModal.value = false
}

const handleUpgrade = () => {
    window.location.href = '/settings/subscription'
}

const refreshAgents = async () => {
    agents.value = agentStorage.getAgents()
    await loadWidgetsForAgents()
}

const loadWidgetsForAgents = async () => {
    try {
        const widgets = await widgetService.getWidgets()
        
        // Initialize loading states
        agents.value.forEach(agent => {
            widgetLoadingMap.value[agent.id] = false
            const widget = widgets.find((w: Widget) => w.agent_id === agent.id)
            widgetMap.value[agent.id] = widget || null
        })
    } catch (error) {
        console.error('Failed to load widgets:', error)
    }
}

const getWidgetUrl = () => {
    return import.meta.env.VITE_WIDGET_URL
}

const copyWidgetCode = async (agent: Agent) => {
    const widget = widgetMap.value[agent.id]
    if (!widget) {
        // Create widget if it doesn't exist
        try {
            widgetLoadingMap.value[agent.id] = true
            const newWidget = await widgetService.createWidget({
                name: `${agent.name} Widget`,
                agent_id: agent.id
            })
            widgetMap.value[agent.id] = newWidget
            await copyWidgetCodeToClipboard(newWidget, agent.require_token_auth)
        } catch (error) {
            console.error('Failed to create widget:', error)
            toast.error('Failed to create widget')
        } finally {
            widgetLoadingMap.value[agent.id] = false
        }
    } else {
        await copyWidgetCodeToClipboard(widget, agent.require_token_auth)
    }
}

const copyWidgetCodeToClipboard = async (widget: Widget, requireTokenAuth?: boolean) => {
    const widgetUrl = getWidgetUrl()
    
    let code: string
    
    if (requireTokenAuth) {
        // Token-based authentication code (for secure portal integrations)
        code = `<!-- Get token from your backend: POST /api/v1/generate-token with API key -->
<!-- Security Note: Widget ID and token are cryptographically bound in the JWT. -->
    <script>
    (function() {
    fetch('/api/chattermate')
        .then(r => r.json())
        .then(d => {
        let token, widget_id;
        
        if (d.data && d.data.token && d.data.widget_id) {
            // Direct path from Wappler response
            token = d.data.token;
            widget_id = d.data.widget_id;
        } else if (d.token && d.token.data && d.token.data.data) {
            token = d.token.data.data.token;
            widget_id = d.token.data.data.widget_id;
        } else if (d.token && d.widget_id) {
            // Flat path
            token = d.token;
            widget_id = d.widget_id;
        }
        if (!token || !widget_id) {
            throw new Error('Failed to extract token or widget_id from response');
        }
        window.chattermateId = widget_id;

        localStorage.setItem('ctid', token);
        
        // Load the chattermate.min.js script
        const script = document.createElement('script');
        script.src = '${widgetUrl}/webclient/chattermate.min.js';
        script.onload = () => {
            console.log('[ChatterMate] chattermate.min.js loaded and executed successfully');
        };
        script.onerror = (err) => {
            console.error('[ChatterMate] Failed to load chattermate.min.js:', err);
        };
        document.head.appendChild(script);
        })
        .catch(e => {
        console.error('[ChatterMate] Initialization failed:', e);
        });
    })();
    <\/script>`
    } else {
        code = `<script>window.chattermateId='${widget.id}';<\/script><script src="${widgetUrl}/webclient/chattermate.min.js"><\/script>`
    }
    
    try {
        await navigator.clipboard.writeText(code)
        toast.success('Widget code copied to clipboard!', {
            duration: 3000
        })
    } catch (error) {
        console.error('Failed to copy widget code:', error)
        toast.error('Failed to copy widget code')
    }
}

const openWidgetHelp = () => {
    window.open('https://docs.chattermate.chat/features/widget', '_blank')
}

onMounted(async () => {
    await refreshAgents()
})

const handleAgentClose = async () => {
    await refreshAgents()
    selectedAgent.value = null
}

const handleCreateAgent = () => {
    if (isAgentCreationLocked.value) {
        // Only show upgrade modal if enterprise module exists
        if (hasEnterpriseModule) {
            showUpgradeModal.value = true
            return
        }
    }
    showCreateModal.value = true
}

const handleAgentCreated = async (agent: Agent) => {
    await refreshAgents()
    showCreateModal.value = false
    selectedAgent.value = agent
    
    // Set URL parameter for workflow-enabled agents
    if (agent.use_workflow) {
        const url = new URL(window.location.href)
        url.searchParams.set('tab', 'general') // We're still using 'general' as the tab name for workflow
        window.history.replaceState({}, '', url.toString())
    }
}

const handleAgentClick = (agent: Agent) => {
    selectedAgent.value = agent
    
    // Set URL parameter for workflow-enabled agents
    if (agent.use_workflow) {
        const url = new URL(window.location.href)
        url.searchParams.set('tab', 'general') // We're still using 'general' as the tab name for workflow
        window.history.replaceState({}, '', url.toString())
    }
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

// Handle fullscreen toggle from agent detail
const handleFullscreenToggle = (isFullscreen: boolean) => {
    emit('toggle-fullscreen', isFullscreen)
}
</script>

<template>
    <div class="agent-list">
        <div v-if="!selectedAgent">
            <div class="list-header">
                <div class="header-content">
                    <h3>Agent Management</h3>
                    <p class="list-description">Manage and test your AI assistants. Configure settings, update
                        instructions,
                        and control knowledge bases for each agent.</p>
                </div>
                <button 
                    class="create-agent-button" 
                    :class="{ 'locked': isAgentCreationLocked }"
                    :disabled="isAgentCreationLocked"
                    @click="handleCreateAgent"
                    :title="isAgentCreationLocked ? `Agent limit reached (${currentAgentCount}/${planLimits.maxAgents}). Upgrade your plan to create more agents.` : 'Create a new agent'"
                >
                    <span class="button-icon">+</span>
                    Create Agent
                    <font-awesome-icon v-if="hasEnterpriseModule && isAgentCreationLocked" icon="fa-solid fa-lock" class="lock-icon" />
                </button>
            </div>
            <div class="agents-grid">
                <div 
                    v-for="agent in agents" 
                    :key="agent.id" 
                    class="agent-card" 
                    :class="{ 'workflow-agent': agent.use_workflow }"
                    @click="handleAgentClick(agent)"
                >
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
                        <div v-if="agent.use_workflow" class="agent-workflow-badge">
                            <span class="workflow-icon">🔀</span>
                            <span>Workflow Enabled</span>
                        </div>
                        
                        <!-- Widget Copy Section -->
                        <div class="agent-widget-section" @click.stop>
                            <div class="widget-actions">
                                <button 
                                    class="copy-widget-btn"
                                    :class="{ 'loading': widgetLoadingMap[agent.id] }"
                                    :disabled="widgetLoadingMap[agent.id]"
                                    @click="copyWidgetCode(agent)"
                                    title="Copy widget embed code"
                                >
                                    <div v-if="widgetLoadingMap[agent.id]" class="loading-spinner"></div>
                                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span class="copy-text">
                                        {{ widgetMap[agent.id] ? 'Copy Widget' : 'Create & Copy Widget' }}
                                    </span>
                                </button>
                                <button 
                                    class="help-btn"
                                    @click="openWidgetHelp"
                                    title="View widget integration guide"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <AgentDetail v-else-if="selectedAgent" :agent="selectedAgent" @close="handleAgentClose" @toggle-fullscreen="handleFullscreenToggle" />
        
        <CreateAgentModal 
            v-if="showCreateModal" 
            @close="showCreateModal = false"
            @created="handleAgentCreated"
        />

        <!-- Agent Limit Upgrade Modal (only shown when enterprise module exists) -->
        <div v-if="hasEnterpriseModule && showUpgradeModal" class="upgrade-modal-overlay" @click="closeUpgradeModal">
            <div class="upgrade-modal" @click.stop>
                <div class="upgrade-modal-header">
                    <h3>Agent Limit Reached</h3>
                    <button class="close-button" @click="closeUpgradeModal">×</button>
                </div>
                <div class="upgrade-modal-content">
                    <p class="upgrade-description">
                        You've reached your plan's agent limit ({{ currentAgentCount }}/{{ planLimits.maxAgents }}). 
                        Upgrade your plan to create more agents and unlock additional features.
                    </p>
                    <div class="upgrade-features">
                        <div class="feature-item">
                            <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
                            <span>More agents for your team</span>
                        </div>
                        <div class="feature-item">
                            <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
                            <span>Advanced workflow features</span>
                        </div>
                        <div class="feature-item">
                            <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
                            <span>Enhanced knowledge management</span>
                        </div>
                        <div class="feature-item">
                            <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
                            <span>Priority support</span>
                        </div>
                    </div>
                </div>
                <div class="upgrade-modal-footer">
                    <button class="upgrade-button primary" @click="handleUpgrade">
                        Upgrade Plan
                    </button>
                    <button class="upgrade-button secondary" @click="closeUpgradeModal">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.agent-list {
    padding: var(--space-lg);
    max-width: 1200px;
    margin: 0 auto;
}

/* Define RGB values for primary color (f34611 = 243, 70, 17) */
:deep(:root) {
    --primary-color-rgb: 243, 70, 17;
}

.list-header {
    margin-bottom: var(--space-xl);
    background: linear-gradient(to right, var(--primary-soft), var(--background-soft));
    padding: var(--space-xl);
    border-radius: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-content {
    flex: 1;
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

.create-agent-button {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.create-agent-button:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.button-icon {
    font-size: 1.25rem;
    font-weight: 700;
}

.create-agent-button.locked {
    background: var(--background-mute);
    color: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.7;
}

.create-agent-button.locked:hover {
    background: var(--background-mute);
    transform: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.lock-icon {
    font-size: 12px;
    margin-left: var(--space-xs);
    color: var(--warning-color);
}

.agents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg);
}

.agent-card {
    background: linear-gradient(135deg, var(--background-base) 0%, rgba(255, 255, 255, 0.95) 100%);
    padding: var(--space-xl);
    border-radius: 20px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    gap: var(--space-lg);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
}

.workflow-agent {
    border-color: var(--primary-color);
    background: linear-gradient(to bottom right, var(--background-base), var(--primary-soft));
}

.agent-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
}

.agent-avatar {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(135deg, var(--background-soft), rgba(255, 255, 255, 0.9));
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 3px solid rgba(255, 255, 255, 0.8);
    position: relative;
}

.agent-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.agent-avatar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
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
    font-size: 1.3rem;
    margin: 0;
    color: var(--text-color);
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--text-color), var(--text-secondary));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
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
    background: rgba(255, 255, 255, 0.7);
    border-radius: var(--radius-full);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--error-color);
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
    position: relative;
}

.status-indicator.online {
    background: var(--success-color);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
    animation: pulse-online 2s infinite;
}

@keyframes pulse-online {
    0%, 100% { 
        box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
    }
    50% { 
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.4);
    }
}

.status-text {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
}

.agent-workflow-badge {
    margin-top: var(--space-sm);
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--primary-soft);
    color: var(--primary-color);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 500;
}

.workflow-icon {
    font-size: 0.875rem;
}

.workflow-indicator {
    position: absolute;
    right: var(--space-md);
    bottom: var(--space-md);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s ease;
}

.edit-workflow-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary-color);
}

.edit-workflow-icon {
    font-size: 1.25rem;
    color: var(--primary-color);
}

.agent-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    border-color: var(--primary-color);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
}

.workflow-agent:hover {
    box-shadow: 0 12px 20px -5px rgba(var(--primary-color-rgb), 0.25);
}

.agent-card:hover .agent-avatar img {
    transform: scale(1.08);
}

.agent-card:hover .agent-avatar::before {
    opacity: 1;
}

.workflow-agent:hover .workflow-indicator {
    opacity: 1;
    transform: translateX(0);
}

/* Widget Copy Section Styles */
.agent-widget-section {
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    position: relative;
}



.widget-actions {
    display: flex;
    gap: var(--space-xs);
    align-items: stretch;
}

.copy-widget-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: 10px 14px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex: 1;
    min-height: 36px;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.help-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.copy-widget-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-soft), rgba(243, 70, 17, 0.1));
    color: var(--primary-color);
    border-color: rgba(243, 70, 17, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(243, 70, 17, 0.15);
}

.help-btn:hover {
    background: linear-gradient(135deg, var(--primary-soft), rgba(243, 70, 17, 0.1));
    color: var(--primary-color);
    border-color: rgba(243, 70, 17, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(243, 70, 17, 0.15);
}

.copy-widget-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.copy-widget-btn.loading {
    pointer-events: none;
}

.copy-widget-btn svg {
    flex-shrink: 0;
}

.copy-text {
    white-space: nowrap;
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: spin 1s linear infinite;
}



@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 15+ inch laptops and desktops */
@media (max-width: 1600px) {
    .agents-grid {
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: var(--space-lg);
    }
}

/* 14-15 inch laptops */
@media (max-width: 1440px) {
    .agents-grid {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: var(--space-md);
    }
    
    .agent-card {
        padding: var(--space-lg);
    }
    
    .list-header {
        padding: var(--space-lg);
    }
}

/* 13 inch laptops - optimized breakpoint */
@media (max-width: 1366px) {
    .agent-list {
        padding: var(--space-md);
        max-width: 1200px;
    }
    
    .agents-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-md);
    }
    
    .agent-card {
        padding: var(--space-md);
    }
    
    .list-header {
        padding: var(--space-md) var(--space-lg);
        margin-bottom: var(--space-lg);
    }
    
    .list-header h3 {
        font-size: 1.8rem;
    }
    
    .list-description {
        font-size: 1rem;
        max-width: 600px;
    }
    
    .agent-avatar {
        width: 70px;
        height: 70px;
    }
    
    .copy-widget-btn {
        font-size: 0.85rem;
        padding: 8px 12px;
    }
    
    .widget-actions {
        gap: 8px;
    }
}

/* Small laptop screens (13 inch and smaller - backup breakpoint) */
@media (max-width: 1280px) {
    .agent-list {
        padding: var(--space-md);
    }
    
    .agents-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--space-md);
    }
    
    .list-header {
        padding: var(--space-md) var(--space-lg);
        flex-direction: column;
        gap: var(--space-md);
        align-items: flex-start;
    }
    
    .list-header h3 {
        font-size: 1.75rem;
    }
    
    .list-description {
        font-size: 1rem;
    }
}

/* Tablet screens */
@media (max-width: 1024px) {
    .agents-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    
    .agent-card {
        flex-direction: column;
        text-align: center;
        gap: var(--space-md);
    }
    
    .agent-left {
        flex-direction: row;
        justify-content: center;
        gap: var(--space-md);
    }
    
    .agent-info {
        align-items: center;
    }
    
    .agent-description {
        text-align: center;
    }
    
    .widget-actions {
        justify-content: center;
    }
}

/* Mobile screens */
@media (max-width: 768px) {
    .agent-list {
        padding: var(--space-sm);
    }

    .list-header {
        padding: var(--space-md);
        border-radius: 20px;
    }

    .list-header h3 {
        font-size: 1.5rem;
    }
    
    .list-description {
        font-size: 0.9rem;
    }

    .agents-grid {
        grid-template-columns: 1fr;
        gap: var(--space-sm);
    }
    
    .agent-card {
        padding: var(--space-sm);
        border-radius: 16px;
    }
    
    .agent-avatar {
        width: 60px;
        height: 60px;
    }
    
    .copy-widget-btn {
        font-size: 0.75rem;
        padding: 6px 10px;
    }
    
    .help-btn {
        width: 28px;
        height: 28px;
        padding: 6px;
    }
    
    .help-btn svg,
    .copy-widget-btn svg {
        width: 12px;
        height: 12px;
    }
}

/* Upgrade Modal Styles */
.upgrade-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.upgrade-modal {
    background: var(--background-soft);
    border-radius: var(--radius-lg);
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.upgrade-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-color);
}

.upgrade-modal-header h3 {
    margin: 0;
    color: var(--text-color);
    font-size: 1.25rem;
    font-weight: 600;
}

.close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
}

.close-button:hover {
    background: var(--background-mute);
    color: var(--text-color);
}

.upgrade-modal-content {
    padding: var(--space-lg);
}

.upgrade-description {
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: var(--space-lg);
}

.upgrade-features {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.feature-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.feature-icon {
    color: var(--success-color);
    font-size: 0.875rem;
}

.upgrade-modal-footer {
    display: flex;
    gap: var(--space-sm);
    padding: var(--space-lg);
    border-top: 1px solid var(--border-color);
}

.upgrade-button {
    flex: 1;
    padding: var(--space-md);
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.upgrade-button.primary {
    background: var(--primary-color);
    color: white;
}

.upgrade-button.primary:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
}

.upgrade-button.secondary {
    background: var(--background-mute);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.upgrade-button.secondary:hover {
    background: var(--background-soft);
}
</style>