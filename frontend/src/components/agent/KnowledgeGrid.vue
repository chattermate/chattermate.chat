<!--
ChatterMate - Knowledge Grid
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
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useKnowledgeManagement } from '@/composables/useKnowledgeManagement'
import { knowledgeService } from '@/services/knowledge'
import DeleteIcon from '@/assets/delete.svg'
import EditIcon from '@/assets/edit.svg'
import mitt from '@/utils/emitter'

const props = defineProps<{
    agentId?: string
    organizationId?: string
}>()

const componentData = {
    DeleteIcon,
    EditIcon
}

const {
    knowledgeItems,
    currentPage,
    totalPages,
    isLoading,
    error,
    showKnowledgeModal,
    activeTab,
    files,
    urls,
    newUrl,
    isUploading,
    uploadProgress,
    successMessage,
    fileInput,
    fetchKnowledge,
    fetchQueueItems,
    deleteQueueItem,
    handlePageChange,
    formatDate,

    getFirstCreated,
    isValidUrl,
    triggerFileInput,
    handleFileSelect,
    handleFileUpload,
    handleUrlAdd,
    removeUrl,
    handleUrlUpload,
    showLinkModal,
    orgKnowledgeItems,
    orgCurrentPage,
    orgTotalPages,
    isLoadingOrg,
    handleOrgPageChange,
    linkKnowledge,
    unlinkKnowledge,
    showDeleteConfirm,
    confirmDelete,
    handleDelete,
    cancelDelete,
    urlFormError,
    uploadError,
    queueItems,
    isLoadingQueue,
    selectedKnowledge,
    knowledgeContent,
    isLoadingContent,
    isEditingContent,
    editedContent,
    isSavingContent,
    showContentModal,
    viewKnowledgeContent,
    enableContentEditing,
    cancelContentEditing,
    saveChunkContent,
    closeContentModal,
} = useKnowledgeManagement(props.agentId || '', props.organizationId || '')

// Handle knowledge update notifications
const handleKnowledgeUpdate = () => {
    fetchKnowledge()
    fetchQueueItems()
}

// Polling interval for queue updates
let queuePollingInterval: ReturnType<typeof setInterval> | null = null

const startQueuePolling = () => {
    // Only poll if there are pending or processing items
    const hasPendingItems = queueItems.value.some(
        item => item.status === 'pending' || item.status === 'processing'
    )

    if (!hasPendingItems && queuePollingInterval) {
        stopQueuePolling()
        return
    }

    if (hasPendingItems && !queuePollingInterval) {
        // Poll every 10 seconds
        queuePollingInterval = setInterval(() => {
            fetchQueueItems()
        }, 10000)
    }
}

const stopQueuePolling = () => {
    if (queuePollingInterval) {
        clearInterval(queuePollingInterval)
        queuePollingInterval = null
    }
}

// Watch for queue items changes to start/stop polling
watch(queueItems, () => {
    startQueuePolling()
}, { deep: true })

onMounted(() => {
    fetchKnowledge()
    // Subscribe to knowledge update events
    mitt.on('knowledge-updated', handleKnowledgeUpdate)
    // Start polling for queue updates
    startQueuePolling()
})

onUnmounted(() => {
    // Clean up event listener
    mitt.off('knowledge-updated', handleKnowledgeUpdate)
    // Stop polling
    stopQueuePolling()
})

const isKnowledgeLinked = (knowledgeId: number): boolean => {
    return knowledgeItems.value.some(item => item.id === knowledgeId)
}

const handleLink = async (knowledgeId: number) => {
    await linkKnowledge(knowledgeId)
}

const handleUnlink = async (knowledgeId: number) => {
    await unlinkKnowledge(knowledgeId)
}

// Subpage editing state
const editingSubpageId = ref<string | null>(null)
const editingSubpageContent = ref('')
const showEditSubpageModal = ref(false)

const editSubpage = (subpageId: string) => {
    const subpage = knowledgeContent.value?.chunks.find((c: any) => c.id === subpageId)
    if (subpage) {
        editingSubpageId.value = subpageId
        editingSubpageContent.value = subpage.content
        showEditSubpageModal.value = true
    }
}

const saveEditedSubpage = async () => {
    if (editingSubpageId.value) {
        await saveChunkContent(editingSubpageId.value, editingSubpageContent.value)
        showEditSubpageModal.value = false
        editingSubpageId.value = null
        editingSubpageContent.value = ''
    }
}

const cancelEditSubpage = () => {
    showEditSubpageModal.value = false
    editingSubpageId.value = null
    editingSubpageContent.value = ''
}

