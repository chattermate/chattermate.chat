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
const searchQuery = ref('')

const emit = defineEmits<{
    (e: 'toggle-fullscreen', isFullscreen: boolean): void
}>()

const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const planLimits = computed(() => subscriptionStorage.getPlanLimits())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())
const currentAgentCount = computed(() => agents.value.length)

const onlineCount = computed(() => agents.value.filter(a => a.is_active).length)

const filteredAgents = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return agents.value
    return agents.value.filter(a =>
        (a.display_name || a.name).toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q)
    )
})

const isAgentCreationLocked = computed(() => {
    if (!hasEnterpriseModule) return false
    if (!currentSubscription.value || !isSubscriptionActive.value) return true
    const maxAgents = planLimits.value.maxAgents
    if (maxAgents === null) return false
    return currentAgentCount.value >= maxAgents
})

const closeUpgradeModal = () => { showUpgradeModal.value = false }
const handleUpgrade = () => { window.location.href = '/settings/subscription' }

const refreshAgents = async () => {
    agents.value = agentStorage.getAgents()
    await loadWidgetsForAgents()
}

const loadWidgetsForAgents = async () => {
    try {
        const widgets = await widgetService.getWidgets()
        agents.value.forEach(agent => {
            widgetLoadingMap.value[agent.id] = false
            const widget = widgets.find((w: Widget) => w.agent_id === agent.id)
            widgetMap.value[agent.id] = widget || null
        })
    } catch (error) {
        console.error('Failed to load widgets:', error)
    }
}

const getWidgetUrl = () => import.meta.env.VITE_WIDGET_URL

const copyWidgetCode = async (agent: Agent) => {
    const widget = widgetMap.value[agent.id]
    if (!widget) {
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
        code = `<!-- Get token from your backend: POST /api/v1/generate-token with API key -->
<!-- Security Note: Widget ID and token are cryptographically bound in the JWT. -->
    <script>
    (function() {
    fetch('/api/chattermate')
        .then(r => r.json())
        .then(d => {
        let token, widget_id;
        if (d.data && d.data.token && d.data.widget_id) {
            token = d.data.token;
            widget_id = d.data.widget_id;
        } else if (d.token && d.token.data && d.token.data.data) {
            token = d.token.data.data.token;
            widget_id = d.token.data.data.widget_id;
        } else if (d.token && d.widget_id) {
            token = d.token;
            widget_id = d.widget_id;
        }
        if (!token || !widget_id) throw new Error('Failed to extract token or widget_id');
        window.chattermateId = widget_id;
        localStorage.setItem('ctid', token);
        const script = document.createElement('script');
        script.src = '${widgetUrl}/webclient/chattermate.min.js';
        document.head.appendChild(script);
        })
        .catch(e => console.error('[ChatterMate] Initialization failed:', e));
    })();
    <\/script>`
    } else {
        code = `<script>window.chattermateId='${widget.id}';<\/script><script src="${widgetUrl}/webclient/chattermate.min.js"><\/script>`
    }
    try {
        await navigator.clipboard.writeText(code)
        toast.success('Widget code copied to clipboard!', { duration: 3000 })
    } catch (error) {
        console.error('Failed to copy widget code:', error)
        toast.error('Failed to copy widget code')
    }
}

const openWidgetHelp = () => window.open('https://docs.chattermate.chat/features/widget', '_blank')

onMounted(async () => { await refreshAgents() })

const handleAgentClose = async () => {
    await refreshAgents()
    selectedAgent.value = null
}

const handleCreateAgent = () => {
    if (isAgentCreationLocked.value) {
        if (hasEnterpriseModule) { showUpgradeModal.value = true; return }
    }
    showCreateModal.value = true
}

const handleAgentCreated = async (agent: Agent) => {
    await refreshAgents()
    showCreateModal.value = false
    selectedAgent.value = agent
    if (agent.use_workflow) {
        const url = new URL(window.location.href)
        url.searchParams.set('tab', 'general')
        window.history.replaceState({}, '', url.toString())
    }
}

