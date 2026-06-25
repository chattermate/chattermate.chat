<!--
ChatterMate - Agent Workflow Tab
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
import { ref, onMounted, computed } from 'vue'
import { useAgentWorkflow } from '@/composables/useAgentWorkflow'
import type { AgentWithCustomization } from '@/types/agent'
import WorkflowBuilder from '../workflow/WorkflowBuilder.vue'
import { workflowCacheStorage } from '@/utils/storage'

const props = defineProps<{
  agent: AgentWithCustomization
}>()

const emit = defineEmits<{
  (e: 'toggle-fullscreen', isFullscreen: boolean): void
}>()

const {
  workflow,
  workflowLoading,
  workflowError,
  createWorkflowLoading,
  hasWorkflow,
  fetchWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
} = useAgentWorkflow(props.agent.id)

// Create workflow form state
const showCreateForm = ref(false)
const workflowName = ref('')
const workflowDescription = ref('')

// Edit workflow form state
const showEditForm = ref(false)
const editWorkflowName = ref('')
const editWorkflowDescription = ref('')

// Workflow builder state
const showWorkflowBuilder = ref(false)

// Computed properties
const workflowStatus = computed(() => {
  if (!workflow.value) return 'No workflow'
  return workflow.value.status || 'Draft'
})

const workflowStatusColor = computed(() => {
  const status = workflowStatus.value.toLowerCase()
  switch (status) {
    case 'published':
      return 'success'
    case 'draft':
      return 'warning'
    case 'archived':
      return 'muted'
    default:
      return 'muted'
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleCreateWorkflow = async () => {
  if (!workflowName.value.trim()) {
    return
  }

  try {
    await createWorkflow({
      name: workflowName.value.trim(),
      description: workflowDescription.value.trim() || undefined
    })
    
    // Reset form
    workflowName.value = ''
    workflowDescription.value = ''
    showCreateForm.value = false
  } catch (error) {
    // Error handling is done in the composable
  }
}

const handleEditWorkflow = () => {
  if (!workflow.value) return
  
  // Pre-populate form with current values
  editWorkflowName.value = workflow.value.name
  editWorkflowDescription.value = workflow.value.description || ''
  showEditForm.value = true
  showCreateForm.value = false // Ensure create form is hidden
}

const handleUpdateWorkflow = async () => {
  if (!workflow.value || !editWorkflowName.value.trim()) {
    return
  }

  try {
    await updateWorkflow(workflow.value.id, {
      name: editWorkflowName.value.trim(),
      description: editWorkflowDescription.value.trim() || undefined
    })
    
    // Reset form
    editWorkflowName.value = ''
    editWorkflowDescription.value = ''
    showEditForm.value = false
  } catch (error) {
    // Error handling is done in the composable
  }
}

const cancelEditForm = () => {
  editWorkflowName.value = ''
  editWorkflowDescription.value = ''
  showEditForm.value = false
}

const handleDeleteWorkflow = async () => {
  if (!workflow.value) return
  
  if (confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
    try {
      await deleteWorkflow(workflow.value.id)
    } catch (error) {
      // Error handling is done in the composable
    }
  }
}

const toggleFullscreen = () => {
  emit('toggle-fullscreen', true)
}

const openWorkflowBuilder = () => {
  // Clear existing cache and reload fresh data when opening workflow builder
  if (workflow.value) {
    workflowCacheStorage.clearWorkflowCache(workflow.value.id)
  }
  showWorkflowBuilder.value = true
}

const closeWorkflowBuilder = () => {
  showWorkflowBuilder.value = false
}

const handleWorkflowSave = () => {
  // Refresh workflow data after saving
  fetchWorkflow()
  showWorkflowBuilder.value = false
}

const cancelCreateForm = () => {
  workflowName.value = ''
  workflowDescription.value = ''
  showCreateForm.value = false
}

// Fetch workflow on mount
onMounted(() => {
  fetchWorkflow()
})
</script>

<template>
  <div class="workflow-tab">
    <section class="detail-section">
      <h3 class="section-title">Workflow Builder</h3>
      <p class="section-description">
        Create and manage conversation workflows for your agent. Design custom chat journeys with drag-and-drop interface.
      </p>
      
      <!-- Loading State -->
      <div v-if="workflowLoading && !hasWorkflow" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading workflow...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="workflowError && !hasWorkflow" class="error-container">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ workflowError }}</p>
        <button class="retry-button" @click="fetchWorkflow">Try Again</button>
      </div>

      <!-- No Workflow State -->
      <div v-else-if="!hasWorkflow && !showCreateForm && !showEditForm" class="no-workflow-container">
        <div class="no-workflow-content">
          <div class="no-workflow-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="6" height="6"/>
              <rect x="15" y="3" width="6" height="6"/>
              <rect x="9" y="15" width="6" height="6"/>
              <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/>
              <path d="M12 15v-3"/>
            </svg>
          </div>
          <h4 class="no-workflow-title">No Workflow Created</h4>
          <p class="no-workflow-description">
            Create a workflow to design custom conversation journeys for your agent. 
            Use our drag-and-drop interface to build sophisticated chat flows.
          </p>
          <button class="create-workflow-button" @click="showCreateForm = true; showEditForm = false">
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Workflow
          </button>
        </div>
      </div>

      <!-- Create Workflow Form -->
      <div v-else-if="showCreateForm" class="create-form-container">
        <div class="form-header">
          <h4 class="form-title">Create New Workflow</h4>
          <button class="close-form-button" @click="cancelCreateForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleCreateWorkflow" class="create-form">
          <div class="form-group">
            <label for="workflow-name" class="form-label">Workflow Name *</label>
            <input
              id="workflow-name"
              v-model="workflowName"
              type="text"
              class="form-input"
              placeholder="Enter workflow name"
              required
              :disabled="createWorkflowLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="workflow-description" class="form-label">Description</label>
            <textarea
              id="workflow-description"
              v-model="workflowDescription"
              class="form-textarea"
              placeholder="Describe what this workflow does (optional)"
              rows="3"
              :disabled="createWorkflowLoading"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button
              type="button"
              class="cancel-button"
              @click="cancelCreateForm"
              :disabled="createWorkflowLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="submit-button"
              :disabled="!workflowName.trim() || createWorkflowLoading"
            >
              <div v-if="createWorkflowLoading" class="button-spinner"></div>
              <span v-else>Create Workflow</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Edit Workflow Form -->
      <div v-else-if="showEditForm" class="create-form-container">
        <div class="form-header">
          <h4 class="form-title">Edit Workflow</h4>
          <button class="close-form-button" @click="cancelEditForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleUpdateWorkflow" class="create-form">
          <div class="form-group">
            <label for="edit-workflow-name" class="form-label">Workflow Name *</label>
            <input
              id="edit-workflow-name"
              v-model="editWorkflowName"
              type="text"
              class="form-input"
              placeholder="Enter workflow name"
              required
              :disabled="workflowLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="edit-workflow-description" class="form-label">Description</label>
            <textarea
              id="edit-workflow-description"
              v-model="editWorkflowDescription"
              class="form-textarea"
              placeholder="Describe what this workflow does (optional)"
              rows="3"
              :disabled="workflowLoading"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button
              type="button"
              class="cancel-button"
              @click="cancelEditForm"
              :disabled="workflowLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="submit-button"
              :disabled="!editWorkflowName.trim() || workflowLoading"
            >
              <div v-if="workflowLoading" class="button-spinner"></div>
              <span v-else>Update Workflow</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Existing Workflow -->
      <div v-else-if="hasWorkflow && !showEditForm" class="workflow-container">
        <div class="workflow-card">
          <div class="workflow-content">
            <div class="workflow-info">
              <div class="workflow-main">
                <h4 class="workflow-name">{{ workflow!.name }}</h4>
                <span class="workflow-status" :class="`status-${workflowStatusColor}`">
                  {{ workflowStatus }}
                </span>
              </div>
              <p v-if="workflow!.description" class="workflow-description">
                {{ workflow!.description }}
              </p>
              <div class="workflow-meta">
                <span class="workflow-date">
                  Created {{ formatDate(workflow!.created_at) }}
                </span>
                <span class="workflow-separator">•</span>
                <span class="workflow-date">
                  Updated {{ formatDate(workflow!.updated_at) }}
                </span>
              </div>
            </div>
            
            <div class="workflow-actions">
              <button class="action-button primary" @click="openWorkflowBuilder">
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
                Open Builder
              </button>
              
              <button class="action-button secondary" @click="handleEditWorkflow">
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              
              <button class="action-button danger" @click="handleDeleteWorkflow">
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Workflow Builder -->
    <WorkflowBuilder
      v-if="showWorkflowBuilder && workflow"
      :workflow="workflow"
      @close="closeWorkflowBuilder"
      @save="handleWorkflowSave"
    />
  </div>
</template>

<style scoped>
.workflow-tab {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
}

.detail-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
}

