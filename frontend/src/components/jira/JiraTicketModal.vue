<!--
ChatterMate - Jira Ticket Modal
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
import { useJiraTicket } from '@/composables/useJiraTicket'

const props = defineProps<{
  chatId: string
  initialSummary?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'ticketCreated', ticketKey: string): void
}>()

const {
  jiraConnected,
  jiraLoading,
  showTicketModal,
  jiraProjects,
  jiraIssueTypes,
  jiraPriorities,
  selectedProject,
  selectedIssueType,
  selectedPriority,
  ticketSummary,
  ticketDescription,
  loadingProjects,
  loadingIssueTypes,
  loadingPriorities,
  creatingTicket,
  createdTicketKey,
  priorityAvailable,
  checkingPriorityAvailability,
  isFormValid,
  checkJiraStatus,
  handleProjectChange,
  handleIssueTypeChange,
  openTicketModal,
  closeTicketModal,
  submitTicket
} = useJiraTicket()

// Initialize the modal
const initModal = async () => {
  await openTicketModal(props.initialSummary)
}

// Handle close
const handleClose = () => {
  closeTicketModal()
  emit('close')
}

// Handle submit
const handleSubmit = async () => {
  const ticketKey = await submitTicket(props.chatId)
  if (ticketKey) {
    emit('ticketCreated', ticketKey)
    handleClose()
  }
}

// Initialize on mount
initModal()
</script>

<template>
  <div class="ticket-modal">
    <div class="ticket-modal-content">
      <div class="ticket-modal-header">
        <h3>Create Jira Ticket</h3>
        <button class="close-modal-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div v-if="jiraLoading" class="ticket-loading">
        <i class="fas fa-spinner fa-spin"></i>
        Checking Jira connection...
      </div>

      <div v-else-if="!jiraConnected" class="ticket-not-connected">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Jira is not connected. Please connect Jira in the settings.</p>
        <router-link to="/settings/integrations" class="connect-jira-btn">
          Connect Jira
        </router-link>
      </div>

      <div v-else class="ticket-form">
        <div class="form-group">
          <label for="ticket-project">Project *</label>
          <div v-if="loadingProjects" class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Loading projects...
          </div>
          <select 
            v-else
            id="ticket-project" 
            v-model="selectedProject"
            @change="handleProjectChange(selectedProject)"
          >
            <option value="">Select a project</option>
            <option 
              v-for="project in jiraProjects" 
              :key="project.id" 
              :value="project.key"
            >
              {{ project.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="ticket-issue-type">Issue Type *</label>
          <div v-if="loadingIssueTypes" class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Loading issue types...
          </div>
          <select 
            v-else
            id="ticket-issue-type" 
            v-model="selectedIssueType"
            :disabled="!selectedProject"
            @change="handleIssueTypeChange(selectedIssueType)"
          >
            <option value="">Select an issue type</option>
            <option 
              v-for="issueType in jiraIssueTypes" 
              :key="issueType.id" 
              :value="issueType.id"
            >
              {{ issueType.name }}
            </option>
          </select>
        </div>

        <div v-if="selectedProject && selectedIssueType" class="form-group">
          <div v-if="checkingPriorityAvailability" class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Checking priority availability...
          </div>
          
          <template v-else-if="priorityAvailable">
            <label for="ticket-priority">Priority</label>
            <div v-if="loadingPriorities" class="loading-indicator">
              <i class="fas fa-spinner fa-spin"></i> Loading priorities...
            </div>
            <select 
              v-else
              id="ticket-priority" 
              v-model="selectedPriority"
            >
              <option value="">Select a priority</option>
              <option 
                v-for="priority in jiraPriorities" 
                :key="priority.id" 
                :value="priority.id"
              >
                {{ priority.name }}
              </option>
            </select>
          </template>
          
          <div v-else class="priority-unavailable">
            <i class="fas fa-info-circle"></i>
            Priority field is not available for this project/issue type
          </div>
        </div>

        <div class="form-group">
          <label for="ticket-summary">Summary *</label>
          <input 
            type="text" 
            id="ticket-summary" 
            v-model="ticketSummary"
            placeholder="Enter a summary for the ticket"
          >
        </div>

        <div class="form-group">
          <label for="ticket-description">Description</label>
          <textarea 
            id="ticket-description" 
            v-model="ticketDescription"
            placeholder="Enter a description for the ticket"
            rows="4"
          ></textarea>
        </div>

        <div class="ticket-actions">
          <button class="cancel-btn" @click="handleClose">Cancel</button>
          <button 
            class="create-btn" 
            @click="handleSubmit"
            :disabled="!isFormValid || creatingTicket"
          >
            <i v-if="creatingTicket" class="fas fa-spinner fa-spin"></i>
            {{ creatingTicket ? 'Creating...' : 'Create Ticket' }}
          </button>
        </div>

        <div v-if="createdTicketKey" class="ticket-created">
          <i class="fas fa-check-circle"></i>
          Ticket created: <strong>{{ createdTicketKey }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-modal {
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
}

.ticket-modal-content {
  background: var(--background-color);
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ticket-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
}

.ticket-modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
}

.close-modal-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
}

.close-modal-btn:hover {
  background: var(--background-mute);
  color: var(--text-primary);
}

.ticket-loading,
.ticket-not-connected {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
}

.ticket-loading i,
.ticket-not-connected i {
  font-size: 24px;
  margin-bottom: 16px;
  display: block;
}

.ticket-not-connected i {
  color: var(--warning);
}

.connect-jira-btn {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 16px;
  background: var(--primary-color);
  color: #0B0C10;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.connect-jira-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.ticket-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background-color);
  color: var(--text-primary);
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-group select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-indicator {
  padding: 10px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.loading-indicator i {
  margin-right: 8px;
}

.ticket-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  background: var(--background-mute);
  color: var(--text-primary);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}

.create-btn {
  background: var(--primary-color);
  color: #0B0C10;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.create-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  filter: none;
}

.ticket-created {
  margin-top: 16px;
  padding: 12px;
  background: var(--success-light);
  color: var(--success);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ticket-created i {
  font-size: 18px;
}

.priority-unavailable {
  padding: 10px;
  background-color: var(--background-mute);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-unavailable i {
  color: var(--warning);
  font-size: 16px;
}
</style> 