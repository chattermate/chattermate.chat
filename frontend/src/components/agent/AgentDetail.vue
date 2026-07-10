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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { AgentWithCustomization, AgentCustomization } from '@/types/agent'
import { getAvatarUrl, isAbsoluteUrl } from '@/utils/avatars'
import { ORB_PALETTE_COUNT, getOrbStyleAt, resolveOrbStyle, orbSvgDataUri, terminalMarkSvgDataUri } from '@/utils/orb'

import KnowledgeExplorer from '@/components/knowledge/KnowledgeExplorer.vue'
import AgentCustomizationView from './AgentCustomizationView.vue'
import AgentChatPreviewPanel from './AgentChatPreviewPanel.vue'
import AgentIntegrationsTab from './AgentIntegrationsTab.vue'
import AgentWidgetTab from './AgentWidgetTab.vue'

import AgentAdvancedTab from './AgentAdvancedTab.vue'
import AgentInstructionsTab from './AgentInstructionsTab.vue'
import AgentWorkflowTab from './AgentWorkflowTab.vue'
import AgentMCPToolsTab from './AgentMCPToolsTab.vue'
import AgentLeadCaptureTab from './AgentLeadCaptureTab.vue'
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

// Avatar picker (preset avatars + upload)
const avatarModules = import.meta.glob('@/assets/avatars/avatar-*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const presetAvatars = Object.keys(avatarModules).sort().map((k) => avatarModules[k])
const showAvatarPicker = ref(false)
// Show the chosen preset instantly while the upload finishes in the background
const optimisticPhoto = ref<string | null>(null)
const closeAvatarPicker = () => { showAvatarPicker.value = false }
const toggleAvatarPicker = () => {
  if (isUploading.value) return
  showAvatarPicker.value = !showAvatarPicker.value
}
// Aurora orb avatar (generated, no photo). Stored in customization_metadata so no
// schema change is needed. Selecting a real picture resets this back to 'photo'.
const orbCount = ORB_PALETTE_COUNT
const orbMeta = computed(
  () => (agentData.value.customization?.customization_metadata as Record<string, unknown> | undefined),
)
const useOrbAvatar = computed(() => orbMeta.value?.avatar_style === 'orb')
const useTerminalMark = computed(() => orbMeta.value?.avatar_style === 'terminal')
const currentOrbVariant = computed(() => orbMeta.value?.orb_variant)
const orbStyle = computed(() => resolveOrbStyle(agentData.value.name || '', currentOrbVariant.value))

const persistAvatarMeta = async (patch: Record<string, unknown>, photoUrl?: string) => {
  const cust = agentData.value.customization
  if (!cust) return
  const meta = { ...(cust.customization_metadata ?? {}), ...patch }
  const updated = await agentService.updateCustomization(agentData.value.id, {
    ...cust,
    ...(photoUrl !== undefined ? { photo_url: photoUrl } : {}),
    customization_metadata: meta,
  })
  agentData.value.customization = updated
  // Reflect the new avatar in the live Chat-Customization preview immediately.
  // The form's props-watch is guarded by isInternalUpdate, so it won't re-emit
  // `preview` for this external change — sync previewCustomization directly.
  previewCustomization.value = {
    ...previewCustomization.value,
    photo_url: updated.photo_url,
    photo_url_signed: (updated as AgentCustomization).photo_url_signed,
    customization_metadata: updated.customization_metadata,
  }
}

const selectOrbAvatar = async (variant: number) => {
  if (isUploading.value) return
  closeAvatarPicker()
  try {
    // Store the orb as an SVG data URI in photo_url so it propagates everywhere
    // (agent list, widget header, previews) via the normal avatar path.
    const orbUrl = orbSvgDataUri(agentData.value.name || '', variant)
    await persistAvatarMeta({ avatar_style: 'orb', orb_variant: variant }, orbUrl)
  } catch (error) {
    console.error('Failed to set orb avatar:', error)
    toast.error('Failed to update avatar')
  }
}

const selectTerminalMark = async () => {
  if (isUploading.value) return
  closeAvatarPicker()
  try {
    // Tint the ">" mark with the agent's accent (falls back to the Terminal lime).
    const accent = (agentData.value.customization?.accent_color as string | undefined) || undefined
    const markUrl = terminalMarkSvgDataUri(accent)
    await persistAvatarMeta({ avatar_style: 'terminal' }, markUrl)
  } catch (error) {
    console.error('Failed to set terminal mark avatar:', error)
    toast.error('Failed to update avatar')
  }
}

const selectPresetAvatar = async (url: string) => {
  if (isUploading.value) return
  closeAvatarPicker()
  optimisticPhoto.value = url
  try {
    await applyPresetAvatar(url)
    // A real picture was chosen — turn off the orb if it was on.
    if (useOrbAvatar.value) await persistAvatarMeta({ avatar_style: 'photo' })
  } finally {
    optimisticPhoto.value = null
  }
}
const chooseUploadAvatar = () => {
  if (isUploading.value) return
  closeAvatarPicker()
  triggerFileUpload()
}
onMounted(() => window.addEventListener('click', closeAvatarPicker))
onUnmounted(() => window.removeEventListener('click', closeAvatarPicker))

const activeTab = ref(props.agent.use_workflow ? 'workflow-builder' : 'agent') // Track the active tab: 'agent', 'integrations', etc.
const isEditingHeader = ref(false)
const editDisplayName = ref(agentData.value.display_name || agentData.value.name)
const editIsActive = ref(agentData.value.is_active)
const previewCustomization = ref<AgentCustomization>({
    id: agentData.value.customization?.id ?? 0,
    agent_id: agentData.value.id,
    chat_background_color: agentData.value.customization?.chat_background_color ?? '#F8F9FA',
    chat_text_color: agentData.value.customization?.chat_text_color ?? '#212529',
    chat_bubble_color: agentData.value.customization?.chat_bubble_color ?? '#E9ECEF',
    accent_color: agentData.value.customization?.accent_color ?? '#C9F24E',
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
        width: '480px'
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
  applyPresetAvatar,
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
    // Optimistic preview while an upload is in flight
    if (optimisticPhoto.value) {
        return optimisticPhoto.value
    }

    if (!agentData.value.customization?.photo_url) {
        return getAvatarUrl(agentData.value.agent_type.toLowerCase())
    }

    // Absolute S3/CDN URL — use it directly
    if (isAbsoluteUrl(agentData.value.customization.photo_url)) {
        return agentData.value.customization.photo_url
    }
    
    // For local storage, prepend the API URL
    return import.meta.env.VITE_API_URL + agentData.value.customization.photo_url
})

const handleClose = () => {
    handleCloseAgent(cleanup)
}

const copyWidgetCode = () => {
    copyWidgetCodeFn(widgetUrl.value, agentData.value.require_token_auth)
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

const copyBackendCode = () => {
    if (!widget.value?.id) return
    const backendCode = `// Your backend endpoint (e.g., /api/chat-token)
const response = await fetch('${widgetUrl.value}/api/v1/generate-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'  // From Widget Apps
  },
  body: JSON.stringify({
    widget_id: '${widget.value.id}',
    customer_email: 'user@example.com',  // Optional
    ttl_seconds: 3600  // Token validity (1 hour)
  })
});

const { data } = await response.json();
// Return data.token to your frontend`
    navigator.clipboard.writeText(backendCode).then(() => {
        console.log('Backend code copied to clipboard')
    }).catch(err => {
        console.error('Failed to copy backend code: ', err)
    })
}

// Dialog state for knowledge tips
const showTips = ref(false)

// Dialog state for upgrade modal
const showUpgradeModal = ref(false)
const upgradeModalType = ref<'workflow' | 'mcp' | 'advanced' | 'lead-capture'>('workflow')

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

// Check if lead capture feature is available in current plan (Pro+ only)
const hasLeadCaptureFeature = computed(() => {
    return subscriptionStorage.hasFeature('lead_capture')
})

// Determine if lead capture is locked. Lead Capture is a Pro-plan feature — the
// 'lead_capture' flag is true only for Pro/Enterprise (not Free/Base), matching the
// backend gate (check_feature_availability). OSS deployments are never locked.
const isLeadCaptureLocked = computed(() => {
    if (!hasEnterpriseModule) {
        return false
    }
    return !hasLeadCaptureFeature.value || !isSubscriptionActive.value
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
        case 'lead-capture':
            return 'Unlock Lead Capture'
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
        case 'lead-capture':
            return 'Lead Capture lets your agent collect and qualify contact details from visitors — with triggers, qualifying questions, and custom fields — then routes qualified leads to your team.'
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
        // The AgentAdvancedTab component already saves the setting via API
        // This handler updates the local agentData to ensure reactivity across all tabs
        
        // Update the agent data to trigger reactivity
        Object.assign(agentData.value, updatedAgent)
        
        // Update storage to keep data in sync
        agentStorage.updateAgent(updatedAgent)
    } catch (error) {
        console.error('Error handling advanced settings update:', error)
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
            ask_for_rating: data.askForRating,
            handoff_collect_email: data.handoffCollectEmail,
            handoff_collect_name: data.handoffCollectName
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
                    <div class="agent-avatar" :class="{ uploading: isUploading }" @click.stop="toggleAvatarPicker">
                        <input type="file" ref="fileInput" accept="image/jpeg,image/png,image/webp" class="hidden"
                            @change="handleFileUpload">
                        <div class="agent-avatar-ring">
                            <div v-if="useOrbAvatar && !optimisticPhoto" class="agent-orb-avatar" :class="{ 'opacity-50': isUploading }" :style="orbStyle"></div>
                            <img v-else :src="photoUrl" :alt="agentData.name" :class="{ 'opacity-50': isUploading }">
                            <div class="upload-overlay" v-if="!isUploading">
                                <span>Change</span>
                            </div>
                            <div class="upload-overlay" v-else>
                                <span>...</span>
                            </div>
                        </div>
                        <span class="avatar-edit-badge" aria-hidden="true">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16z"></path></svg>
                        </span>

                        <!-- Preset avatar picker -->
                        <div v-if="showAvatarPicker" class="avatar-picker" @click.stop>
                            <div class="avatar-picker-title">Choose a picture</div>
                            <div class="avatar-picker-grid">
                                <button
                                    v-for="(url, i) in presetAvatars"
                                    :key="i"
                                    type="button"
                                    class="avatar-pick"
                                    :disabled="isUploading"
                                    @click="selectPresetAvatar(url)"
                                    :aria-label="`Avatar ${i + 1}`"
                                >
                                    <img :src="url" alt="">
                                </button>
                                <button
                                    v-for="n in orbCount"
                                    :key="`orb-${n}`"
                                    type="button"
                                    class="avatar-pick avatar-pick-orb"
                                    :class="{ active: useOrbAvatar && (currentOrbVariant ?? -1) === n - 1 }"
                                    :disabled="isUploading"
                                    @click="selectOrbAvatar(n - 1)"
                                    :aria-label="`Orb ${n}`"
                                    :title="`Orb ${n}`"
                                >
                                    <span class="avatar-orb-thumb" :style="getOrbStyleAt(n - 1)"></span>
                                </button>
                                <button
                                    type="button"
                                    class="avatar-pick avatar-pick-orb"
                                    :class="{ active: useTerminalMark }"
                                    :disabled="isUploading"
                                    @click="selectTerminalMark"
                                    aria-label="Terminal mark"
                                    title="Terminal >"
                                >
                                    <span class="avatar-terminal-thumb">&gt;</span>
                                </button>
                            </div>
                            <button type="button" class="avatar-picker-upload" :disabled="isUploading" @click="chooseUploadAvatar">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                Upload your own
                            </button>
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
                                <span class="status-text" :class="{ online: (isEditingHeader ? editIsActive : agentData.is_active) }">{{ (isEditingHeader ? editIsActive : agentData.is_active) ? 'Online' : 'Offline' }}</span>
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
                            :class="{ 'active': activeTab === 'lead-capture', 'locked': isLeadCaptureLocked }"
                            :disabled="isLeadCaptureLocked"
                            @click="isLeadCaptureLocked ? (upgradeModalType = 'lead-capture', showUpgradeModal = true) : switchTab('lead-capture')"
                            :title="isLeadCaptureLocked ? 'Upgrade your plan to unlock Lead Capture' : 'Lead Capture'"
                        >
                            Lead Capture
                            <font-awesome-icon v-if="hasEnterpriseModule && isLeadCaptureLocked" icon="fa-solid fa-lock" class="lock-icon-small" />
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
                                :handoff-collect-email="agentData.handoff_collect_email"
                                :handoff-collect-name="agentData.handoff_collect_name"
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
                                    <!-- Token auth required notice -->
                                    <div v-if="agentData.require_token_auth" class="preview-unavailable">
                                        <div class="preview-unavailable-icon">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z"
                                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </div>
                                        <h4 class="preview-unavailable-title">Preview Unavailable</h4>
                                        <p class="preview-unavailable-description">
                                            This agent requires Widget App authentication. The preview cannot be shown because token authentication is enabled.
                                        </p>
                                        <p class="preview-unavailable-hint">
                                            To test this agent, use the external widget with a valid API key from a Widget App, or temporarily disable "Require Token Authentication" in the Settings tab.
                                        </p>
                                    </div>
                                    <!-- Normal preview iframe -->
                                    <iframe
                                        v-else-if="widget?.id"
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
                                <KnowledgeExplorer
                                    mode="agent"
                                    variant="section"
                                    title="Knowledge sources"
                                    description="Every page this agent learns from. Review the extracted content and choose what grounds its answers."
                                    :agent-id="agentData.id"
                                    :organization-id="agentData.organization_id"
                                >
                                    <template #actions>
                                        <router-link to="/knowledge" class="kb-open-link">
                                            Open knowledge base
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path></svg>
                                        </router-link>
                                    </template>
                                </KnowledgeExplorer>
                            </div>
                        </div>

                        <!-- Integrations Tab -->
                        <div v-if="activeTab === 'integrations'" class="tab-content">
                            <AgentIntegrationsTab
                                :agent-id="agentData.id"
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

                        <!-- Lead Capture Tab -->
                        <div v-if="activeTab === 'lead-capture'" class="tab-content">
                            <AgentLeadCaptureTab
                                :agent-id="agentData.id"
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
                                :agent="agentData"
                                @copy-widget-code="copyWidgetCode"
                                @copy-iframe-code="copyIframeCode"
                                @copy-backend-code="copyBackendCode"
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
                    }" :stencil-component="CircleStencil" image-restriction="stencil" background="var(--o05)" />
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
    background: var(--bg);
    overflow-x: hidden;
    max-width: 100vw;
    box-sizing: border-box;
}

.detail-panel {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--o08);
    border-radius: var(--radius-card);
    overflow: visible;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 2 * var(--space-sm));
    max-width: 100%;
}