const handleAgentClick = (agent: Agent) => {
    selectedAgent.value = agent
    if (agent.use_workflow) {
        const url = new URL(window.location.href)
        url.searchParams.set('tab', 'general')
        window.history.replaceState({}, '', url.toString())
    }
}

const getAgentPhotoUrl = (agent: Agent) => {
    if (!agent.customization?.photo_url) return getAvatarUrl(agent.agent_type.toLowerCase())
    if (agent.customization.photo_url.includes('amazonaws.com')) return agent.customization.photo_url
    return import.meta.env.VITE_API_URL + agent.customization.photo_url
}

const handleFullscreenToggle = (isFullscreen: boolean) => {
    emit('toggle-fullscreen', isFullscreen)
}

// Colorful gradient orb per agent (matches design aesthetic)
const ORB_PALETTES = [
    { stops: 'var(--c-purple), var(--c-teal), var(--accent-ink)', glow: 'rgba(157,140,255,0.45)' },
    { stops: 'var(--c-coral), var(--c-purple), var(--c-teal)', glow: 'rgba(255,138,115,0.4)' },
    { stops: 'var(--c-teal), var(--accent-ink), var(--c-purple)', glow: 'rgba(95,227,214,0.4)' },
    { stops: 'var(--accent-ink), var(--c-teal), var(--c-coral)', glow: 'rgba(201,242,78,0.35)' },
    { stops: 'var(--c-purple), var(--c-coral), var(--c-teal)', glow: 'rgba(157,140,255,0.4)' },
]

