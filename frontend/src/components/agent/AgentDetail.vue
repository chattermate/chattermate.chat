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
import { ref, defineEmits, computed, onMounted } from 'vue'
import type { AgentWithCustomization, AgentCustomization } from '@/types/agent'
import { getAvatarUrl } from '@/utils/avatars'
import AgentEdit from './AgentEdit.vue'
import KnowledgeGrid from './KnowledgeGrid.vue'
import AgentCustomizationView from './AgentCustomizationView.vue'
import AgentChatPreviewPanel from './AgentChatPreviewPanel.vue'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useAgentChat } from '@/composables/useAgentChat'
import 'floating-vue/dist/style.css'
import { vTooltip } from 'floating-vue'
import { useAgentDetail } from '@/composables/useAgentDetail'

// Register directive
const directives = {
  tooltip: vTooltip
}

const props = defineProps<{
    agent: AgentWithCustomization
}>()

const agentData = ref({ ...props.agent })
const isEditing = ref(false)
const isCustomizing = ref(false)
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
    customization_metadata: agentData.value.customization?.customization_metadata ?? {}
})

const baseUrl = computed(() => {
    return import.meta.env.VITE_API_URL
})

const widgetUrl = computed(() => {
    return import.meta.env.VITE_WIDGET_URL
})

const emit = defineEmits<{
    (e: 'close'): void
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
  toggleTransferToHuman,
  userGroups,
  selectedGroupIds,
  loadingGroups,
  fetchUserGroups,
  updateAgentGroups
} = useAgentDetail(agentData, emit)

const { cleanup } = useAgentChat(agentData.value.id)