.panel-header {
    padding: 26px 32px var(--space-md);
    background: transparent;
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
    background: var(--o05);
    border: 1px solid var(--o12);
    border-radius: var(--radius-btn);
    cursor: pointer;
    transition: all var(--transition-fast);
    color: var(--text3);
    flex-shrink: 0;
}

.back-button:hover {
    background: var(--o10);
    color: var(--text);
    transform: translateX(-2px);
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
    width: 64px;
    height: 64px;
    flex-shrink: 0;
}

/* Preset avatar picker popover */
.avatar-picker {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    z-index: 40;
    width: 296px;
    padding: 14px;
    background: var(--surface);
    border: 1px solid var(--o12);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    cursor: default;
}

.avatar-picker-title {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text3);
    margin-bottom: 10px;
}

.avatar-picker-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-bottom: 12px;
}

.avatar-pick {
    width: 100%;
    aspect-ratio: 1;
    padding: 0;
    border-radius: 50%;
    overflow: hidden;
    background: var(--o05);
    border: 2px solid var(--o12);
    cursor: pointer;
    transition: var(--transition-fast);
}

.avatar-pick img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.avatar-pick:hover:not(:disabled) {
    border-color: var(--o25);
}

.avatar-pick:disabled,
.avatar-picker-upload:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.agent-avatar.uploading {
    cursor: progress;
}