// Subpage deletion
const subpageToDelete = ref<string | null>(null)
const showDeleteSubpageConfirm = ref(false)

const confirmDeleteSubpage = (subpageId: string) => {
    subpageToDelete.value = subpageId
    showDeleteSubpageConfirm.value = true
}

const deleteSubpage = async () => {
    if (subpageToDelete.value && selectedKnowledge.value) {
        try {
            await knowledgeService.deleteChunk(selectedKnowledge.value, subpageToDelete.value)
            showDeleteSubpageConfirm.value = false
            subpageToDelete.value = null
            // Reload content
            await viewKnowledgeContent(selectedKnowledge.value)
        } catch (err) {
            console.error('Error deleting subpage:', err)
        }
    }
}

const cancelDeleteSubpage = () => {
    showDeleteSubpageConfirm.value = false
    subpageToDelete.value = null
}

// Add new subpage
const showAddSubpageModal = ref(false)
const newSubpageName = ref('')
const newSubpageContent = ref('')

const addNewSubpage = async () => {
    if (!selectedKnowledge.value || !newSubpageName.value.trim() || !newSubpageContent.value.trim()) {
        return
    }

    try {
        error.value = null // Clear any previous errors
        await knowledgeService.addSubpage(
            selectedKnowledge.value,
            newSubpageName.value.trim(),
            newSubpageContent.value.trim()
        )
        showAddSubpageModal.value = false
        newSubpageName.value = ''
        newSubpageContent.value = ''
        // Reload content
        await viewKnowledgeContent(selectedKnowledge.value)
    } catch (err: any) {
        console.error('Error adding subpage:', err)
        // Show error message to user
        const errorMessage = err.response?.data?.detail || 'Failed to add subpage'
        error.value = errorMessage
    }
}

const cancelAddSubpage = () => {
    showAddSubpageModal.value = false
    newSubpageName.value = ''
    newSubpageContent.value = ''
    error.value = null
}

// Add closeKnowledgeModal function
const closeKnowledgeModal = () => {
    showKnowledgeModal.value = false
    successMessage.value = ''
    urlFormError.value = null
}
</script>

