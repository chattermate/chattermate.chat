<!--
ChatterMate - Agent Detail
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
import { ref, defineEmits, computed, onMounted, nextTick } from 'vue'
import type { AgentWithCustomization, AgentCustomization } from '@/types/agent'
import { getAvatarUrl } from '@/utils/avatars'

import KnowledgeGrid from './KnowledgeGrid.vue'
import AgentCustomizationView from './AgentCustomizationView.vue'
import AgentChatPreviewPanel from './AgentChatPreviewPanel.vue'
import AgentIntegrationsTab from './AgentIntegrationsTab.vue'
import AgentWidgetTab from './AgentWidgetTab.vue'

import AgentAdvancedTab from './AgentAdvancedTab.vue'
import AgentInstructionsTab from './AgentInstructionsTab.vue'
import AgentWorkflowTab from './AgentWorkflowTab.vue'
import AgentMCPToolsTab from './AgentMCPToolsTab.vue'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useAgentChat } from '@/composables/useAgentChat'
import { useAgentDetail } from '@/composables/useAgentDetail'
import { agentService } from '@/services/agent'
import { toast } from 'vue-sonner'
import { agentStorage, subscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

const props = defineProps<{
    agent: AgentWithCustomization
}>()

const { hasEnterpriseModule } = useEnterpriseFeatures()
const agentData = ref({ ...props.agent })
const activeTab = ref(props.agent.use_workflow ? 'workflow-builder' : 'agent') // Track the active tab: 'agent', 'integrations', etc.
const isEditingHeader = ref(false)
const editDisplayName = ref(agentData.value.display_name || agentData.value.name)
const editIsActive = ref(agentData.value.is_active)
const previewCustomization = ref<AgentCustomization>({
    id: agentData.value.customization?.id ?? 0,
    agent_id: agentData.value.id,
    chat_background_color: agentData.value.customization?.chat_background_color ?? '#F8F9FA',
    chat_bubble_color: agentData.value.customization?.chat_bubble_color ?? '#E9ECEF',
    accent_color: agentData.value.customization?.accent_color ?? '#f34611',
    font_family: agentData.value.customization?.font_family ?? 'Inter, system-ui, sans-serif',
    photo_url: agentData.value.customization?.photo_url,
    icon_color: agentData.value.customization?.icon_color ?? '#6C757D',
    custom_css: agentData.value.customization?.custom_css,
    customization_metadata: agentData.value.customization?.customization_metadata ?? {},
    chat_style: agentData.value.customization?.chat_style ?? 'CHATBOT',
    widget_position: agentData.value.customization?.widget_position
})



const baseUrl = computed(() => {
    return import.meta.env.VITE_API_URL
})

const widgetUrl = computed(() => {
    return import.meta.env.VITE_WIDGET_URL
})

// Computed property to handle instructions as text
const instructionsText = computed({
    get: () => agentData.value.instructions?.join('\n') || '',
    set: (value) => {
        agentData.value.instructions = value.split('\n').filter(line => line.trim())
    }
})

const iframeUrl = computed(() => {
    if (!widget.value?.id) return ''
    return `${baseUrl.value}/widgets/${widget.value.id}/data?widget_id=${widget.value.id}`
})

// Computed property to check if chat style is ASK_ANYTHING for preview adjustments
const isAskAnythingStyle = computed(() => {
    return previewCustomization.value.chat_style === 'ASK_ANYTHING'
})

// Computed property for preview wrapper styles
const previewWrapperStyles = computed(() => {
    const baseStyles = {
        background: 'transparent',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        height: '600px',
        flexShrink: '0',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        boxShadow: 'none',
        border: 'none',
        maxWidth: '100%'
    }
    
    if (isAskAnythingStyle.value) {
        return {
            ...baseStyles,
            width: '500px',
            minWidth: '500px'
        }
    }
    
    return {
        ...baseStyles,
        width: '400px'
    }
})

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'toggle-fullscreen', isFullscreen: boolean): void
}>()

const {
  fileInput,
  isUploading,
  showCropper,
  cropperImage,
  cropper,
  widget,
  widgetLoading,
  triggerFileUpload,
  handleFileUpload,
  handleCrop,
  cancelCrop,
  handleClose: handleCloseAgent,
  initializeWidget,
  copyWidgetCode: copyWidgetCodeFn,
  userGroups,
  selectedGroupIds,
  loadingGroups,
  fetchUserGroups,
  updateAgentGroups,
  // Jira integration
  jiraConnected,
  jiraLoading,
  createTicketEnabled,
  jiraProjects,
  jiraIssueTypes,
  selectedProject,
  selectedIssueType,
  loadingProjects,
  loadingIssueTypes,
  checkJiraStatus,
  toggleCreateTicket,
  saveJiraConfig,
  fetchAgentJiraConfig,
  handleProjectChange,
  handleIssueTypeChange,
  shopifyIntegrationEnabled,
  checkShopifyStatus,
  fetchAgentShopifyConfig,
  toggleShopifyIntegration,
  saveShopifyConfig,
  shopifyShopDomain
} = useAgentDetail(agentData, emit)

const { cleanup } = useAgentChat(agentData.value.id)

const handlePreview = (customization: AgentCustomization) => {
    previewCustomization.value = {
        ...customization,
        chat_style: customization.chat_style ?? 'CHATBOT',
        widget_position: customization.widget_position
    }
    
    // Also update the agentData customization to keep it in sync
    // This ensures when switching tabs, the latest saved data is preserved
    agentData.value.customization = {
        ...customization,
        chat_style: customization.chat_style ?? 'CHATBOT',
        widget_position: customization.widget_position
    }
    
    // Update storage to keep data in sync
    agentStorage.updateAgent(agentData.value)
}

// Handle chat style changes for message management in preview
const handleChatStyleChange = (oldStyle: string, newStyle: string) => {
    console.log('Chat style changed in parent:', oldStyle, 'to', newStyle)
    // The actual message management is handled in AgentChatPreviewPanel
    // This handler is just for potential future use
}

const photoUrl = computed(() => {
    if (!agentData.value.customization?.photo_url) {
        return getAvatarUrl(agentData.value.agent_type.toLowerCase())
    }
    
    // If it's an S3 URL (contains amazonaws.com), use it directly
    if (agentData.value.customization.photo_url.includes('amazonaws.com')) {
        return agentData.value.customization.photo_url
    }
    
    // For local storage, prepend the API URL
    return import.meta.env.VITE_API_URL + agentData.value.customization.photo_url
})

const handleClose = () => {
    handleCloseAgent(cleanup)
}