.avatar-pick.selected {
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 2px var(--accent-bg-12);
}

/* Aurora orb tile in the picker grid */
.avatar-pick-orb {
    background: transparent;
}
.avatar-orb-thumb {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
}
/* Terminal ">" prompt mark tile in the picker grid */
.avatar-terminal-thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #0b0c10;
    box-shadow: inset 0 0 0 2px rgba(201, 242, 78, 0.55);
    color: #c9f24e;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-weight: 700;
    font-size: 1.05rem;
    line-height: 1;
}
.avatar-pick-orb.active {
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 2px var(--accent-bg-12);
}

.avatar-picker-upload {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 9px;
    background: var(--o05);
    border: 1px solid var(--o14);
    border-radius: var(--radius-input);
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-fast);
}

.avatar-picker-upload:hover {
    background: var(--o10);
}

/* Ring around the avatar */
.agent-avatar-ring {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    padding: 3px;
    background: var(--o04);
    border: 1px solid var(--o12);
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    transition: border-color 0.2s ease;
}

.agent-avatar:hover .agent-avatar-ring {
    border-color: var(--o20);
}

.hidden {
    display: none;
}

.upload-overlay {
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--toggle-knob);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 50%;
    font-size: 0.7rem;
    font-weight: 500;
    text-align: center;
}