const getOrbStyle = (agent: Agent): Record<string, string> => {
    if (agent.customization?.photo_url) return {}
    const idx = agent.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % ORB_PALETTES.length
    const p = ORB_PALETTES[idx]
    return {
        background: `
            radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22) 0%, transparent 42%),
            radial-gradient(circle at 68% 72%, rgba(0,0,0,0.25) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 50%, ${p.stops})
        `.trim(),
        boxShadow: `0 4px 28px ${p.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
        borderRadius: '50%',
    }
}
</script>

<template>
    <div class="agent-list">
        <div v-if="!selectedAgent">
            <!-- Search + Create header -->
            <div class="list-header">
                <div class="search-wrap">
                    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search agents..."
                        class="search-input"
                    />
                </div>
                <button
                    class="create-agent-button"
                    :class="{ 'locked': isAgentCreationLocked }"
                    :disabled="isAgentCreationLocked"
                    @click="handleCreateAgent"
                    :title="isAgentCreationLocked ? `Agent limit reached (${currentAgentCount}/${planLimits.maxAgents}).` : 'Create a new agent'"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Create Agent
                    <font-awesome-icon v-if="hasEnterpriseModule && isAgentCreationLocked" icon="fa-solid fa-lock" class="lock-icon" />
                </button>
            </div>

            <!-- KPI Strip -->
            <div class="kpi-strip">
                <div class="kpi-card">
                    <div class="kpi-label">ACTIVE AGENTS</div>
                    <div class="kpi-value">{{ agents.length }}</div>
                    <div class="kpi-sub kpi-lime">{{ onlineCount }} online</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">CONVERSATIONS · 30D</div>
                    <div class="kpi-value">—</div>
                    <div class="kpi-sub kpi-lime">▲ analytics coming soon</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">RESOLUTION RATE</div>
                    <div class="kpi-value">—</div>
                    <div class="kpi-sub kpi-teal">self-served by AI</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">HUMAN HANDOFFS</div>
                    <div class="kpi-value">—</div>
                    <div class="kpi-sub kpi-coral">conversations</div>
                </div>
            </div>

            <!-- Agent Grid -->
            <div v-if="filteredAgents.length > 0" class="agents-grid">
                <div
                    v-for="agent in filteredAgents"
                    :key="agent.id"
                    class="agent-card"
                    :class="{ 'workflow-agent': agent.use_workflow }"
                >
                    <!-- Card top: orb + name/slug + menu -->
                    <div class="card-top">
                        <div class="agent-orb" :style="getOrbStyle(agent)">
                            <img
                                v-if="agent.customization?.photo_url"
                                :src="getAgentPhotoUrl(agent)"
                                :alt="agent.name"
                            />
                        </div>
                        <div class="agent-meta">
                            <h4 class="agent-display-name">{{ agent.display_name || agent.name }}</h4>
                            <span class="agent-slug">{{ agent.name }}</span>
                        </div>
                        <button class="card-menu-btn" @click.stop title="More options">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Status + integration badges -->
                    <div class="badges-row">
                        <span class="badge-status" :class="{ online: agent.is_active }">
                            <span class="status-dot"></span>
                            {{ agent.is_active ? 'Online' : 'Offline' }}
                        </span>
                        <span class="badge-integration">Web</span>
                        <span v-if="agent.use_workflow" class="badge-workflow">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
                            Workflow
                        </span>
                    </div>

                    <!-- Description -->
                    <p class="agent-description">{{ agent.description || 'No description provided.' }}</p>

                    <!-- Stats -->
                    <div class="stats-divider"></div>
                    <div class="stats-row">
                        <div class="stat-item">
                            <span class="stat-value">—</span>
                            <span class="stat-label">CHATS</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">—</span>
                            <span class="stat-label">RESOLVED</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{{ agent.knowledge?.length ?? 0 }}</span>
                            <span class="stat-label">SOURCES</span>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="card-actions" @click.stop>
                        <button class="btn-configure" @click="handleAgentClick(agent)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                            </svg>
                            Configure
                        </button>
                        <button
                            class="btn-copy-widget"
                            :class="{ loading: widgetLoadingMap[agent.id] }"
                            :disabled="widgetLoadingMap[agent.id]"
                            @click="copyWidgetCode(agent)"
                            title="Copy widget embed code"
                        >
                            <div v-if="widgetLoadingMap[agent.id]" class="loading-spinner"></div>
                            <template v-else>Copy widget</template>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Empty search result -->
            <div v-else-if="searchQuery && agents.length > 0" class="empty-search">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>No agents match "<strong>{{ searchQuery }}</strong>"</p>
            </div>

            <!-- Empty state: no agents at all -->
            <div v-else-if="agents.length === 0" class="empty-state">
                <div class="empty-orb"></div>
                <h3>No agents yet</h3>
                <p>Create your first AI agent to start handling conversations automatically.</p>
                <button class="create-agent-button" @click="handleCreateAgent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    Create Agent
                </button>
            </div>
        </div>

        <AgentDetail
            v-else-if="selectedAgent"
            :agent="selectedAgent"
            @close="handleAgentClose"
            @toggle-fullscreen="handleFullscreenToggle"
        />

        <CreateAgentModal
            v-if="showCreateModal"
            @close="showCreateModal = false"
            @created="handleAgentCreated"
        />

        <!-- Agent Limit Upgrade Modal -->
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
                    <button class="upgrade-button primary" @click="handleUpgrade">Upgrade Plan</button>
                    <button class="upgrade-button secondary" @click="closeUpgradeModal">Maybe Later</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ─── Container ─────────────────────────────────────────────────── */
.agent-list {
    padding: var(--space-lg);
    max-width: 1280px;
    margin: 0 auto;
}

/* ─── Header: search + create ───────────────────────────────────── */
.list-header {
    display: flex;
    gap: var(--space-md);
    align-items: center;
    margin-bottom: var(--space-xl);
}

.search-wrap {
    flex: 1;
    position: relative;
    max-width: 360px;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--faint);
    pointer-events: none;
    flex-shrink: 0;
}

.search-input {
    width: 100%;
    padding: 11px 14px 11px 40px;
    background: var(--surface);
    border: 1px solid var(--o10);
    border-radius: 12px;
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--text);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    box-sizing: border-box;
}

.search-input::placeholder { color: var(--faint); }

.search-input:focus {
    outline: none;
    border-color: var(--accent-ink);
    box-shadow: var(--ring-focus);
}

.create-agent-button {
    background: var(--accent-ink);
    color: var(--on-accent);
    border: none;
    border-radius: 12px;
    padding: 11px 22px;
    font-family: var(--font-sans);
    font-weight: 700;
    font-size: var(--text-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: opacity var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
    flex-shrink: 0;
    letter-spacing: -0.01em;
}

.create-agent-button:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(201,242,78,.25);
}

.create-agent-button.locked {
    background: var(--o08);
    color: var(--muted);
    cursor: not-allowed;
}

.create-agent-button.locked:hover { opacity: 1; transform: none; box-shadow: none; }
.lock-icon { font-size: 11px; color: var(--warning-color); }

/* ─── KPI Strip ─────────────────────────────────────────────────── */
.kpi-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
}

.kpi-card {
    background: var(--surface);
    border: 1px solid var(--o08);
    border-radius: 18px;
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: border-color var(--transition-fast);
}

.kpi-card:hover { border-color: var(--o14); }

.kpi-label {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--faint);
    text-transform: uppercase;
}

.kpi-value {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    line-height: 1;
}

.kpi-sub {
    font-size: var(--text-sm);
    font-weight: 500;
}

.kpi-lime { color: var(--accent-ink); }
.kpi-teal { color: var(--c-teal); }
.kpi-coral { color: var(--c-coral); }

/* ─── Agent Grid ─────────────────────────────────────────────────── */
.agents-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
}

.agent-card {
    background: var(--surface);
    border: 1px solid var(--o08);
    border-radius: 22px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color var(--transition-normal), box-shadow var(--transition-normal), transform var(--transition-normal);
    position: relative;
}

.agent-card:hover {
    border-color: var(--o16);
    box-shadow: 0 8px 32px rgba(0,0,0,.35);
    transform: translateY(-2px);
}

.workflow-agent { border-color: rgba(201,242,78,.2); }
.workflow-agent:hover { border-color: rgba(201,242,78,.4); box-shadow: 0 8px 32px rgba(201,242,78,.08); }

/* Card top row */
.card-top {
    display: flex;
    align-items: flex-start;
    gap: 14px;
}

.agent-orb {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--o06);
    position: relative;
}

.agent-orb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 50%;
}

.agent-meta {
    flex: 1;
    min-width: 0;
    padding-top: 2px;
}

.agent-display-name {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.agent-slug {
    display: block;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-menu-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--o05);
    border: 1px solid var(--o10);
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all var(--transition-fast);
}

.card-menu-btn:hover { background: var(--o10); color: var(--text); border-color: var(--o16); }

/* Badges row */
.badges-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.badge-status,
.badge-integration,
.badge-workflow {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.badge-status {
    background: var(--o07);
    border: 1px solid var(--o12);
    color: var(--muted);
}

.badge-status.online {
    background: rgba(95,227,214,.1);
    border-color: rgba(95,227,214,.25);
    color: var(--c-teal);
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
}

.badge-status.online .status-dot {
    box-shadow: 0 0 6px rgba(95,227,214,.6);
    animation: pulse-online 2.5s infinite;
}

@keyframes pulse-online {
    0%, 100% { box-shadow: 0 0 5px rgba(95,227,214,.5); }
    50% { box-shadow: 0 0 10px rgba(95,227,214,.8); }
}

.badge-integration {
    background: var(--o07);
    border: 1px solid var(--o12);
    color: var(--muted);
}

.badge-workflow {
    background: rgba(201,242,78,.08);
    border: 1px solid rgba(201,242,78,.2);
    color: var(--accent-ink);
}

/* Description */
.agent-description {
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.55;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Stats */
.stats-divider {
    height: 1px;
    background: var(--o07);
    flex-shrink: 0;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
}

.stat-value {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
    line-height: 1;
}

.stat-label {
    font-family: var(--font-mono);
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--faint);
    text-transform: uppercase;
}

/* Action buttons */
.card-actions {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    margin-top: 2px;
}

.btn-configure {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 11px 16px;
    background: var(--accent-ink);
    color: var(--on-accent);
    border: none;
    border-radius: 12px;
    font-family: var(--font-sans);
    font-weight: 700;
    font-size: var(--text-sm);
    cursor: pointer;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
    white-space: nowrap;
}

.btn-configure:hover {
    opacity: 0.88;
    transform: translateY(-1px);
}

.btn-copy-widget {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 11px 16px;
    background: var(--o07);
    border: 1px solid var(--o12);
    border-radius: 12px;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: var(--text-sm);
    color: var(--text3);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.btn-copy-widget:hover:not(:disabled) {
    background: var(--o12);
    border-color: var(--o20);
    color: var(--text);
}

.btn-copy-widget:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-copy-widget.loading { pointer-events: none; }

.loading-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--o12);
    border-radius: 50%;
    border-top-color: var(--accent-ink);
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Empty states ───────────────────────────────────────────────── */
.empty-search {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-3xl);
    color: var(--muted);
    text-align: center;
}

.empty-search svg { color: var(--faint); }
.empty-search p { margin: 0; font-size: var(--text-sm); }
.empty-search strong { color: var(--text3); }

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-3xl);
    text-align: center;
}

.empty-orb {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 40%, var(--c-purple), var(--c-teal), var(--accent-ink));
    opacity: 0.4;
    filter: blur(8px);
    margin-bottom: var(--space-sm);
}

.empty-state h3 {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--text);
    margin: 0;
}

.empty-state p {
    color: var(--muted);
    font-size: var(--text-sm);
    margin: 0 0 var(--space-md);
    max-width: 340px;
}

/* ─── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 1200px) {
    .kpi-strip { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 1024px) {
    .agents-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .agent-list { padding: var(--space-md); }
    .list-header { flex-wrap: wrap; }
    .search-wrap { max-width: 100%; flex: 1 1 100%; order: 2; }
    .create-agent-button { order: 1; }
    .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
    .agents-grid { gap: var(--space-md); }
    .agent-card { padding: var(--space-lg); border-radius: 18px; }
}

@media (max-width: 480px) {
    .kpi-strip { grid-template-columns: 1fr; }
    .kpi-value { font-size: 28px; }
}

/* ─── Upgrade Modal ──────────────────────────────────────────────── */
.upgrade-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5,6,9,.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.upgrade-modal {
    background: var(--surface);
    border: 1px solid var(--o10);
    border-radius: 20px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
}

.upgrade-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--o08);
}

.upgrade-modal-header h3 {
    margin: 0;
    color: var(--text);
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 700;
}

.close-button {
    background: var(--o05);
    border: 1px solid var(--o10);
    font-size: 1.25rem;
    color: var(--muted);
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all var(--transition-fast);
    line-height: 1;
}

.close-button:hover { background: var(--o10); color: var(--text); }

.upgrade-modal-content { padding: var(--space-lg); }

.upgrade-description {
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: var(--space-lg);
    font-size: var(--text-sm);
}

.upgrade-features { display: flex; flex-direction: column; gap: var(--space-sm); }

.feature-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-sm);
    color: var(--text3);
}

.feature-icon { color: var(--accent-ink); font-size: 12px; }

.upgrade-modal-footer {
    display: flex;
    gap: var(--space-sm);
    padding: var(--space-lg);
    border-top: 1px solid var(--o08);
}

.upgrade-button {
    flex: 1;
    padding: 11px var(--space-md);
    border-radius: 10px;
    font-weight: 600;
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    border: none;
}

.upgrade-button.primary { background: var(--accent-ink); color: var(--on-accent); }
.upgrade-button.primary:hover { opacity: 0.88; transform: translateY(-1px); }
.upgrade-button.secondary { background: var(--o06); color: var(--text3); border: 1px solid var(--o10); }
.upgrade-button.secondary:hover { background: var(--o10); color: var(--text); }
</style>