const copyWidgetCode = () => {
    copyWidgetCodeFn(widgetUrl.value)
}

const copyIframeCode = () => {
    if (!widget.value?.id) return
    const iframeCode = `<iframe src="${widgetUrl.value}/api/v1/widgets/${widget.value.id}/data" width="100%" height="600" frameborder="0" title="AI Assistant" allow="clipboard-write"></iframe>`
    navigator.clipboard.writeText(iframeCode).then(() => {
        // Could show a toast notification here
        console.log('Iframe code copied to clipboard')
    }).catch(err => {
        console.error('Failed to copy iframe code: ', err)
    })
}

// Dialog state for knowledge tips
const showTips = ref(false)

// Dialog state for upgrade modal
const showUpgradeModal = ref(false)
const upgradeModalType = ref<'workflow' | 'mcp' | 'advanced'>('workflow')

const openTips = () => {
    showTips.value = true
}

const closeTips = () => {
    showTips.value = false
}

const closeUpgradeModal = () => {
    showUpgradeModal.value = false
}

const handleUpgrade = () => {
    // Navigate to subscription/upgrade page
    // You can implement this based on your routing structure
    window.location.href = '/subscription'
}

// Tab switching function
const switchTab = (tab: string) => {
    activeTab.value = tab
    
    // Update URL with tab parameter
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState({}, '', url.toString())
}

// Check if workflow feature is available in current plan
const hasWorkflowFeature = computed(() => {
    return subscriptionStorage.hasFeature('workflow')
})

// Check if subscription is active
const isSubscriptionActive = computed(() => {
    return subscriptionStorage.isSubscriptionActive()
})

// Determine if workflow is locked (feature not available or subscription not active)
const isWorkflowLocked = computed(() => {
    // Only lock if enterprise module exists
    if (!hasEnterpriseModule) {
        return false
    }
    return !hasWorkflowFeature.value || !isSubscriptionActive.value
})

// Check if MCP tools feature is available in current plan
const hasMCPFeature = computed(() => {
    return subscriptionStorage.hasFeature('mcp_tools')
})

// Determine if MCP tools is locked
const isMCPLocked = computed(() => {
    // Only lock if enterprise module exists
    if (!hasEnterpriseModule) {
        return false
    }
    return !hasMCPFeature.value || !isSubscriptionActive.value
})

// Check if advanced features are available in current plan
const hasAdvancedFeature = computed(() => {
    return subscriptionStorage.hasFeature('advanced_settings')
})

// Determine if advanced tab is locked
const isAdvancedLocked = computed(() => {
    // Only lock if enterprise module exists
    if (!hasEnterpriseModule) {
        return false
    }
    return !hasAdvancedFeature.value || !isSubscriptionActive.value
})

// Computed properties for dynamic modal content
const modalTitle = computed(() => {
    switch (upgradeModalType.value) {
        case 'workflow':
            return 'Unlock Workflow Features'
        case 'mcp':
            return 'Unlock MCP Tools'
        case 'advanced':
            return 'Unlock Advanced Settings'
        default:
            return 'Unlock Premium Features'
    }
})

const modalDescription = computed(() => {
    switch (upgradeModalType.value) {
        case 'workflow':
            return 'Workflow mode allows you to create sophisticated automation flows with conditional logic, multiple steps, and advanced integrations.'
        case 'mcp':
            return 'MCP Tools enable integration with Model Context Protocol servers to extend your agent\'s capabilities with external data sources and services.'
        case 'advanced':
            return 'Advanced settings provide fine-grained control over your agent\'s behavior, performance tuning, and enterprise-grade configuration options.'
        default:
            return 'Upgrade your plan to access premium features and unlock the full potential of your AI agent.'
    }
})

const modalFeatures = computed(() => {
    switch (upgradeModalType.value) {
        case 'workflow':
            return [
                'Visual workflow builder',
                'Conditional logic & branching',
                'Advanced integrations',
                'Custom automation flows'
            ]
        case 'mcp':
            return [
                'Connect to MCP servers',
                'External data integration',
                'Custom tool extensions',
                'Protocol-based communication'
            ]
        case 'advanced':
            return [
                'Performance optimization',
                'Custom system prompts',
                'Enterprise configurations',
                'Advanced debugging tools'
            ]
        default:
            return ['Premium features', 'Advanced capabilities', 'Enhanced functionality', 'Priority support']
    }
})

// Determine if we should show workflow or general tab
const showWorkflowTab = computed(() => {
    return agentData.value.use_workflow === true && hasWorkflowFeature.value
})

// Handle fullscreen toggle from workflow tab
const handleWorkflowFullscreenToggle = (isFullscreen: boolean) => {
    emit('toggle-fullscreen', isFullscreen)
}

// Handle workflow toggle
const handleToggleUseWorkflow = async () => {
    // Check if workflow feature is locked
    if (isWorkflowLocked.value) {
        // Only show upgrade modal if enterprise module exists
        if (hasEnterpriseModule) {
            upgradeModalType.value = 'workflow'
            showUpgradeModal.value = true
            return
        }
        // If no enterprise module, just return without showing modal
        return
    }

    try {
        const newValue = !agentData.value.use_workflow
        const updatedAgent = await agentService.updateAgent(agentData.value.id, { use_workflow: newValue })
        
        // Update the agent data to trigger reactivity
        Object.assign(agentData.value, updatedAgent)
        
        // Update storage to keep data in sync
        agentStorage.updateAgent(updatedAgent)
        
        // Switch to the appropriate tab based on the new mode
        if (newValue) {
            // Switched to workflow mode - go to workflow-builder tab
            activeTab.value = 'workflow-builder'
        } else {
            // Switched to AI mode - go to agent tab
            activeTab.value = 'agent'
        }
        
        // Update URL with new tab
        const url = new URL(window.location.href)
        url.searchParams.set('tab', activeTab.value)
        window.history.replaceState({}, '', url.toString())
        
        // Force reactivity update
        await nextTick()
        
        toast.success(`Workflow mode ${newValue ? 'enabled' : 'disabled'}`, {
            duration: 4000,
            closeButton: true
        })
    } catch (error) {
        console.error('Error toggling workflow mode:', error)
        toast.error('Failed to update workflow mode', {
            duration: 4000,
            closeButton: true
        })
    }
}

// Handle add workflow

// Handle navigate to tab

// Handle save agent changes