.agent-avatar:hover .upload-overlay {
    opacity: 1;
}

.agent-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

/* Generated aurora orb shown in place of the avatar image */
.agent-orb-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

/* Lime pencil edit badge */
.avatar-edit-badge {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--o20);
    color: var(--accent-ink);
    display: flex;
    align-items: center;
    justify-content: center;
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
    font-family: var(--font-display);
    font-size: 1.625rem;
    font-weight: 700;
    letter-spacing: var(--tracking-display);
    color: var(--text);
    margin: 0;
    line-height: 1.2;
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
    border: 1px solid var(--o12);
    border-radius: var(--radius-input);
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: var(--tracking-display);
    background: var(--o05);
    color: var(--text);
    min-width: 0;
}

.name-input:focus {
    outline: none;
    border-color: var(--accent-ink);
    box-shadow: var(--ring-focus);
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
    color: var(--toggle-knob);
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
    color: var(--toggle-knob);
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
    width: 46px;
    height: 26px;
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
    background-color: var(--toggle-track-off);
    transition: .25s;
    border-radius: var(--radius-pill);
}

.status-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: var(--toggle-knob);
    transition: .25s;
    border-radius: 50%;
}

.status-switch input:checked + .status-slider {
    background-color: var(--toggle-on-teal);
}