<template>
    <div class="knowledge-grid-container">
        <div class="knowledge-header">
            <div class="header-left">
                <h3>Knowledge Sources</h3>
                <div class="header-actions">
                    <button class="action-button" @click="showKnowledgeModal = true">
                        + Add Knowledge
                    </button>
                    <button class="action-button" @click="showLinkModal = true">
                        Link Existing
                    </button>
                </div>
            </div>
            <div v-if="totalPages > 1" class="pagination">
                <button :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)"
                    class="pagination-button">
                    Previous
                </button>
                <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
                <button :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)"
                    class="pagination-button">
                    Next
                </button>
            </div>
        </div>

        <!-- Queue Status Section -->
        <div v-if="queueItems && queueItems.length > 0" class="queue-section">
            <h4 class="queue-header">Processing Queue</h4>
            <div class="queue-items">
                <div v-for="item in queueItems" :key="item.id" class="queue-item">
                    <div class="queue-item-content">
                        <div class="queue-item-header">
                            <div class="queue-info">
                                <span class="queue-source" :title="item.source">{{ item.source }}</span>
                                <span class="queue-meta">
                                    <span class="queue-type">{{ item.source_type }}</span>
                                    <span class="queue-time">• {{ formatDate(item.created_at) }}</span>
                                </span>
                            </div>
                            <div class="queue-status-container">
                                <span :class="['status-badge', item.status]">
                                    {{ item.status }}
                                </span>
                                <button v-if="item.status === 'failed' || item.status === 'pending'"
                                    class="delete-queue-btn" @click="deleteQueueItem(item.id)"
                                    title="Remove from queue">
                                    <img :src="DeleteIcon" alt="Delete" class="delete-icon-sm" />
                                </button>
                            </div>
                        </div>

                        <div v-if="item.status === 'processing' && item.progress_percentage"
                            class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: item.progress_percentage + '%' }"></div>
                            </div>
                            <span class="progress-text">{{ item.progress_percentage }}%</span>
                        </div>

                        <div v-if="item.error" class="queue-error">
                            <span class="error-icon">⚠️</span>
                            <span class="error-text">{{ item.error }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isLoading" class="loading-state">
            Loading knowledge sources...
        </div>

        <div v-else-if="error" class="error-state">
            {{ error }}
        </div>

        <div v-else class="knowledge-grid">
            <div class="knowledge-grid-header">
                <div class="header-cell">Source</div>
                <div class="header-cell">Type</div>
                <div class="header-cell">Subpages</div>
                <div class="header-cell">Created</div>
                <div class="header-cell actions-cell">Actions</div>
            </div>

            <div v-if="!knowledgeItems.length" class="knowledge-empty">
                <div class="warning-message">
                    <span class="warning-icon">⚠️</span>
                    No knowledge sources configured
                </div>
                <p class="warning-description">
                    Add knowledge sources to improve the agent's responses
                </p>
            </div>

            <template v-for="item in knowledgeItems" :key="item.id">
                <div class="knowledge-grid-row">
                    <div class="grid-cell source-cell" :title="item.name">{{ item.name }}</div>
                    <div class="grid-cell">{{ item.type }}</div>
                    <div class="grid-cell pages-cell">
                        <div class="pages-list">
                            <div v-for="page in item.pages.slice(0, 3)" :key="page.subpage" class="page-item">
                                <a v-if="isValidUrl(page.subpage)" :href="page.subpage" target="_blank"
                                    rel="noopener noreferrer" class="page-url page-link" :title="page.subpage">
                                    {{ page.subpage }}
                                </a>
                                <span v-else class="page-url" :title="page.subpage">
                                    {{ page.subpage }}
                                </span>
                            </div>
                            <div v-if="item.pages.length > 3" class="more-pages">
                                +{{ item.pages.length - 3 }} more
                            </div>
                        </div>
                    </div>
                    <div class="grid-cell">
                        {{ item.pages.length ? formatDate(getFirstCreated(item.pages)) : 'N/A' }}
                    </div>
                    <div class="grid-cell actions-cell">
                        <button class="view-button" @click="viewKnowledgeContent(item.id)" title="View content">
                            <img :src="EditIcon" alt="View" class="action-icon" />
                        </button>
                        <button class="delete-button" @click="confirmDelete(item.id)" title="Delete knowledge source">
                            <img :src="DeleteIcon" alt="Delete" class="action-icon" />
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <!-- Knowledge Upload Modal -->
        <div v-if="showKnowledgeModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Knowledge Source</h3>
                    <button class="close-button" @click="closeKnowledgeModal">×</button>
                </div>

                <div class="knowledge-tabs">
                    <button :class="{ active: activeTab === 'pdf' }" @click="activeTab = 'pdf'">
                        PDF Upload
                    </button>
                    <button :class="{ active: activeTab === 'url' }" @click="activeTab = 'url'">
                        URL Import
                    </button>
                </div>

                <div v-if="activeTab === 'pdf'" class="tab-content">
                    <input type="file" ref="fileInput" multiple accept=".pdf" class="hidden" @change="handleFileSelect">
                    <button class="select-files-button" @click="triggerFileInput">
                        Select PDF Files
                    </button>

                    <div v-if="uploadError" class="upload-error">
                        {{ uploadError }}
                    </div>

                    <div v-if="files.length" class="selected-files">
                        <div v-for="file in files" :key="file.name" class="file-item">
                            {{ file.name }}
                        </div>
                        <button class="upload-button" :disabled="isUploading" @click="handleFileUpload">
                            {{ isUploading ? 'Uploading...' : 'Upload Files' }}
                        </button>
                    </div>
                </div>

                <div v-if="activeTab === 'url'" class="tab-content">
                    <div class="url-input-group">
                        <input type="url" v-model="newUrl" placeholder="Enter URL" @keyup.enter="handleUrlAdd">
                        <button @click="handleUrlAdd">Add</button>
                    </div>

                    <div v-if="urlFormError" class="error-message">
                        {{ urlFormError }}
                    </div>

                    <div v-if="uploadError" class="upload-error">
                        {{ uploadError }}
                    </div>

                    <div v-if="urls.length" class="url-list">
                        <div v-for="(url, index) in urls" :key="index" class="url-item">
                            <span>{{ url }}</span>
                            <button class="remove-url-button" @click="removeUrl(index)" title="Remove URL">
                                <span class="remove-icon">×</span>
                            </button>
                        </div>
                        <button class="upload-button" :disabled="isUploading" @click="handleUrlUpload">
                            {{ isUploading ? 'Uploading...' : 'Upload URLs' }}
                        </button>
                    </div>
                </div>

                <div v-if="isUploading" class="upload-progress">
                    <div class="progress-bar">
                        <div class="progress" :style="{ width: `${uploadProgress}%` }"></div>
                    </div>
                </div>

                <div v-if="successMessage" class="success-message">
                    {{ successMessage }}
                </div>
            </div>
        </div>

        <!-- Link Knowledge Modal -->
        <div v-if="showLinkModal" class="modal-overlay">
            <div class="modal-content link-modal">
                <div class="modal-header">
                    <h3>Link Existing Knowledge</h3>
                    <button class="close-button" @click="showLinkModal = false">×</button>
                </div>

                <div v-if="isLoadingOrg" class="loading-state">
                    Loading knowledge sources...
                </div>

                <div v-else class="org-knowledge-grid">
                    <div class="knowledge-grid-header">
                        <div class="header-cell source-cell">Source</div>
                        <div class="header-cell type-cell">Type</div>
                        <div class="header-cell action-cell">Action</div>
                    </div>

                    <template v-for="item in orgKnowledgeItems" :key="item.id">
                        <div class="knowledge-grid-row">
                            <div class="grid-cell source-cell">{{ item.name }}</div>
                            <div class="grid-cell type-cell">{{ item.type }}</div>
                            <div class="grid-cell action-cell">
                                <button v-if="!isKnowledgeLinked(item.id)" class="link-button"
                                    @click="handleLink(item.id)">
                                    Link
                                </button>
                                <button v-else class="unlink-button" @click="handleUnlink(item.id)">
                                    Unlink
                                </button>
                            </div>
                        </div>
                    </template>

                    <div v-if="orgTotalPages > 1" class="pagination">
                        <button :disabled="orgCurrentPage === 1" @click="handleOrgPageChange(orgCurrentPage - 1)"
                            class="pagination-button">
                            Previous
                        </button>
                        <span class="page-info">
                            Page {{ orgCurrentPage }} of {{ orgTotalPages }}
                        </span>
                        <button :disabled="orgCurrentPage === orgTotalPages"
                            @click="handleOrgPageChange(orgCurrentPage + 1)" class="pagination-button">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add confirmation modal -->
        <div v-if="showDeleteConfirm" class="modal-overlay">
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h3>Confirm Delete</h3>
                    <button class="close-button" @click="cancelDelete">×</button>
                </div>
                <div class="confirm-content">
                    <p>Are you sure you want to delete this knowledge source? This action cannot be undone.</p>
                    <div class="confirm-actions">
                        <button class="cancel-button" @click="cancelDelete">Cancel</button>
                        <button class="delete-button" @click="handleDelete">Delete</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Viewing/Editing Modal -->
        <div v-if="showContentModal" class="modal-overlay">
            <div class="modal-content content-modal">
                <div class="modal-header">
                    <h3>Knowledge Content</h3>
                    <button class="close-button" @click="closeContentModal">×</button>
                </div>

                <div v-if="isLoadingContent" class="loading-state">
                    Loading content...
                </div>

                <div v-else-if="knowledgeContent" class="content-body">
                    <div class="content-header">
                        <div class="content-info">
                            <span class="content-source">{{ knowledgeContent.source }}</span>
                            <span class="content-type">{{ knowledgeContent.source_type }}</span>
                            <span class="content-subpages-count">{{ knowledgeContent.chunks.length }} subpages</span>
                        </div>
                        <button class="add-subpage-btn" @click="showAddSubpageModal = true" title="Add new subpage">
                            + Add Subpage
                        </button>
                    </div>

                    <div class="content-table-container">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th class="col-url">Subpage Name</th>
                                    <th class="col-content">Content</th>
                                    <th class="col-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(subpage, index) in knowledgeContent.chunks" :key="subpage.id"
                                    class="subpage-row" :data-subpage-id="subpage.id">
                                    <td class="cell-url">
                                        <a v-if="subpage.metadata && subpage.metadata.url" :href="subpage.metadata.url"
                                            target="_blank" rel="noopener noreferrer" class="subpage-url"
                                            :title="subpage.metadata.url">
                                            {{ subpage.metadata.url }}
                                        </a>
                                        <span v-else class="subpage-id">
                                            {{ subpage.id }}
                                        </span>
                                    </td>
                                    <td class="cell-content">
                                        <div class="subpage-content-wrapper">
                                            <p class="subpage-text">{{ subpage.content }}</p>
                                        </div>
                                    </td>
                                    <td class="cell-actions">
                                        <div class="actions-buttons">
                                            <button class="edit-subpage-btn" @click="() => editSubpage(subpage.id)"
                                                title="Edit this subpage">
                                                <img :src="EditIcon" alt="Edit" class="action-icon-sm" />
                                            </button>
                                            <button class="delete-subpage-btn"
                                                @click="() => confirmDeleteSubpage(subpage.id)"
                                                title="Delete this subpage">
                                                <img :src="DeleteIcon" alt="Delete" class="action-icon-sm" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subpage Edit Modal -->
        <div v-if="showEditSubpageModal" class="modal-overlay">
            <div class="modal-content subpage-edit-modal">
                <div class="modal-header">
                    <h3>Edit Subpage Content</h3>
                    <button class="close-button" @click="cancelEditSubpage">×</button>
                </div>

                <div class="modal-body">
                    <textarea v-model="editingSubpageContent" class="subpage-edit-textarea"
                        placeholder="Edit subpage content..."></textarea>
                </div>

                <div class="modal-footer">
                    <button class="cancel-button" @click="cancelEditSubpage">Cancel</button>
                    <button class="save-button" @click="saveEditedSubpage" :disabled="isSavingContent">
                        {{ isSavingContent ? 'Saving...' : 'Save' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Subpage Delete Confirmation Modal -->
        <div v-if="showDeleteSubpageConfirm" class="modal-overlay">
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h3>Confirm Delete</h3>
                    <button class="close-button" @click="cancelDeleteSubpage">×</button>
                </div>

                <div class="modal-body">
                    <p>Are you sure you want to delete this subpage? This action cannot be undone.</p>
                </div>

                <div class="modal-footer">
                    <button class="cancel-button" @click="cancelDeleteSubpage">Cancel</button>
                    <button class="delete-button" @click="deleteSubpage">Delete</button>
                </div>
            </div>
        </div>

        <!-- Add Subpage Modal -->
        <div v-if="showAddSubpageModal" class="modal-overlay">
            <div class="modal-content subpage-edit-modal">
                <div class="modal-header">
                    <h3>Add New Subpage</h3>
                    <button class="close-button" @click="cancelAddSubpage">×</button>
                </div>

                <div class="modal-body">
                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>
                    <div class="form-group">
                        <label for="subpage-name">Subpage Name (must be unique)</label>
                        <input id="subpage-name" v-model="newSubpageName" type="text" class="subpage-name-input"
                            placeholder="Enter unique subpage name..." />
                    </div>
                    <div class="form-group">
                        <label for="subpage-content">Content</label>
                        <textarea id="subpage-content" v-model="newSubpageContent" class="subpage-edit-textarea"
                            placeholder="Enter subpage content..."></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="cancel-button" @click="cancelAddSubpage">Cancel</button>
                    <button class="save-button" @click="addNewSubpage"
                        :disabled="!newSubpageName.trim() || !newSubpageContent.trim()">
                        Add Subpage
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.knowledge-grid-container {
    grid-column: 1 / -1;
    padding: var(--space-md);
    background: var(--background);
    border-top: 1px solid var(--border-color);
}

.knowledge-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.header-actions {
    display: flex;
    gap: var(--space-sm);
}

.action-button {
    padding: var(--space-xs) var(--space-sm);
    background: var(--primary-soft);
    color: var(--primary-color);
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
}

.knowledge-grid {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    width: 100%;
}

.knowledge-grid-header {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr 1fr 80px;
    background: var(--background-soft);
    border-bottom: 1px solid var(--border-color);
}

.header-cell {
    padding: var(--space-sm) var(--space-md);
    font-weight: 500;
    color: var(--text-muted);
}

.knowledge-grid-row {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr 1fr 80px;
    border-bottom: 1px solid var(--border-color);
}

.grid-cell {
    padding: var(--space-sm) var(--space-md);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pages-cell {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
}

.page-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: var(--space-xs) var(--space-sm);
    background: var(--background-soft);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
}

.page-url {
    color: var(--text-muted);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.page-link {
    color: var(--primary-color);
    cursor: pointer;
}

.page-link:hover {
    text-decoration: underline;
}

.pagination {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.pagination-button {
    padding: var(--space-xs) var(--space-sm);
    background: var(--background-soft);
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
}

.pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    color: var(--text-muted);
}

.loading-state {
    padding: var(--space-xl);
    text-align: center;
    color: var(--text-muted);
    background: var(--background-soft);
    border-radius: var(--radius-lg);
}

.error-state {
    padding: var(--space-xl);
    text-align: center;
    color: var(--error-color);
    background: var(--background-soft);
    border-radius: var(--radius-lg);
}

.knowledge-empty {
    padding: var(--space-xl);
    text-align: center;
}

.warning-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    color: var(--warning-color);
    margin-bottom: var(--space-sm);
}

.warning-description {
    color: var(--text-muted);
}

/* Modal styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    width: 85%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border-color);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
}

.close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
}

.knowledge-tabs {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
}

.knowledge-tabs button {
    flex: 1;
    padding: var(--space-sm);
    border: none;
    background: var(--background-soft);
    border-radius: var(--radius-lg);
    cursor: pointer;
}

.knowledge-tabs button.active {
    background: var(--primary-color);
    color: white;
}

.tab-content {
    margin-bottom: var(--space-lg);
}

.hidden {
    display: none;
}

.select-files-button,
.upload-button {
    width: 100%;
    padding: var(--space-sm);
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    margin-bottom: var(--space-md);
}

.select-files-button:disabled,
.upload-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.file-item,
.url-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    background: var(--background-soft);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-xs);
    gap: var(--space-sm);
}

.url-item span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.url-input-group {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
}

.url-input-group input {
    flex: 1;
    padding: var(--space-sm);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
}

.url-input-group button {
    padding: var(--space-sm) var(--space-md);
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
}

.upload-progress {
    margin-top: var(--space-md);
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: var(--background-soft);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.progress {
    height: 100%;
    background: var(--primary-color);
    transition: width 0.3s ease;
}

.success-message {
    margin-top: var(--space-md);
    padding: var(--space-sm);
    background: var(--success-color-soft);
    color: var(--success-color);
    border-radius: var(--radius-lg);
    text-align: center;
}

.link-modal {
    max-width: 600px;
    width: 80%;
}

.org-knowledge-grid {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-top: var(--space-md);
    width: 100%;
}

.org-knowledge-grid .knowledge-grid-header,
.org-knowledge-grid .knowledge-grid-row {
    display: grid;
    grid-template-columns: 3fr 1fr 120px;
    align-items: center;
}

.source-cell {
    padding-left: var(--space-md);
}

.type-cell {
    text-align: center;
}

.action-cell {
    padding-right: var(--space-md);
    text-align: right;
}

.link-button,
.unlink-button {
    min-width: 80px;
    padding: var(--space-xs) var(--space-sm);
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    text-align: center;
}

.link-button {
    background: var(--primary-color);
    color: white;
}

.unlink-button {
    background: var(--error-color);
    color: white;
}

.link-button:hover {
    background: var(--primary-color-dark, #0056b3);
}

.unlink-button:hover {
    background: var(--error-color-dark, #dc2626);
}

.error-message {
    color: var(--error-color);
    padding: var(--space-sm);
    margin: var(--space-sm) 0;
    background: var(--error-color-soft);
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
}

.actions-cell {
    width: 80px;
    text-align: center;
}

.delete-button {
    padding: var(--space-xs);
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.delete-button:hover {
    opacity: 1;
    transform: scale(1.1);
}

.delete-icon {
    width: 20px;
    height: 20px;
    filter: var(--primary-color-filter);
}

.confirm-modal {
    max-width: 420px;
    width: 90%;
    margin: 0 auto;
}

.confirm-content {
    text-align: center;
}

.confirm-content p {
    margin-bottom: var(--space-lg);
    line-height: 1.5;
    color: var(--text-color);
}

.confirm-actions {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
}

.confirm-actions .cancel-button,
.confirm-actions .delete-button {
    padding: var(--space-sm) var(--space-lg);
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    font-weight: 500;
    min-width: 80px;
}

.confirm-actions .cancel-button {
    background: var(--background-soft);
    color: var(--text-color);
}

.confirm-actions .delete-button {
    background: var(--error-color);
    color: white;
}

.confirm-actions .cancel-button:hover {
    background: var(--border-color);
}

.confirm-actions .delete-button:hover {
    background: var(--error-color-dark, #dc2626);
}

.confirm-content {
    padding: var(--space-lg) 0;
}

/* Queue Section Styles */
.queue-section {
    margin: var(--space-lg) 0;
    padding: var(--space-md);
    background: var(--background-soft);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
}

.queue-header {
    margin: 0 0 var(--space-md) 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
}

.queue-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.queue-item {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    transition: all 0.2s ease;
}

.queue-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
}

.queue-item-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.queue-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-sm);
}