// Handle advanced tab updates
const handleAdvancedTabUpdate = async (updatedAgent: AgentWithCustomization) => {
    try {
        // Extract only the fields that advanced tab can update
        const updateData: Record<string, any> = {}
        
        // Check if allow_attachments was updated
        if (updatedAgent.allow_attachments !== agentData.value.allow_attachments) {
            updateData.allow_attachments = updatedAgent.allow_attachments
        }
        
        // If there are changes to save, call the API
        if (Object.keys(updateData).length > 0) {
            const savedAgent = await agentService.updateAgent(agentData.value.id, updateData)
            // Update the agent data to trigger reactivity
            Object.assign(agentData.value, savedAgent)
            // Update storage to keep data in sync
            agentStorage.updateAgent(savedAgent)
            
            toast.success('Settings updated successfully', {
                duration: 3000,
                closeButton: true
            })
        }
    } catch (error) {
        console.error('Error updating advanced settings:', error)
        toast.error('Failed to update settings', {
            duration: 3000,
            closeButton: true
        })
    }
}

// Handle customization save
const handleCustomizationSave = (updatedAgent: AgentWithCustomization) => {
    // Update the agent data to trigger reactivity
    Object.assign(agentData.value, updatedAgent)
    
    // Update storage to keep data in sync
    agentStorage.updateAgent(updatedAgent)
    
    // Update preview customization with all properties including chat_style
    if (updatedAgent.customization) {
        previewCustomization.value = {
            ...updatedAgent.customization,
            chat_style: updatedAgent.customization.chat_style ?? 'CHATBOT',
            widget_position: updatedAgent.customization.widget_position
        }
    }
    
    // Switch back to general tab
    switchTab('general')
}

// Handle save header changes
const handleSaveHeader = async () => {
    try {
        const updatedAgent = await agentService.updateAgent(agentData.value.id, {
            display_name: editDisplayName.value,
            is_active: editIsActive.value
        })
        
        // Update the agent data to trigger reactivity
        Object.assign(agentData.value, updatedAgent)
        
        // Update storage to keep data in sync
        agentStorage.updateAgent(updatedAgent)
        
        isEditingHeader.value = false
        
        toast.success('Agent updated successfully', {
            duration: 4000,
            closeButton: true
        })
    } catch (error) {
        console.error('Error saving agent:', error)
        toast.error('Failed to save agent changes', {
            duration: 4000,
            closeButton: true
        })
    }
}

// Handle cancel header edit
const handleCancelHeaderEdit = () => {
    editDisplayName.value = agentData.value.display_name || agentData.value.name
    editIsActive.value = agentData.value.is_active
    isEditingHeader.value = false
}

// Handle status toggle
const handleStatusToggle = async (event: Event) => {
    const newStatus = (event.target as HTMLInputElement).checked
    
    if (isEditingHeader.value) {
        editIsActive.value = newStatus
    } else {
        // Directly update the agent status
        try {
            const updatedAgent = await agentService.updateAgent(agentData.value.id, {
                is_active: newStatus
            })
            
            // Update the agent data to trigger reactivity
            agentData.value.is_active = newStatus
            
            // Update storage to keep data in sync
            agentStorage.updateAgent(updatedAgent)
            
            toast.success(`Agent ${newStatus ? 'activated' : 'deactivated'} successfully`, {
                duration: 3000,
                closeButton: true
            })
        } catch (error) {
            console.error('Error updating agent status:', error)
            toast.error('Failed to update agent status', {
                duration: 4000,
                closeButton: true
            })
            // Revert the checkbox state on error
            ;(event.target as HTMLInputElement).checked = agentData.value.is_active
        }
    }
}

// Handle save agent from tab
const handleSaveAgentFromTab = async (data: any) => {
    try {
        // Convert instructions back to array format if it's a string
        let instructions = data.instructions
        if (typeof instructions === 'string') {
            instructions = instructions.split('\n').filter((line: string) => line.trim())
        }

        const updatedAgent = await agentService.updateAgent(agentData.value.id, {
            instructions: instructions,
            transfer_to_human: data.transferToHuman,
            ask_for_rating: data.askForRating
        })
        
        // Update agent groups if changed
        if (data.selectedGroupIds && data.selectedGroupIds.length !== selectedGroupIds.value.length || 
            !data.selectedGroupIds.every((id: string) => selectedGroupIds.value.includes(id))) {
            await updateAgentGroups(data.selectedGroupIds)
        }
        
        // Update the agent data to trigger reactivity
        Object.assign(agentData.value, updatedAgent)
        
        // Update storage to keep data in sync
        agentStorage.updateAgent(updatedAgent)
        
        toast.success('Agent updated successfully', {
            duration: 4000,
            closeButton: true
        })
    } catch (error) {
        console.error('Error saving agent:', error)
        toast.error('Failed to save agent changes', {
            duration: 4000,
            closeButton: true
        })
    }
}

onMounted(async () => {
    initializeWidget()
    fetchUserGroups()
    
    // First check Jira status, then fetch agent config
    await checkJiraStatus()
    await fetchAgentJiraConfig()
    
    // Check Shopify status and fetch config
    await checkShopifyStatus()
    await fetchAgentShopifyConfig()
    
    // Check if we should switch to knowledge tab based on URL query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['agent', 'preview', 'knowledge', 'integrations', 'mcp-tools', 'widget', 'advanced', 'workflow-builder', 'customization'].includes(tab)) {
        activeTab.value = tab
    } else if (agentData.value.use_workflow === true) {
        // Show workflow builder tab by default when using workflow
        activeTab.value = 'workflow-builder'
    } else {
        // Show agent tab by default when NOT using workflow
        activeTab.value = 'agent'
    }
})

</script>