.status-switch input:checked + .status-slider:before {
    transform: translateX(20px);
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
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
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
    background: var(--error-color);
    position: relative;
    animation: pulse-offline 2s infinite;
}

.status-indicator.online {
    background: var(--success-color);
    animation: pulse-online 2s infinite;
}

.status-text {
    font-weight: 500;
    font-size: 14px;
    color: var(--muted2);
}

.status-text.online {
    color: var(--c-online);
}

/* Mode Selection Styles — standalone solid pills */
.mode-selection {
    margin-top: 0;
}

.mode-toggle {
    display: inline-flex;
    gap: 6px;
}

.mode-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: var(--pill-idle-bg);
    border: none;
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast), filter var(--transition-fast);
    font-size: 13px;
    font-weight: var(--font-weight-semibold);
    color: var(--pill-idle-fg);
    white-space: nowrap;
    position: relative;
}

.mode-button:hover:not(.active):not(.locked) {
    filter: brightness(1.2);
    color: var(--text3);
}

/* AI Mode active — solid blue */
.mode-button:first-child.active {
    background: var(--mode-ai-bg);
    color: var(--mode-ai-fg);
}

/* Workflow active — solid purple */
.mode-button:last-child.active {
    background: var(--mode-wf-bg);
    color: var(--mode-wf-fg);
}