.section-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: var(--space-lg);
  line-height: 1.5;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md);
}

.loading-text {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: var(--error-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--error-color);
}

.error-icon {
  font-size: 2rem;
  margin-bottom: var(--space-md);
}

.error-message {
  color: var(--error-color);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  text-align: center;
}

.retry-button {
  padding: var(--space-sm) var(--space-md);
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: var(--error-dark);
}

/* No Workflow State */
.no-workflow-container {
  display: flex;
  justify-content: center;
  padding: var(--space-xl);
}

.no-workflow-content {
  text-align: center;
  max-width: 480px;
  padding: var(--space-xl);
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.no-workflow-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-lg);
  color: var(--text-muted);
  opacity: 0.7;
}

.no-workflow-icon svg {
  width: 100%;
  height: 100%;
}

.no-workflow-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-md);
}

.no-workflow-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: var(--space-xl);
}

.create-workflow-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: var(--accent-ink);
  color: var(--on-accent);
  border: none;
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--text-sm);
}

.create-workflow-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button-icon {
  width: 16px;
  height: 16px;
}

/* Create Form */
.create-form-container {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color);
}

.form-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.close-form-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-form-button:hover {
  background: var(--background-muted);
  color: var(--text-color);
}

.close-form-button svg {
  width: 16px;
  height: 16px;
}

