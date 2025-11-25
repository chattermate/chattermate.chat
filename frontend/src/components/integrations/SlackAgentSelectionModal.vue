<!--
ChatterMate - Slack Agent Selection Modal
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
import { ref, onMounted } from 'vue'
import { agentService } from '@/services/agent'
import type { Agent } from '@/types/agent'

const emit = defineEmits(['close', 'connect'])

const agents = ref<Agent[]>([])
const selectedAgentId = ref('')
const loading = ref(true)
const error = ref('')

const fetchAgents = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await agentService.getOrganizationAgents()
    agents.value = data
  } catch (err) {
    console.error('Error fetching agents:', err)
    error.value = 'Failed to load agents'
  } finally {
    loading.value = false
  }
}

const handleConnect = () => {
  if (selectedAgentId.value) {
    emit('connect', selectedAgentId.value)
  }
}

const handleClose = () => {
  emit('close')
}

onMounted(() => {
  fetchAgents()
})
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Select an Agent</h3>
        <button class="close-btn" @click="handleClose">
          <span>&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="info-section">
          <div class="info-icon">🤖</div>
          <p class="info-text">Select which agent will respond to messages in Slack.</p>
          <p class="helper-text">You can configure additional agents and channels after connecting.</p>
        </div>

        <div class="agent-selection">
          <!-- Loading state -->
          <div v-if="loading" class="loading-state">
            <span class="loading-spinner"></span>
            <span>Loading agents...</span>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="error-state">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
          </div>

          <!-- No agents -->
          <div v-else-if="agents.length === 0" class="no-agents-state">
            <span class="warning-icon">⚠️</span>
            <p>No agents found. Please create an agent first.</p>
            <router-link to="/agent/new" class="create-agent-link">
              + Create Agent
            </router-link>
          </div>

          <!-- Agent list -->
          <div v-else class="agent-list">
            <label
              v-for="agent in agents"
              :key="agent.id"
              class="agent-option"
              :class="{ selected: selectedAgentId === agent.id }"
            >
              <input
                type="radio"
                name="agent"
                :value="agent.id"
                v-model="selectedAgentId"
              />
              <div class="agent-info">
                <span class="agent-name">{{ agent.name }}</span>
                <span v-if="agent.description" class="agent-description">{{ agent.description }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="handleClose">Cancel</button>
        <button
          class="btn-connect"
          @click="handleConnect"
          :disabled="!selectedAgentId || loading"
        >
          Connect to Slack
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}

.modal-content {
  background: var(--background-color);
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--background-mute);
  color: var(--text-color);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.info-section {
  text-align: center;
  margin-bottom: 24px;
}

.info-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.info-text {
  font-size: 16px;
  color: var(--text-color);
  margin-bottom: 8px;
}

.helper-text {
  font-size: 14px;
  color: var(--text-muted);
}

.agent-selection {
  min-height: 150px;
}

.loading-state,
.error-state,
.no-agents-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: var(--text-muted);
  gap: 12px;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.warning-icon,
.error-icon {
  font-size: 32px;
}

.create-agent-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  background: var(--primary-soft);
  border-radius: 20px;
  transition: all 0.2s;
}

.create-agent-link:hover {
  background: var(--primary-color);
  color: white;
}

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--background-color);
}

.agent-option:hover {
  border-color: var(--primary-color);
  background: var(--background-soft);
}

.agent-option.selected {
  border-color: var(--primary-color);
  background: var(--primary-soft);
}

.agent-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent-name {
  font-weight: 500;
  color: var(--text-color);
}

.agent-description {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--background-soft);
}

.btn-cancel {
  background: var(--background-mute);
  color: var(--text-color);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--background-alt);
}

.btn-connect {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-connect:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-connect:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