<template>
    <div class="agent-detail">
        <!-- Left Panel -->
        <div class="detail-panel">
                    <div class="panel-header">
            <div class="header-layout">
                <button class="back-button" @click="handleClose" aria-label="Back to agents">
                    <svg class="back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5m7-7-7 7 7 7"/>
                    </svg>
                </button>
                <div class="agent-header">
                    <div class="agent-avatar" @click="triggerFileUpload">
                        <input type="file" ref="fileInput" accept="image/jpeg,image/png,image/webp" class="hidden"
                            @change="handleFileUpload">
                        <img :src="photoUrl" :alt="agentData.name" :class="{ 'opacity-50': isUploading }">
                        <div class="upload-overlay" v-if="!isUploading">
                            <span>Change Photo</span>
                        </div>
                        <div class="upload-overlay" v-else>
                            <span>Uploading...</span>
                        </div>
                    </div>
                    <div class="agent-info">
                        <div class="name-section">
                            <div v-if="!isEditingHeader" class="name-display">
                                <h3>{{ agentData.display_name || agentData.name }}</h3>
                                <button class="edit-icon-button" @click="isEditingHeader = true" title="Edit name and status">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                            </div>
                            <div v-else class="name-edit">
                                <input 
                                    v-model="editDisplayName" 
                                    class="name-input"
                                    placeholder="Enter display name"
                                    @keyup.enter="handleSaveHeader"
                                    @keyup.escape="handleCancelHeaderEdit"
                                >
                                <div class="edit-actions">
                                    <button class="save-icon-button" @click="handleSaveHeader" title="Save">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20,6 9,17 4,12"></polyline>
                                        </svg>
                                    </button>
                                    <button class="cancel-icon-button" @click="handleCancelHeaderEdit" title="Cancel">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="status-and-mode">
                            <div class="status-toggle">
                                <label class="status-switch" :class="{ 'editing': isEditingHeader }">
                                    <input 
                                        type="checkbox" 
                                        :checked="isEditingHeader ? editIsActive : agentData.is_active"
                                        @change="handleStatusToggle"
                                    >
                                    <span class="status-slider"></span>
                                </label>
                                <span class="status-text">{{ (isEditingHeader ? editIsActive : agentData.is_active) ? 'Online' : 'Offline' }}</span>
                            </div>
                            
                            <!-- Mode Selection -->
                            <div class="mode-selection">
                                <div class="mode-toggle">
                                    <button 
                                        class="mode-button" 
                                        :class="{ 'active': !agentData.use_workflow }"
                                        @click="!agentData.use_workflow || handleToggleUseWorkflow()"
                                    >
                                        <svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="3"/>
                                            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5L19 4l-1.5 1.5M6.5 17.5L5 19l1.5 1.5m0-11L5 5l1.5 1.5m11 11L19 19l-1.5-1.5"/>
                                        </svg>
                                        <span class="mode-label">AI Mode</span>
                                    </button>
                                    <button 
                                        class="mode-button" 
                                        :class="{ 
                                            'active': agentData.use_workflow,
                                            'locked': isWorkflowLocked
                                        }"
                                        :disabled="isWorkflowLocked && !agentData.use_workflow"
                                        @click="agentData.use_workflow || handleToggleUseWorkflow()"
                                        :title="isWorkflowLocked ? 'Upgrade your plan to unlock Workflow mode' : 'Switch to Workflow mode'"
                                    >
                                        <svg class="mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="3" width="6" height="6"/>
                                            <rect x="15" y="3" width="6" height="6"/>
                                            <rect x="9" y="15" width="6" height="6"/>
                                            <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/>
                                            <path d="M12 15v-3"/>
                                        </svg>
                                        <span class="mode-label">Workflow</span>
                                        <font-awesome-icon v-if="hasEnterpriseModule && isWorkflowLocked" icon="fa-solid fa-lock" class="lock-icon" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            <div class="panel-content">
                <div class="content-layout">
                    <!-- Tab Navigation - Horizontal -->
                    <div class="tabs-navigation horizontal">
                        <button 
                            class="tab-button" 
                            :class="{ 'active': activeTab === 'agent' }"
                            @click="switchTab('agent')"
                            v-if="!showWorkflowTab"
                        >
                            Agent
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ 
                                'active': activeTab === 'workflow-builder',
                                'locked': isWorkflowLocked 
                            }"
                            :disabled="isWorkflowLocked"
                            @click="isWorkflowLocked ? (upgradeModalType = 'workflow', showUpgradeModal = true) : switchTab('workflow-builder')"
                            :title="isWorkflowLocked ? 'Upgrade your plan to unlock Workflow Builder' : 'Workflow Builder'"
                            v-if="agentData.use_workflow || isWorkflowLocked"
                        >
                            Workflow Builder
                            <font-awesome-icon v-if="hasEnterpriseModule && isWorkflowLocked" icon="fa-solid fa-lock" class="lock-icon-small" />
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ 'active': activeTab === 'customization' }"
                            @click="switchTab('customization')"
                        >
                            Chat Customization
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ 'active': activeTab === 'preview' }"
                            @click="switchTab('preview')"
                        >
                            Test & Preview
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ 'active': activeTab === 'knowledge' }"
                            @click="switchTab('knowledge')"
                        >
                            Knowledge
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ 'active': activeTab === 'integrations' }"
                            @click="switchTab('integrations')"
                        >
                            Integrations
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ 'active': activeTab === 'mcp-tools', 'locked': isMCPLocked }"
                            :disabled="isMCPLocked"
                            @click="isMCPLocked ? (upgradeModalType = 'mcp', showUpgradeModal = true) : switchTab('mcp-tools')"
                            :title="isMCPLocked ? 'Upgrade your plan to unlock MCP Tools' : 'MCP Tools'"
                        >
                            MCP Tools
                            <font-awesome-icon v-if="hasEnterpriseModule && isMCPLocked" icon="fa-solid fa-lock" class="lock-icon-small" />
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ 'active': activeTab === 'widget' }"
                            @click="switchTab('widget')"
                        >
                            Widget
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ 'active': activeTab === 'advanced', 'locked': isAdvancedLocked }"
                            :disabled="isAdvancedLocked"
                            @click="isAdvancedLocked ? (upgradeModalType = 'advanced', showUpgradeModal = true) : switchTab('advanced')"
                            :title="isAdvancedLocked ? 'Upgrade your plan to unlock Advanced Settings' : 'Advanced'"
                        >
                            Advanced
                            <font-awesome-icon v-if="hasEnterpriseModule && isAdvancedLocked" icon="fa-solid fa-lock" class="lock-icon-small" />
                        </button>

 
                    </div>

                    <!-- Tab Content -->
                    <div class="tab-content-container">
                        <!-- Agent Tab -->
                        <div v-if="activeTab === 'agent'" class="tab-content">
                            <AgentInstructionsTab
                                :instructions="instructionsText"
                                :transfer-to-human="agentData.transfer_to_human"
                                :ask-for-rating="agentData.ask_for_rating"
                                :user-groups="userGroups"
                                :selected-group-ids="selectedGroupIds"
                                :loading-groups="loadingGroups"
                                :is-editing="true"
                                :agent="agentData"
                                @save-agent="handleSaveAgentFromTab"
                            />
                        </div>



                        <!-- Preview Tab -->
                        <div v-if="activeTab === 'preview'" class="tab-content">
                            <div class="preview-container">
                                <div class="preview-header">
                                    <h3 class="section-title">Chat Preview</h3>
                                    <p class="section-description">
                                        This is how your chat widget will appear to users. The preview shows the exact interface they will interact with.
                                    </p>
                                </div>
                                <div class="preview-wrapper" :style="previewWrapperStyles">
                                    <iframe 
                                        v-if="widget?.id"
                                        :src="iframeUrl"
                                        class="widget-preview"
                                        frameborder="0"
                                        title="Widget Preview"
                                        allow="clipboard-write"
                                    ></iframe>
                                    <div v-else class="loading-preview">
                                        Loading widget preview...
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Knowledge Tab -->
                        <div v-if="activeTab === 'knowledge'" class="tab-content">
                            <div class="knowledge-tab-container">
                                <div class="knowledge-header">
                                    <div>
                                        <h3 class="section-title">Knowledge Sources</h3>
                                        <p class="section-description">
                                            Connect your agent to various knowledge sources to enhance its responses with context-relevant information.
                                        </p>
                                    </div>
                                    <div class="knowledge-actions">
                                        <button class="knowledge-action-button" title="Quick tips for managing knowledge" @click="openTips">
                                            <span class="icon">💡</span>
                                            <span>Tips</span>
                                        </button>
                                    </div>
                                </div>
                                <KnowledgeGrid :agent-id="agentData.id" :organization-id="agentData.organization_id" />
                            </div>
                        </div>

                        <!-- Integrations Tab -->
                        <div v-if="activeTab === 'integrations'" class="tab-content">
                            <AgentIntegrationsTab
                                :jira-connected="jiraConnected"
                                :jira-loading="jiraLoading"
                                :create-ticket-enabled="createTicketEnabled"
                                :jira-projects="jiraProjects"
                                :jira-issue-types="jiraIssueTypes"
                                :selected-project="selectedProject"
                                :selected-issue-type="selectedIssueType"
                                :loading-projects="loadingProjects"
                                :loading-issue-types="loadingIssueTypes"
                                :shopify-integration-enabled="shopifyIntegrationEnabled"
                                :shopify-shop-domain="shopifyShopDomain"
                                @toggle-create-ticket="toggleCreateTicket"
                                @handle-project-change="handleProjectChange"
                                @handle-issue-type-change="handleIssueTypeChange"
                                @save-jira-config="(config) => saveJiraConfig(config.projectKey, config.issueTypeId)"
                                @toggle-shopify-integration="toggleShopifyIntegration"
                                @save-shopify-config="saveShopifyConfig"
                            />
                        </div>

                        <!-- MCP Tools Tab -->
                        <div v-if="activeTab === 'mcp-tools'" class="tab-content">
                            <AgentMCPToolsTab
                                :agent-id="agentData.id"
                            />
                        </div>

                        <!-- Widget Tab -->
                        <div v-if="activeTab === 'widget'" class="tab-content">
                            <AgentWidgetTab
                                :widget="widget"
                                :widget-url="widgetUrl"
                                :widget-loading="widgetLoading"
                                :agent="agent"
                                @copy-widget-code="copyWidgetCode"
                                @copy-iframe-code="copyIframeCode"
                            />
                        </div>

                        <!-- Advanced Tab -->
                        <div v-if="activeTab === 'advanced'" class="tab-content">
                            <AgentAdvancedTab
                                :agent="agentData"
                                @update="handleAdvancedTabUpdate"
                            />
                        </div>

                        <!-- Workflow Builder Tab -->
                        <div v-if="activeTab === 'workflow-builder'" class="tab-content">
                            <AgentWorkflowTab
                                :key="`workflow-${agentData.id}-${agentData.use_workflow}`"
                                :agent="agentData"
                                @toggle-fullscreen="handleWorkflowFullscreenToggle"
                            />
                        </div>

                        <!-- Customization Tab -->
                        <div v-if="activeTab === 'customization'" class="tab-content">
                            <div class="customization-tab-layout">
                                <div class="customization-panel">
                                    <AgentCustomizationView
                                        :agent="agentData"
                                        @preview="handlePreview"
                                        @save="handleCustomizationSave"
                                        @cancel="() => switchTab('agent')"
                                        @chat-style-changed="handleChatStyleChange"
                                    />
                                </div>
                                <div class="customization-preview">
                                    <AgentChatPreviewPanel
                                        :is-active="agentData.is_active"
                                        :customization="previewCustomization"
                                        :agent-type="agentData.agent_type"
                                        :agent-name="agentData.display_name || agentData.name"
                                        :agent-id="agentData.id"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cropper Modal -->
            <div v-if="showCropper" class="cropper-modal">
                <div class="cropper-container">
                    <Cropper ref="cropper" :src="cropperImage" :stencil-props="{
                        aspectRatio: 1,
                        previewClass: 'preview-circle'
                    }" :default-size="{
                        width: 250,
                        height: 250
                    }" :stencil-component="CircleStencil" image-restriction="stencil" background="#f0f0f0" />
                    <div class="cropper-actions">
                        <button @click="handleCrop" :disabled="isUploading">
                            {{ isUploading ? 'Uploading...' : 'Save' }}
                        </button>
                        <button @click="cancelCrop">Cancel</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Knowledge Tips Dialog -->
        <div v-if="showTips" class="tips-dialog-overlay">
            <div class="tips-dialog">
                <div class="tips-dialog-header">
                    <h3>Knowledge Management Tips</h3>
                    <button class="close-button" @click="closeTips">×</button>
                </div>
                <div class="tips-dialog-content">
                    <div class="tip-item">
                        <div class="tip-icon">📄</div>
                        <div class="tip-content">
                            <h4>PDF Documents</h4>
                            <p>Upload PDF files to give your agent access to document content. Best for manuals, reports, and structured documents.</p>
                        </div>
                    </div>
                    <div class="tip-item">
                        <div class="tip-icon">🔗</div>
                        <div class="tip-content">
                            <h4>Web Pages</h4>
                            <p>Add URLs for web content you want the agent to reference. Great for dynamic information that updates regularly.</p>
                        </div>
                    </div>
                    <div class="tip-item">
                        <div class="tip-icon">🔄</div>
                        <div class="tip-content">
                            <h4>Link Existing Sources</h4>
                            <p>Reuse knowledge sources across multiple agents to maintain consistency in responses.</p>
                        </div>
                    </div>
                    <div class="tip-item">
                        <div class="tip-icon">⚙️</div>
                        <div class="tip-content">
                            <h4>Processing Time</h4>
                            <p>Knowledge sources are processed asynchronously. Allow a few minutes for large documents to be fully indexed.</p>
                        </div>
                    </div>
                </div>
                <div class="tips-dialog-footer">
                    <button class="close-tips-button" @click="closeTips">Got it</button>
                </div>
            </div>
        </div>

        <!-- Upgrade Modal (only shown when enterprise module exists) -->
        <div v-if="hasEnterpriseModule && showUpgradeModal" class="upgrade-modal-overlay">
            <div class="upgrade-modal">
                <div class="upgrade-modal-header">
                    <div class="upgrade-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <h3>{{ modalTitle }}</h3>
                    <button class="close-button" @click="closeUpgradeModal">×</button>
                </div>
                <div class="upgrade-modal-content">
                    <p class="upgrade-description">
                        {{ modalDescription }}
                    </p>
                    <div class="upgrade-features">
                        <div v-for="feature in modalFeatures" :key="feature" class="feature-item">
                            <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                            </svg>
                            <span>{{ feature }}</span>
                        </div>
                    </div>
                </div>
                <div class="upgrade-modal-footer">
                    <button class="upgrade-button" @click="handleUpgrade">
                        Upgrade Plan
                        <svg class="upgrade-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14m-7-7 7 7-7 7"/>
                        </svg>
                    </button>
                    <button class="cancel-upgrade-button" @click="closeUpgradeModal">Maybe Later</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.agent-detail {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    height: auto;
    background: var(--background-base);
    overflow-x: hidden;
    max-width: 100vw;
    box-sizing: border-box;
}