.mode-icon {
    width: 14px;
    height: 14px;
    stroke-width: 2;
    flex-shrink: 0;
}

.mode-label {
    font-size: 13px;
    font-weight: var(--font-weight-semibold);
}

.mode-button.locked {
    opacity: 0.6;
    cursor: not-allowed;
    position: relative;
}

.mode-button.locked:hover {
    filter: none;
}

.lock-icon {
    font-size: 10px;
    margin-left: var(--space-xs);
    opacity: 0.7;
    color: var(--warning-color);
}

@keyframes pulse-online {
    0% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--success-color) 70%, transparent);
    }
    70% {
        box-shadow: 0 0 0 10px color-mix(in srgb, var(--success-color) 0%, transparent);
    }
    100% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--success-color) 0%, transparent);
    }
}

@keyframes pulse-offline {
    0% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--error-color) 70%, transparent);
    }
    70% {
        box-shadow: 0 0 0 10px color-mix(in srgb, var(--error-color) 0%, transparent);
    }
    100% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--error-color) 0%, transparent);
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
    background: var(--bg);
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
    background: var(--bg2);
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
    background: var(--accent-solid);
    color: var(--on-accent-solid);
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
    background: var(--o05);
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
    background-color: var(--toggle-track-off);
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
    background-color: var(--toggle-knob);
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: var(--success-color);
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
    max-width: 384px;
    height: 560px;
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
    /* Keep the description + preview grouped and centered instead of spread
       across ultrawide screens. */
    max-width: 1040px;
    margin: 0 auto;
    justify-content: center;
}

.preview-header {
    flex: 0 1 460px;
    max-width: 460px;
    overflow-y: auto;
}

.preview-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--space-sm);
}

.preview-wrapper {
    /* Width comes from the inline previewWrapperStyles (400px / 500px); don't
       let flex-grow stretch it. */
    flex: 0 0 auto;
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

/* Preview unavailable state (when token auth is required) */
.preview-unavailable {
    text-align: center;
    padding: var(--space-xl);
    background: var(--background-soft);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
}

.preview-unavailable-icon {
    width: 80px;
    height: 80px;
    background: color-mix(in srgb, var(--warning-color) 10%, transparent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--warning-color);
}

.preview-unavailable-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
}

.preview-unavailable-description {
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
    font-size: var(--text-sm);
}

.preview-unavailable-hint {
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
    font-size: var(--text-xs);
    padding: var(--space-sm) var(--space-md);
    background: var(--background-mute);
    border-radius: var(--radius-md);
    max-width: 350px;
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
    background-color: var(--accent-solid);
    color: var(--on-accent-solid);
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
    background: linear-gradient(135deg, var(--accent-solid), var(--accent-solid));
    color: var(--on-accent-solid);
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
    background: transparent;
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
    background: transparent;
    /* No horizontal padding: each tab's own root padding (24px) sets the inset
       so content aligns with the tab bar. */
    padding: var(--space-sm) 0 var(--space-lg);
    min-height: calc(100vh - 200px);
}

.tab-button {
    padding: 14px 18px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease;
    font-family: var(--font-sans);
    font-weight: var(--font-weight-medium);
    font-size: 14.5px;
    color: var(--muted);
    position: relative;
    text-align: center;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
}

.tabs-navigation {
    flex-shrink: 0;
}

.tabs-navigation.horizontal {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--o07);
    padding: 0 32px;
    margin: 0;
    overflow-x: auto;
    background: var(--bg2);
    scrollbar-width: none;
    -ms-overflow-style: none;
    align-items: flex-end;
}