const handlePreview = (customization: AgentCustomization) => {
    previewCustomization.value = customization
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

// Computed property to handle instructions as text
const instructionsText = computed({
    get: () => agentData.value.instructions.join('\n'),
    set: (value) => {
        if (isEditing.value) {
            agentData.value.instructions = value.split('\n').filter(line => line.trim())
        }
    }
})

const transferReasons = [
    "Knowledge gaps",
    "Need human contact",
    "Customer frustration",
    "High priority issues",
    "Compliance matters"
]

const tooltipContent = computed(() => {
    return `Auto-transfer when:\n${transferReasons.map(reason => `• ${reason}`).join('\n')}`
})

const iframeUrl = computed(() => {
    if (!widget.value?.id) return ''
    return `${baseUrl.value}/widgets/${widget.value.id}/data?widget_id=${widget.value.id}`
})

const previewContainerStyles = computed(() => ({
    style: {
        width: '400px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        background: 'transparent',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        marginLeft: 'auto',
        position: 'relative',
        marginTop: '50px',
    }
}))

onMounted(() => {
    initializeWidget()
    fetchUserGroups()
})

</script>

<template>
    <div class="agent-detail">
        <!-- Left Panel -->
        <div class="detail-panel">
            <div class="panel-header">
                <button class="back-button" @click="handleClose" aria-label="Back to agents">
                    <img src="@/assets/arrow-left.svg" alt="Back" class="back-icon" />
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
                            <h3>{{ agentData.display_name || agentData.name }}</h3>
                            <div class="action-buttons" v-if="!isEditing && !isCustomizing">
                                <button class="edit-button" @click="isEditing = true">
                                    Edit
                                </button>
                                <button class="customize-button" @click="isCustomizing = true">
                                    Customize
                                </button>
                            </div>
                        </div>
                        <div class="status">
                            <div class="status-indicator" :class="{ 'online': agentData.is_active }"></div>
                            <span class="status-text">{{ agentData.is_active ? 'Online' : 'Offline' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel-content" v-if="!isEditing && !isCustomizing">
                <section class="detail-section">
                    <div class="transfer-section">
                        <!-- Transfer toggle -->
                        <div class="transfer-toggle">
                            <div class="toggle-header">
                                <h4>Transfer to Human</h4>
                                <label class="switch" v-tooltip="tooltipContent">
                                    <input type="checkbox" 
                                        :checked="agentData.transfer_to_human"
                                        @change="toggleTransferToHuman"
                                    >
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p class="helper-text">Enable automatic transfer to human agents when needed</p>
                        </div>

                        <!-- Group selection -->
                        <div v-if="agentData.transfer_to_human" class="transfer-groups">
                            <h4>Transfer Groups</h4>
                            <p v-if="userGroups.length" class="helper-text">Select groups that can handle transferred chats</p>
                            
                            <div v-if="!loadingGroups">
                                <div v-if="userGroups.length" class="groups-list">
                                    <label v-for="group in userGroups" :key="group.id" class="group-item">
                                        <input 
                                            type="checkbox" 
                                            :value="group.id"
                                            v-model="selectedGroupIds"
                                            @change="updateAgentGroups(selectedGroupIds)"
                                        >
                                        <span>{{ group.name }}</span>
                                    </label>
                                </div>
                                <div v-else class="no-groups-message">
                                    <p>No groups available.</p>
                                    <router-link to="/human-agents" class="create-group-link">
                                        Create Group <i class="fas fa-arrow-right"></i>
                                    </router-link>
                                </div>
                            </div>
                            
                            <div v-else class="loading-groups">
                                Loading groups...
                            </div>
                        </div>
                    </div>
                </section>

                <section class="detail-section">
                    <h4>Instructions</h4>
                    <textarea 
                        class="instructions-textarea" 
                        v-model="instructionsText" 
                        rows="6" 
                        placeholder="Enter instructions for the agent..."
                        :readonly="!isEditing"
                    ></textarea>
                </section>

                <section class="detail-section">
                    <h4>Widget Integration</h4>
                    <div class="widget-info">
                        <div v-if="widgetLoading" class="loading-indicator">
                            Loading widget info...
                        </div>
                        <div v-else-if="widget" class="widget-code">
                            <div class="code-container">
                                <code>&lt;script&gt;window.chattermateId='{{ widget.id }}';&lt;/script&gt;&lt;script src="{{ widgetUrl }}/webclient/chattermate.min.js"&gt;&lt;/script&gt;</code>
                                <button class="copy-button" @click="copyWidgetCode" title="Copy to clipboard">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path
                                            d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Edit Mode -->
            <AgentEdit v-else-if="isEditing" :agent="agentData"
                @save="(updated: AgentWithCustomization) => { agentData = updated; isEditing = false }"
                @cancel="isEditing = false" />

            <!-- Customization Mode -->
            <AgentCustomizationView v-else-if="isCustomizing" :agent="agentData" @preview="handlePreview" @save="(updated: AgentWithCustomization) => {
                agentData = updated
                isCustomizing = false
                previewCustomization = updated.customization ?? previewCustomization
            }" @cancel="isCustomizing = false" />

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

        <!-- Right Panel - Chat Window -->
        <div v-if="!isEditing && !isCustomizing" :style="previewContainerStyles">
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
        <!-- use for customization preview-->
        <AgentChatPreviewPanel 
            v-else
            :is-active="agentData.is_active"
            :customization="isCustomizing ? previewCustomization : (agentData.customization ?? previewCustomization)"
            :agent-type="agentData.agent_type" 
            :agent-name="agentData.display_name || agentData.name"
            :agent-id="agentData.id" 
        />

        <!-- Knowledge Grid -->
        <KnowledgeGrid :agent-id="agentData.id" :organization-id="agentData.organization_id" />
    </div>
</template>

<style scoped>
.agent-detail {
    display: grid;
    grid-template-columns: 450px 1fr;
    grid-template-rows: auto auto;
    gap: var(--space-lg);
    height: 100%;
}

.detail-panel {
    border-right: 1px solid var(--border-color);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
}

.panel-header {
    margin-bottom: var(--space-xl);
}

.back-button {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    background: transparent;
    border: none;
    cursor: pointer;
    margin-bottom: var(--space-md);
}

.agent-header {
    display: flex;
    gap: var(--space-md);
    align-items: center;
}

.agent-avatar {
    position: relative;
    cursor: pointer;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: 50%;
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

.name-section {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.edit-button {
    padding: var(--space-xs) var(--space-sm);
    background: var(--primary-soft);
    color: var(--primary-color);
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
}

.customize-button {
    padding: var(--space-xs) var(--space-sm);
    background: var(--background-soft);
    color: var(--text-color);
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
}

.status {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin-top: var(--space-xs);
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--error-color, #ef4444);
}

.status-indicator.online {
    background: var(--success-color, #22c55e);
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

.action-buttons {
    display: flex;
    gap: var(--space-sm);
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
    width: 400px;
    height: 600px;
    border: none;
    background: none;
}

.loading-preview {
    color: var(--text-muted);
    text-align: center;
    padding: var(--space-xl);
    background: var(--background-alt);
    border-radius: var(--radius-lg);
    margin: var(--space-lg);
}
</style>