.detail-panel {
    flex: 1;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: visible;
    display: flex;
    flex-direction: column;
    margin: var(--space-sm);
    min-height: calc(100vh - 2 * var(--space-sm));
    max-width: 100%;
}

.panel-header {
    padding: var(--space-lg) var(--space-lg) var(--space-md);
    border-bottom: 1px solid var(--border-color);
    background: var(--background-soft);
}

.header-layout {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.back-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-muted);
    flex-shrink: 0;
}

.back-button:hover {
    background: var(--background-muted);
    color: var(--text-color);
    transform: translateX(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-icon {
    transition: transform 0.2s ease;
}

.back-button:hover .back-icon {
    transform: translateX(-1px);
}

.agent-header {
    display: flex;
    gap: var(--space-md);
    align-items: center;
    flex: 1;
    min-width: 0; /* Allow shrinking */
}

.agent-avatar {
    position: relative;
    cursor: pointer;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.agent-avatar:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.hidden {
    display: none;
}

.upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: all 0.3s ease;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    backdrop-filter: blur(2px);
}

.agent-avatar:hover .upload-overlay {
    opacity: 1;
    transform: scale(1.02);
}

.agent-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.agent-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    min-width: 0; /* Allow shrinking */
    overflow: hidden;
}

.agent-info h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.name-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    min-width: 0;
    overflow: hidden;
}