.queue-source {
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.status-badge {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.pending {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.processing {
    background: #fef3c7;
    color: #92400e;
    animation: pulse 2s ease-in-out infinite;
}

.status-badge.failed {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge.completed {
    background: #d1fae5;
    color: #065f46;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.progress-bar-container {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.progress-bar {
    flex: 1;
    height: 6px;
    background: var(--background-soft);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: var(--radius-full);
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.75rem;
    color: var(--text-muted);
    min-width: 40px;
}

.queue-error {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm);
    background: #fee2e2;
    border-radius: var(--radius-sm);
}

.error-icon {
    font-size: 1rem;
}

.error-text {
    color: #991b1b;
    font-size: 0.875rem;
    flex: 1;
}

.queue-item-meta {
    display: flex;
    gap: var(--space-md);
    font-size: 0.75rem;
    color: var(--text-muted);
}

.queue-type,
.queue-time {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}


/* Action Buttons in Grid */
.view-button,
.delete-button {
    padding: 6px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.view-button:hover,
.delete-button:hover {
    background: var(--background-soft);
}

.action-icon {
    width: 18px;
    height: 18px;
    opacity: 0.8;
    filter: invert(37%) sepia(89%) saturate(3207%) hue-rotate(352deg) brightness(98%) contrast(93%);
}

.view-button:hover .action-icon,
.delete-button:hover .action-icon {
    opacity: 1;
}

/* Content Modal Styles */
.content-modal {
    max-width: 900px;
    width: 90%;
    max-height: 85vh;
}

.content-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: var(--space-md);
}

.content-info {
    display: flex;
    gap: var(--space-md);
    align-items: center;
}

.add-subpage-btn {
    padding: var(--space-sm) var(--space-md);
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.add-subpage-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
}

.content-source {
    font-weight: 600;
    color: var(--text-color);
}

.content-type,
.content-chunks-count {
    font-size: 0.875rem;
    color: var(--text-muted);
}

.content-actions {
    display: flex;
    gap: var(--space-sm);
}

.edit-button,
.save-button {
    padding: var(--space-xs) var(--space-sm);
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.edit-button:hover,
.save-button:hover:not(:disabled) {
    background: var(--primary-color-dark, #0056b3);
    transform: translateY(-1px);
}

.save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.content-display {
    max-height: 500px;
    overflow-y: auto;
}

.content-editor {
    width: 100%;
    min-height: 400px;
    padding: var(--space-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    resize: vertical;
}

.content-editor:focus {
    outline: none;
    border-color: var(--primary-color);
}

.content-viewer {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.content-chunk {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.chunk-header {
    padding: var(--space-sm) var(--space-md);
    background: var(--background-soft);
    border-bottom: 1px solid var(--border-color);
}

.chunk-number {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
}

.chunk-content {
    padding: var(--space-md);
    font-size: 0.875rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
}

/* Content Table Styles */
.content-table-container {
    max-height: 60vh;
    overflow: auto;
    padding-right: var(--space-md);
}

.content-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.content-table thead {
    position: sticky;
    top: 0;
    background: var(--background-soft);
    z-index: 1;
}

.content-table th {
    padding: var(--space-sm) var(--space-md);
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
}

.content-table .col-url {
    width: 25%;
}

.content-table .col-content {
    width: 65%;
}

.content-table .col-actions {
    width: 10%;
    text-align: center;
}

.subpage-row {
    border-bottom: 1px solid var(--border-color);
}

.subpage-row:hover {
    background: var(--background-soft);
}

.cell-url,
.cell-content,
.cell-actions {
    padding: var(--space-md);
    vertical-align: top;
}

.subpage-url {
    color: var(--primary-color);
    text-decoration: none;
    word-break: break-all;
    display: block;
    font-size: 0.8rem;
}

.subpage-url:hover {
    text-decoration: underline;
}

.subpage-id {
    color: var(--text-muted);
    font-family: monospace;
    font-size: 0.75rem;
}

.subpage-content-wrapper {
    max-height: 150px;
    overflow-y: auto;
}

.subpage-text {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.5;
}

.edit-subpage-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    transition: all 0.2s ease;
}

.edit-subpage-btn:hover {
    background: var(--background-soft);
}

.delete-subpage-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    transition: all 0.2s ease;
}

.delete-subpage-btn:hover {
    background: var(--background-soft);
}

.actions-buttons {
    display: flex;
    gap: var(--space-xs);
    align-items: center;
    justify-content: center;
}

.form-group {
    margin-bottom: var(--space-md);
}

.form-group label {
    display: block;
    margin-bottom: var(--space-xs);
    font-weight: 500;
    font-size: 0.875rem;
}

.subpage-name-input {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
}

.subpage-name-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.action-icon-sm {
    width: 16px;
    height: 16px;
    opacity: 0.8;
    filter: invert(37%) sepia(89%) saturate(3207%) hue-rotate(352deg) brightness(98%) contrast(93%);
}

.edit-subpage-btn:hover .action-icon-sm {
    opacity: 1;
}

/* Subpage Edit Modal */
.subpage-edit-modal {
    max-width: 700px;
    width: 90%;
}

.modal-body {
    padding: var(--space-lg);
}

.subpage-edit-textarea {
    width: 100%;
    min-height: 300px;
    padding: var(--space-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    resize: vertical;
}

.subpage-edit-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    border-top: 1px solid var(--border-color);
}

/* Update actions cell width to accommodate view button */
.actions-cell {
    width: 100px;
    text-align: center;
    display: flex;
    gap: var(--space-xs);
    align-items: center;
    justify-content: center;
}

.confirm-actions {
    display: flex;
    justify-content: center;
    gap: var(--space-md);
    margin-top: var(--space-lg);
}

.cancel-button {
    padding: var(--space-sm) var(--space-lg);
    background: var(--background-soft);
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
}

.confirm-modal .delete-button {
    padding: var(--space-sm) var(--space-lg);
    background: var(--error-color);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    opacity: 1;
}

.confirm-modal .delete-button:hover {
    background: var(--error-color-dark, #dc2626);
}

.remove-url-button {
    padding: var(--space-xs);
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
}

.remove-url-button:hover {
    opacity: 1;
    transform: scale(1.1);
}

.remove-icon {
    font-size: 1.5rem;
    line-height: 1;
}

.upload-error {
    padding: var(--space-sm);
    margin: var(--space-sm) 0;
    color: var(--error-color);
    background: var(--error-color-soft);
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
}

/* Responsive design for knowledge grid */
@media (max-width: 1024px) {

    .knowledge-grid-header,
    .knowledge-grid-row {
        grid-template-columns: 2fr 1fr 1fr 80px;
    }

    .header-cell:nth-child(3),
    .grid-cell:nth-child(3) {
        display: none;
        /* Hide subpages column on medium screens */
    }
}

@media (max-width: 768px) {
    .knowledge-grid-container {
        padding: var(--space-sm);
    }

    .knowledge-header {
        flex-direction: column;
        gap: var(--space-sm);
        align-items: stretch;
    }

    .header-left {
        flex-direction: column;
        gap: var(--space-sm);
        align-items: stretch;
    }

    .header-actions {
        justify-content: center;
    }

    .knowledge-grid-header,
    .knowledge-grid-row {
        grid-template-columns: 1fr 80px;
    }

    .header-cell:nth-child(2),
    .header-cell:nth-child(3),
    .header-cell:nth-child(4),
    .grid-cell:nth-child(2),
    .grid-cell:nth-child(3),
    .grid-cell:nth-child(4) {
        display: none;
        /* Hide type, subpages, and created columns on mobile */
    }

    .grid-cell:first-child {
        white-space: normal;
        word-break: break-word;
    }

    .pagination {
        flex-direction: column;
        gap: var(--space-xs);
    }

    .pagination-button {
        width: 100%;
    }
}

/* Improved Queue Styles */
.queue-item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-md);
}

.queue-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
    /* Allow truncation */
}

.queue-source {
    font-weight: 500;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.queue-meta {
    display: flex;
    gap: var(--space-xs);
    font-size: 0.75rem;
    color: var(--text-muted);
}

.queue-status-container {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex-shrink: 0;
}

.delete-queue-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: all 0.2s ease;
}

.delete-queue-btn:hover {
    opacity: 1;
    background: var(--background-soft);
}

.delete-icon-sm {
    width: 14px;
    height: 14px;
}

/* Grid Improvements */
.source-cell {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 250px;
}

.pages-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.page-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.more-pages {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-style: italic;
    padding-left: var(--space-xs);
}

.page-url {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 480px) {

    .modal-content {
        width: 95%;
        padding: var(--space-md);
        max-height: 95vh;
    }

    .knowledge-tabs {
        flex-direction: column;
    }

    .url-input-group {
        flex-direction: column;
    }

    .url-input-group input {
        margin-bottom: var(--space-sm);
    }

    .confirm-actions {
        flex-direction: column;
        gap: var(--space-sm);
    }

    .cancel-button,
    .confirm-modal .delete-button {
        width: 100%;
    }
}

/* Responsive design for org knowledge grid */
@media (max-width: 768px) {

    .org-knowledge-grid .knowledge-grid-header,
    .org-knowledge-grid .knowledge-grid-row {
        grid-template-columns: 1fr 120px;
    }

    .type-cell {
        display: none;
        /* Hide type column on mobile */
    }

    .source-cell {
        padding-left: var(--space-sm);
        white-space: normal;
        word-break: break-word;
    }

    .action-cell {
        padding-right: var(--space-sm);
    }
}
</style>