.tabs-navigation.horizontal::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
}

.tab-button:hover {
    color: var(--text2);
    background: transparent;
}

.tab-button.active {
    color: var(--accent-ink);
    font-weight: var(--font-weight-semibold);
    background: transparent;
    border-bottom-color: var(--accent-ink);
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

.kb-open-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 47px;
  padding: 0 18px;
  border-radius: 11px;
  background: var(--o05);
  border: 1px solid var(--o12);
  color: var(--text2);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.kb-open-link:hover {
  background: var(--o08);
}

.section-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: var(--space-lg);
    line-height: 1.3;
}

.section-description {
    color: var(--muted);
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
    background: var(--bg);
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
    background: var(--accent-solid);
    color: var(--on-accent-solid);
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
}

.customization-tab-layout {
    display: flex;
    align-items: flex-start;
    gap: var(--space-xl);
    padding: var(--space-lg);
    /* Group the options + preview and center them rather than letting the
       preview column stretch across ultrawide screens. */
    max-width: 1040px;
    margin: 0 auto;
    justify-content: center;
}

.customization-panel {
    flex: 0 0 460px;
    max-width: 480px;
    /* Match the chat preview window height (.chat-container is 600px) */
    height: 600px;
    max-height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: var(--space-xs);
    scrollbar-width: thin;
    scrollbar-color: var(--o25) transparent;
}

.customization-panel::-webkit-scrollbar {
    width: 8px;
}

.customization-panel::-webkit-scrollbar-track {
    background: transparent;
}

.customization-panel::-webkit-scrollbar-thumb {
    background-color: var(--o25);
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.customization-panel::-webkit-scrollbar-thumb:hover {
    background-color: var(--o25);
}

.customization-preview {
    flex: 0 1 auto;
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

    .agent-avatar-ring {
        width: 64px;
        height: 64px;
    }

    .agent-info h3 {
        font-size: 1.5rem;
    }

    .tabs-navigation.horizontal {
        padding: 0 var(--space-lg);
        gap: 4px;
    }

    .tab-button {
        padding: 12px 16px;
        font-size: 14px;
    }

    .tab-content-container {
        padding: var(--space-sm) 0 var(--space-md);
    }
}

@media (max-width: 1440px) {
    .detail-panel {
    }

    .panel-header {
        padding: var(--space-lg) var(--space-lg) var(--space-sm);
    }

    .agent-info h3 {
        font-size: 1.375rem;
    }

    .status-and-mode {
        gap: var(--space-xs);
    }

    .status-text {
        font-size: 13px;
    }

    .tabs-navigation.horizontal {
        padding: 0 var(--space-lg);
        gap: 4px;
    }

    .tab-button {
        padding: 12px 14px;
        font-size: 13.5px;
    }

    .customization-tab-layout {
        padding: var(--space-sm);
        gap: var(--space-md);
    }
    
    .customization-panel {
        /* Keep matching the 600px chat preview, even on laptop widths */
        height: 600px;
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
    background: linear-gradient(135deg, var(--bg) 0%, var(--surface) 100%);
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
    background: linear-gradient(135deg, var(--accent-solid), var(--accent-solid));
    color: var(--on-accent-solid);
}

.upgrade-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto var(--space-md);
    background: color-mix(in srgb, var(--on-accent-solid) 20%, transparent);
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
    color: var(--on-accent-solid);
}

.upgrade-modal-header .close-button {
    position: absolute;
    top: var(--space-md);
    right: var(--space-md);
    background: color-mix(in srgb, var(--on-accent-solid) 20%, transparent);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: var(--on-accent-solid);
    cursor: pointer;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.upgrade-modal-header .close-button:hover {
    background: color-mix(in srgb, var(--on-accent-solid) 30%, transparent);
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
    background: linear-gradient(135deg, var(--accent-solid), var(--accent-solid));
    color: var(--on-accent-solid);
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