.name-display {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.name-edit {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
}

.name-input {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 600;
    background: white;
    color: var(--text-color);
    min-width: 0;
}

.name-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-soft);
}

.edit-actions {
    display: flex;
    gap: var(--space-xs);
}

.edit-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: var(--background-soft);
    border-radius: var(--radius-md);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
}

.edit-icon-button:hover {
    background: var(--background-muted);
    color: var(--text-color);
    transform: translateY(-1px);
}

.save-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: var(--success-color);
    border-radius: var(--radius-sm);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.save-icon-button:hover {
    background: var(--success-dark);
    transform: translateY(-1px);
}

.cancel-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: var(--background-muted);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-icon-button:hover {
    background: var(--error-color);
    color: white;
    transform: translateY(-1px);
}

.status-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.status-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;
}

.status-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.status-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 22px;
}

.status-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.status-switch input:checked + .status-slider {
    background-color: var(--success-color);
}

.status-switch input:checked + .status-slider:before {
    transform: translateX(22px);
}

.status-switch input:disabled + .status-slider {
    cursor: not-allowed;
    opacity: 0.7;
}

.status-switch.editing input:disabled + .status-slider {
    cursor: pointer;
    opacity: 1;
}

.status-switch:not(.editing) .status-slider:hover {
    opacity: 0.8;
}