.create-form {
  padding: var(--space-lg);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: var(--space-sm);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-color);
  font-size: var(--text-sm);
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-soft);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.cancel-button,
.submit-button {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.cancel-button {
  background: var(--background-muted);
  color: var(--text-muted);
}

.cancel-button:hover {
  background: var(--background-alt);
  color: var(--text-color);
}

.submit-button {
  background: var(--accent-ink);
  color: var(--on-accent);
}

.submit-button:hover:not(:disabled) {
  background: var(--primary-dark);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Workflow Card */
.workflow-container {
  display: flex;
  justify-content: center;
}

.workflow-card {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.workflow-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.workflow-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-lg);
  gap: var(--space-lg);
}

.workflow-info {
  flex: 1;
  min-width: 0;
}

.workflow-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  gap: var(--space-md);
}

.workflow-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-description {
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: 1.4;
  margin: 0 0 var(--space-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.workflow-meta {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.workflow-status {
  padding: 2px var(--space-sm);
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.workflow-status.status-success {
  background: var(--success-light);
  color: var(--success-color);
}

.workflow-status.status-warning {
  background: var(--warning-light);
  color: var(--warning-color);
}

.workflow-status.status-muted {
  background: var(--background-muted);
  color: var(--text-muted);
}

.workflow-date {
  color: var(--text-muted);
  font-size: 0.7rem;
  white-space: nowrap;
}

.workflow-separator {
  color: var(--text-muted);
  font-size: 0.7rem;
  margin: 0 2px;
}

.workflow-actions {
  display: flex;
  gap: var(--space-xs);
  flex-shrink: 0;
  align-items: flex-start;
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.7rem;
  white-space: nowrap;
  min-height: 32px;
}

.action-button.primary {
  background: var(--accent-ink);
  color: var(--on-accent);
}

.action-button.primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.action-button.secondary {
  background: var(--background-muted);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.action-button.secondary:hover {
  background: var(--background-alt);
  color: var(--text-color);
  border-color: var(--text-muted);
}

.action-button.danger {
  background: transparent;
  color: var(--error-color);
  border: 1px solid var(--error-color);
}

.action-button.danger:hover {
  background: var(--error-color);
  color: white;
}

.action-button svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .workflow-content {
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .workflow-main {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .workflow-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .action-button {
    flex: 1;
    justify-content: center;
    min-width: 0;
  }
}
</style> 