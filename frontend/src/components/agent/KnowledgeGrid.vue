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
import { onMounted, onUnmounted } from 'vue'
import { useKnowledgeManagement } from '@/composables/useKnowledgeManagement'
import DeleteIcon from '@/assets/delete.svg'
import mitt from '@/utils/emitter'

const props = defineProps<{
    agentId: string
    organizationId: string
}>()

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
} = useKnowledgeManagement(props.agentId, props.organizationId)

// Handle knowledge update notifications
const handleKnowledgeUpdate = () => {
    fetchKnowledge()
}

onMounted(() => {
    fetchKnowledge()
    // Subscribe to knowledge update events
    mitt.on('knowledge-updated', handleKnowledgeUpdate)
})

onUnmounted(() => {
    // Clean up event listener
    mitt.off('knowledge-updated', handleKnowledgeUpdate)
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
                    <div class="grid-cell">{{ item.name }}</div>
                    <div class="grid-cell">{{ item.type }}</div>
                    <div class="grid-cell pages-cell">
                        <div v-for="page in item.pages" :key="page.subpage" class="page-item">
                            <a v-if="isValidUrl(page.subpage)" :href="page.subpage" target="_blank"
                                rel="noopener noreferrer" class="page-url page-link">
                                {{ page.subpage }}
                            </a>
                            <span v-else class="page-url">
                                {{ page.subpage }}
                            </span>
                        </div>
                    </div>
                    <div class="grid-cell">
                        {{ item.pages.length ? formatDate(getFirstCreated(item.pages)) : 'N/A' }}
                    </div>
                    <div class="grid-cell actions-cell">
                        <button class="delete-button" @click="confirmDelete(item.id)" title="Delete knowledge source">
                            <img :src="DeleteIcon" alt="Delete" class="delete-icon" />
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
}

.knowledge-grid-header {
    display: grid;
    grid-template-columns: 2fr 1fr 3fr 1fr 80px;
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
    grid-template-columns: 2fr 1fr 3fr 1fr 80px;
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
    background: var(--background-color);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: var(--background);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
    max-width: 800px;
}

.org-knowledge-grid {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    margin-top: var(--space-md);
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
    max-width: 400px;
}

.confirm-content {
    padding: var(--space-lg) 0;
    text-align: center;
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
</style>