.status-and-mode {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.status {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--error-color, #ef4444);
    position: relative;
    animation: pulse-offline 2s infinite;
}

.status-indicator.online {
    background: var(--success-color, #22c55e);
    animation: pulse-online 2s infinite;
}

.status-text {
    font-weight: 500;
    font-size: var(--text-sm);
    color: var(--text-muted);
}

/* Mode Selection Styles */
.mode-selection {
    margin-top: var(--space-xs);
}

.mode-toggle {
    display: inline-flex;
    background: var(--background-soft);
    border-radius: var(--radius-full);
    padding: 2px;
    border: 1px solid var(--border-color);
}

.mode-button {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: transparent;
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    white-space: nowrap;
    position: relative;
}

.mode-button:hover {
    background: var(--background-muted);
    color: var(--text-color);
}

.mode-button.active {
    background: var(--primary-color);
    color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mode-button:first-child.active {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.mode-button:last-child.active {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.mode-icon {
    width: 14px;
    height: 14px;
    stroke-width: 2;
    flex-shrink: 0;
}

.mode-label {
    font-size: 0.75rem;
    font-weight: 500;
}

.mode-button.locked {
    opacity: 0.6;
    cursor: not-allowed;
    position: relative;
}

.mode-button.locked:hover {
    background: var(--background-muted);
    color: var(--text-muted);
    transform: none;
}

.lock-icon {
    font-size: 10px;
    margin-left: var(--space-xs);
    opacity: 0.7;
    color: var(--warning-color);
}

@keyframes pulse-online {
    0% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
}

@keyframes pulse-offline {
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
}

.detail-section {
    margin-bottom: var(--space-xl);
}

.detail-section h4 {
    margin-bottom: var(--space-md);
    color: var(--text-muted);
}

.instructions-textarea {
    width: 100%;
    min-height: 150px;
    padding: var(--space-sm);
    background: var(--background-soft);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    font-family: inherit;
    font-size: inherit;
    line-height: 1.5;
    resize: vertical;
    color: var(--text-color);
}

.instructions-textarea:read-only {
    background: var(--background-soft);
    cursor: default;
    opacity: 0.9;
}

.instructions-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-soft);
}

.cropper-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.cropper-container {
    background: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.crop-area {
    position: relative;
    width: 100%;
    height: 400px;
    background: var(--background-soft, #f8f9fa);
}

.cropper-actions {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.cropper-actions button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}

.cropper-actions button:first-child {
    background: var(--primary-color);
    color: white;
}

.cropper-actions button:last-child {
    background: var(--background-soft);
}

.cropper-actions button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.preview-circle {
    border-radius: 50%;
}

:deep(.vue-advanced-cropper__foreground) {
    border-radius: 50%;
}

:deep(.vue-advanced-cropper__background) {
    background: #f0f0f0;
}

.widget-info {
    background: var(--background-soft);
    border-radius: var(--radius-lg);
    padding: var(--space-sm);
    width: 100%;
}

.widget-code {
    font-family: monospace;
    font-size: 0.85em;
}

.code-container {
    background: var(--background-alt);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    width: 100%;
}

.code-container code {
    font-size: 11px;
    color: var(--text-muted);
    white-space: normal;
    word-break: break-all;
    flex: 1;
}

.copy-button {
    background: transparent;
    border: none;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.copy-button:hover {
    background: var(--background-soft);
    color: var(--text-color);
}

.widget-code pre {
    display: none;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
}

.toggle-switch {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.toggle-label {
    font-size: 0.9em;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: help;
}

.info-icon {
    font-size: 0.9em;
    color: var(--text-muted);
    opacity: 0.7;
}

.switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(252, 0, 0);
    transition: .4s;
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: rgb(255, 255, 255);
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: green;
}

input:focus + .slider {
    box-shadow: 0 0 1px var(--primary-color);
}

input:checked + .slider:before {
    transform: translateX(24px);
}

:deep(.v-popper__inner) {
    white-space: pre-line;
    max-width: 300px;
    line-height: 1.4;
}

:deep(.v-popper__arrow) {
    border-color: var(--background-alt);
}

:deep(.v-popper__inner) {
    background: var(--background-alt);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    font-size: 0.9em;
}

.transfer-section {
    margin-top: var(--space-lg);
    border-top: 1px solid var(--border-color);
    padding-top: var(--space-lg);
}

.transfer-toggle {
    margin-bottom: var(--space-lg);
}

.toggle-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
}

.transfer-groups {
    padding: var(--space-md);
    background: var(--background-soft);
    border-radius: var(--radius-md);
}

.helper-text {
    color: var(--text-muted);
    font-size: var(--text-sm);
    margin-bottom: var(--space-md);
}

.groups-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.group-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
}

.no-groups-message {
    text-align: center;
    padding: var(--space-lg);
    background: var(--background-mute);
    border-radius: var(--radius-md);
    color: var(--text-muted);
}

.create-group-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    margin-top: var(--space-md);
    color: var(--primary-color);
    font-weight: 500;
    transition: opacity var(--transition-fast);
}

.create-group-link:hover {
    opacity: 0.8;
}

.create-group-link i {
    font-size: 0.8em;
}

.loading-groups {
    text-align: center;
    padding: var(--space-md);
    background: var(--background-mute);
    border-radius: var(--radius-md);
    color: var(--text-muted);
}

.preview-panel {
    background: var(--background-soft);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.widget-preview {
    width: 100%;
    height: 600px;
    border: none;
    background: none;
    border-radius: var(--radius-lg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.preview-container {
    display: flex;
    flex-direction: row;
    gap: var(--space-xl);
    padding: var(--space-lg);
    height: 100%;
}

.preview-header {
    flex: 1;
    max-width: 480px;
    overflow-y: auto;
}

.preview-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--space-sm);
}

.preview-wrapper {
    /* Base styles are now handled by computed previewWrapperStyles */
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    padding-top: 0;
    transition: all 0.3s ease;
}

.loading-preview {
    color: var(--text-muted);
    text-align: center;
    padding: var(--space-xl);
    background: var(--background-alt);
    border-radius: var(--radius-lg);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.loading-preview::before {
    content: "";
    width: 40px;
    height: 40px;
    margin-bottom: var(--space-md);
    border: 3px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--primary-color);
    animation: loading-spinner 1s linear infinite;
}

@keyframes loading-spinner {
    to {
        transform: rotate(360deg);
    }
}

.rating-toggle {
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border-color);
}

.ticket-toggle {
    margin-top: var(--space-lg);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--border-color);
}

.jira-status {
    margin-top: var(--space-sm);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.jira-status.loading {
    background-color: var(--background-mute);
    color: var(--text-muted);
}

.jira-status.connected {
    background-color: var(--success-light);
    color: var(--success);
}

.jira-status.not-connected {
    background-color: var(--warning-light);
    color: var(--warning);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.connect-link {
    color: var(--primary-color);
    font-weight: 500;
    text-decoration: none;
    padding: var(--space-xs) var(--space-sm);
    background-color: var(--primary-soft);
    border-radius: var(--radius-full);
    transition: all var(--transition-fast);
}

.connect-link:hover {
    background-color: var(--primary-color);
    color: white;
}

.jira-config {
    margin-top: var(--space-md);
    padding: var(--space-md);
    background-color: var(--background-soft);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.form-group label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-muted);
}

.form-group select {
    padding: var(--space-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: var(--text-sm);
}

.form-group select:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-indicator {
    font-size: var(--text-sm);
    color: var(--text-muted);
    padding: var(--space-sm);
}

.save-config-btn {
    margin-top: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: white;
    border: none;
    border-radius: var(--radius-full);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.save-config-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.save-config-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    filter: grayscale(0.5);
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

.tab-content {
    animation: fadeIn 0.4s ease;
    flex: 1;
    overflow: visible;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-top: var(--space-md);
    min-height: calc(100vh - 300px);
}

.content-layout {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    flex: 1;
}

.panel-content {
    flex: 1;
    overflow: visible;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.tab-content-container {
    flex: 1;
    overflow: visible;
    display: flex;
    flex-direction: column;
    background: var(--background-base);
    padding: var(--space-lg);
    min-height: calc(100vh - 200px);
}

.tab-button {
    padding: var(--space-lg) var(--space-xl);
    background: transparent;
    border: none;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    font-size: var(--text-sm);
    color: var(--text-muted);
    position: relative;
    text-align: center;
    white-space: nowrap;
    border-bottom: 3px solid transparent;
    flex-shrink: 0;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tabs-navigation {
    flex-shrink: 0;
}

.tabs-navigation.horizontal {
    display: flex;
    gap: var(--space-md);
    border-bottom: 1px solid var(--border-color);
    padding: 0 var(--space-lg);
    margin: 0;
    overflow-x: auto;
    background: white;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    min-height: 64px;
    align-items: flex-end;
}

.tabs-navigation.horizontal::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
}

.tab-button:hover {
    color: var(--text-color);
    background: var(--background-soft);
    transform: translateY(-1px);
    border-radius: var(--radius-md);
}

.tab-button.active {
    color: var(--primary-color);
    font-weight: 600;
    background: var(--primary-soft);
    border-bottom-color: var(--primary-color);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.tabs-navigation.horizontal .tab-button.active::after {
    display: none;
}

.tab-button.locked {
    opacity: 0.6;
    cursor: not-allowed;
    position: relative;
}

.tab-button.locked:hover {
    color: var(--text-muted);
    background: var(--background-soft);
    transform: none;
}

.lock-icon-small {
    font-size: 12px;
    margin-left: var(--space-xs);
    opacity: 0.7;
    color: var(--warning-color);
}

.integration-section {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    background-color: var(--background-soft);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.knowledge-tab-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: var(--space-lg);
    line-height: 1.3;
}

.section-description {
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: var(--space-xl);
    max-width: 600px;
}

.knowledge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
}

.knowledge-actions {
    display: flex;
    gap: var(--space-sm);
}

.knowledge-action-button {
    background: transparent;
    border: none;
    padding: var(--space-xs) var(--space-sm);
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    transition: all 0.2s ease;
}

.knowledge-action-button:hover {
    color: var(--text-color);
    background-color: var(--background-soft);
}

.icon {
    font-size: 1.25rem;
}

.tips-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.tips-dialog {
    background: #ffffff;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.tips-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
}

.tips-dialog-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
}

.close-button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    color: var(--text-muted);
}

.tips-dialog-content {
    margin-bottom: var(--space-md);
}

.tip-item {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
}

.tip-icon {
    font-size: 1.25rem;
    color: var(--text-muted);
}

.tip-content {
    flex: 1;
}

.tip-content h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--space-xs);
}

.tip-content p {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.5;
}

.tips-dialog-footer {
    text-align: right;
}

.close-tips-button {
    padding: var(--space-sm) var(--space-md);
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
}

.customization-tab-layout {
    display: flex;
    gap: var(--space-xl);
    height: 100%;
    padding: var(--space-lg);
    min-height: calc(100vh - 400px);
}

.customization-panel {
    flex: 1;
    max-width: 480px;
    height: calc(100vh - 250px);
    max-height: 800px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: var(--space-xs);
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.customization-panel::-webkit-scrollbar {
    width: 8px;
}

.customization-panel::-webkit-scrollbar-track {
    background: transparent;
}

.customization-panel::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.customization-panel::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
}

.customization-preview {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    padding-top: 0;
}

/* Responsive Design for smaller laptops */
@media (max-width: 1600px) {
    .panel-header {
        padding: var(--space-md) var(--space-md) var(--space-sm);
    }
    
    .header-layout {
        gap: var(--space-sm);
    }
    
    .agent-header {
        gap: var(--space-sm);
    }
    
    .agent-avatar {
        width: 64px;
        height: 64px;
    }
    
    .agent-info h3 {
        font-size: 1.125rem;
    }
    
    .tabs-navigation.horizontal {
        padding: 0 var(--space-sm);
        gap: var(--space-xs);
        min-height: 60px;
    }
    
    .tab-button {
        padding: var(--space-md) var(--space-sm);
        font-size: 0.8rem;
        min-height: 44px;
    }
    
    .tab-content-container {
        padding: var(--space-md);
    }
}

@media (max-width: 1440px) {
    .detail-panel {
        margin: var(--space-xs);
    }
    
    .panel-header {
        padding: var(--space-sm) var(--space-sm) var(--space-xs);
    }
    
    .agent-avatar {
        width: 56px;
        height: 56px;
    }
    
    .agent-info h3 {
        font-size: 1rem;
    }
    
    .mode-button {
        padding: var(--space-xs) var(--space-xs);
    }
    
    .mode-label {
        font-size: 0.625rem;
    }
    
    .status-and-mode {
        gap: var(--space-xs);
    }
    
    .mode-toggle {
        padding: 1px;
    }
    
    .status-text {
        font-size: 0.75rem;
    }
    
    .tabs-navigation.horizontal {
        padding: 0 var(--space-xs);
        gap: var(--space-xs);
        min-height: 56px;
    }
    
    .tab-button {
        padding: var(--space-sm) var(--space-xs);
        font-size: 0.75rem;
        min-height: 40px;
    }
    
    .customization-tab-layout {
        padding: var(--space-sm);
        gap: var(--space-md);
    }
    
    .customization-panel {
        height: calc(100vh - 350px);
        max-height: 600px;
    }
}

/* Additional responsive for very compact screens */
@media (max-width: 1200px) {
    .tabs-navigation.horizontal {
        padding: 0 4px;
        gap: 2px;
        min-height: 52px;
    }
    
    .tab-button {
        padding: var(--space-xs) 6px;
        font-size: 0.7rem;
        min-height: 36px;
    }
    
    .detail-panel {
        margin: 2px;
    }
}

/* Upgrade Modal Styles */
.upgrade-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.upgrade-modal {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.upgrade-modal-header {
    padding: var(--space-xl);
    text-align: center;
    position: relative;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: white;
}

.upgrade-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto var(--space-md);
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upgrade-icon svg {
    width: 24px;
    height: 24px;
}

.upgrade-modal-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: white;
}

.upgrade-modal-header .close-button {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: white;
    cursor: pointer;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.upgrade-modal-header .close-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.upgrade-modal-content {
    padding: var(--space-xl);
}

.upgrade-description {
    font-size: 1rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: var(--space-xl);
    text-align: center;
}

.upgrade-features {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.feature-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm);
    background: var(--background-soft);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--primary-color);
}

.feature-icon {
    width: 18px;
    height: 18px;
    color: var(--success-color);
    flex-shrink: 0;
}

.feature-item span {
    font-weight: 500;
    color: var(--text-color);
}

.upgrade-modal-footer {
    padding: var(--space-lg) var(--space-xl);
    background: var(--background-soft);
    display: flex;
    gap: var(--space-md);
    justify-content: center;
}

.upgrade-button {
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: white;
    border: none;
    border-radius: var(--radius-full);
    padding: var(--space-md) var(--space-xl);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upgrade-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    filter: brightness(1.1);
}

.upgrade-arrow {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
}

.upgrade-button:hover .upgrade-arrow {
    transform: translateX(2px);
}

.cancel-upgrade-button {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-full);
    padding: var(--space-md) var(--space-lg);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-upgrade-button:hover {
    background: var(--background-muted);
    color: var(--text-color);
    border-color: var(--text-muted);
}


</style>