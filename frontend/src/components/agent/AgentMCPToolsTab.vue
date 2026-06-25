<!--
ChatterMate - Agent MCP Tools Tab
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
import { onMounted, ref } from 'vue'
import { useMCPTools } from '@/composables/useMCPTools'
import type { MCPTransportType } from '@/types/mcp'

const props = defineProps<{
  agentId: string
}>()

const {
  agentMCPTools,
  availableMCPTools,
  isLoading,
  isLoadingAvailable,
  error,
  showCreateModal,
  showLinkModal,
  showDeleteConfirm,
  createForm,
  transportTypes,
  mcpPresets,
  fetchAgentMCPTools,
  fetchAvailableMCPTools,
  createMCPTool,
  linkMCPTool,
  unlinkMCPTool,
  deleteMCPTool,
  applyPreset,
  resetCreateForm,
  confirmDelete,
  cancelDelete,
  addArg,
  removeArg,
  addEnvVar,
  removeEnvVar,
  addHeader,
  removeHeader,
  isToolLinked,
  getTransportTypeInfo,
  formatDate
} = useMCPTools(props.agentId)

// Form helpers
const newArg = ref('')
const newEnvKey = ref('')
const newEnvValue = ref('')
const newHeaderKey = ref('')
const newHeaderValue = ref('')

const handleAddArg = () => {
  if (newArg.value.trim()) {
    addArg(newArg.value)
    newArg.value = ''
  }
}

const handleAddEnvVar = () => {
  if (newEnvKey.value.trim() && newEnvValue.value.trim()) {
    addEnvVar(newEnvKey.value, newEnvValue.value)
    newEnvKey.value = ''
    newEnvValue.value = ''
  }
}

const handleAddHeader = () => {
  if (newHeaderKey.value.trim() && newHeaderValue.value.trim()) {
    addHeader(newHeaderKey.value, newHeaderValue.value)
    newHeaderKey.value = ''
    newHeaderValue.value = ''
  }
}

const openCreateModal = () => {
  resetCreateForm()
  showCreateModal.value = true
}

const openLinkModal = () => {
  fetchAvailableMCPTools()
  showLinkModal.value = true
}

const handleCreateTool = async () => {
  try {
    await createMCPTool()
  } catch (error) {
    console.error('Error creating MCP tool:', error)
  }
}

onMounted(() => {
  fetchAgentMCPTools()
})
</script>

<template>
  <div class="mcp-tools-container">
    <div class="mcp-header">
      <div class="header-content">
        <h3 class="section-title">MCP Tools</h3>
        <p class="section-description">
          Connect external tools and services to your agent using the Model Context Protocol (MCP).
          These tools extend your agent's capabilities with access to file systems, APIs, databases, and more.
        </p>
      </div>
      <div class="header-actions">
        <button class="action-button" @click="openCreateModal">
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Create Tool
        </button>
        <button class="action-button secondary" @click="openLinkModal">
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Link Existing
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading MCP tools...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <p>{{ error }}</p>
    </div>

    <!-- MCP Tools Grid -->
    <div v-else class="mcp-tools-grid">
      <!-- Empty State -->
      <div v-if="!agentMCPTools.length" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <h4>No MCP Tools Connected</h4>
        <p>Connect MCP tools to extend your agent's capabilities with external services and APIs.</p>
        <button class="primary-button" @click="openCreateModal">
          Create Your First Tool
        </button>
      </div>

      <!-- Tools List -->
      <div v-else class="tools-list">
        <div class="list-header">
          <div class="header-cell name-cell">Tool</div>
          <div class="header-cell type-cell">Type</div>
          <div class="header-cell config-cell">Configuration</div>
          <div class="header-cell status-cell">Status</div>
          <div class="header-cell actions-cell">Actions</div>
        </div>

        <div v-for="tool in agentMCPTools" :key="tool.id" class="tool-row">
          <div class="cell name-cell">
            <div class="tool-name">
              <h5>{{ tool.name }}</h5>
              <p v-if="tool.description">{{ tool.description }}</p>
            </div>
          </div>
          
          <div class="cell type-cell">
            <span class="transport-badge" :class="tool.transport_type">
              {{ getTransportTypeInfo(tool.transport_type).label }}
            </span>
          </div>
          
          <div class="cell config-cell">
            <div v-if="tool.transport_type === 'stdio'" class="config-info">
              <div class="config-item">
                <span class="config-label">Command:</span>
                <code class="config-value">{{ tool.command }}</code>
              </div>
              <div v-if="tool.args && tool.args.length" class="config-item">
                <span class="config-label">Args:</span>
                <code class="config-value">{{ tool.args.join(' ') }}</code>
              </div>
            </div>
            <div v-else-if="tool.transport_type === 'http' || tool.transport_type === 'sse'" class="config-info">
              <div class="config-item">
                <span class="config-label">URL:</span>
                <code class="config-value">{{ tool.url }}</code>
              </div>
              <div v-if="tool.timeout" class="config-item">
                <span class="config-label">Timeout:</span>
                <span class="config-value">{{ tool.timeout }}s</span>
              </div>
            </div>
          </div>
          
          <div class="cell status-cell">
            <span class="status-badge" :class="{ 'enabled': tool.enabled, 'disabled': !tool.enabled }">
              {{ tool.enabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          
          <div class="cell actions-cell">
            <button class="icon-button delete" @click="confirmDelete(tool.id)" title="Remove tool">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create MCP Tool Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>Create MCP Tool</h3>
          <button class="close-button" @click="showCreateModal = false">×</button>
        </div>

        <div class="modal-body">
          <!-- Presets -->
          <div class="form-section">
            <h4>Quick Start Presets</h4>
            <div class="presets-grid">
              <button 
                v-for="preset in mcpPresets" 
                :key="preset.name"
                class="preset-card"
                @click="applyPreset(preset)"
              >
                <h5>{{ preset.name }}</h5>
                <p>{{ preset.description }}</p>
              </button>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="form-section">
            <h4>Basic Information</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="tool-name">Tool Name *</label>
                <input 
                  id="tool-name"
                  v-model="createForm.name" 
                  type="text" 
                  placeholder="Enter tool name"
                  required
                >
              </div>
              <div class="form-group">
                <label for="tool-description">Description</label>
                <input 
                  id="tool-description"
                  v-model="createForm.description" 
                  type="text" 
                  placeholder="What does this tool do?"
                >
              </div>
            </div>
          </div>

          <!-- Transport Type -->
          <div class="form-section">
            <h4>Transport Type</h4>
            <div class="transport-types">
              <label 
                v-for="type in transportTypes" 
                :key="type.value"
                class="transport-option"
                :class="{ 'selected': createForm.transport_type === type.value }"
              >
                <input 
                  type="radio" 
                  :value="type.value" 
                  v-model="createForm.transport_type"
                >
                <div class="transport-info">
                  <h5>{{ type.label }}</h5>
                  <p>{{ type.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- STDIO Configuration -->
          <div v-if="createForm.transport_type === 'stdio'" class="form-section">
            <h4>STDIO Configuration</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="command">Command *</label>
                <input 
                  id="command"
                  v-model="createForm.command" 
                  type="text" 
                  placeholder="e.g., uvx, npx, node"
                  required
                >
              </div>
            </div>

            <!-- Arguments -->
            <div class="form-group">
              <label>Arguments</label>
              <div class="input-list">
                <div class="input-add">
                  <input 
                    v-model="newArg" 
                    type="text" 
                    placeholder="Add argument"
                    @keyup.enter="handleAddArg"
                  >
                  <button type="button" @click="handleAddArg">Add</button>
                </div>
                <div v-if="createForm.args && createForm.args.length" class="list-items">
                  <div v-for="(arg, index) in createForm.args" :key="index" class="list-item">
                    <code>{{ arg }}</code>
                    <button type="button" @click="removeArg(index)" class="remove-button">×</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Environment Variables -->
            <div class="form-group">
              <label>Environment Variables</label>
              <div class="input-list">
                <div class="input-add dual">
                  <input 
                    v-model="newEnvKey" 
                    type="text" 
                    placeholder="Variable name"
                    @keyup.enter="handleAddEnvVar"
                  >
                  <input 
                    v-model="newEnvValue" 
                    type="text" 
                    placeholder="Variable value"
                    @keyup.enter="handleAddEnvVar"
                  >
                  <button type="button" @click="handleAddEnvVar">Add</button>
                </div>
                <div v-if="createForm.env_vars && Object.keys(createForm.env_vars).length" class="list-items">
                  <div v-for="(value, key) in createForm.env_vars" :key="key" class="list-item">
                    <code>{{ key }}={{ value }}</code>
                    <button type="button" @click="removeEnvVar(key)" class="remove-button">×</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- HTTP/SSE Configuration -->
          <div v-else-if="createForm.transport_type === 'http' || createForm.transport_type === 'sse'" class="form-section">
            <h4>{{ createForm.transport_type.toUpperCase() }} Configuration</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="url">Server URL *</label>
                <input 
                  id="url"
                  v-model="createForm.url" 
                  type="url" 
                  placeholder="https://example.com/mcp"
                  required
                >
              </div>
              <div class="form-group">
                <label for="timeout">Timeout (seconds)</label>
                <input 
                  id="timeout"
                  v-model.number="createForm.timeout" 
                  type="number" 
                  min="1" 
                  max="300"
                  placeholder="30"
                >
              </div>
            </div>

            <div v-if="createForm.transport_type === 'sse'" class="form-grid">
              <div class="form-group">
                <label for="sse-timeout">SSE Read Timeout (seconds)</label>
                <input 
                  id="sse-timeout"
                  v-model.number="createForm.sse_read_timeout" 
                  type="number" 
                  min="1" 
                  max="600"
                  placeholder="60"
                >
              </div>
            </div>

            <!-- Headers -->
            <div class="form-group">
              <label>HTTP Headers</label>
              <div class="input-list">
                <div class="input-add dual">
                  <input 
                    v-model="newHeaderKey" 
                    type="text" 
                    placeholder="Header name"
                    @keyup.enter="handleAddHeader"
                  >
                  <input 
                    v-model="newHeaderValue" 
                    type="text" 
                    placeholder="Header value"
                    @keyup.enter="handleAddHeader"
                  >
                  <button type="button" @click="handleAddHeader">Add</button>
                </div>
                <div v-if="createForm.headers && Object.keys(createForm.headers).length" class="list-items">
                  <div v-for="(value, key) in createForm.headers" :key="key" class="list-item">
                    <code>{{ key }}: {{ value }}</code>
                    <button type="button" @click="removeHeader(key)" class="remove-button">×</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="secondary-button" @click="showCreateModal = false">
            Cancel
          </button>
          <button 
            type="button" 
            class="primary-button" 
            @click="handleCreateTool"
            :disabled="!createForm.name.trim()"
          >
            Create Tool
          </button>
        </div>
      </div>
    </div>

    <!-- Link Existing Tools Modal -->
    <div v-if="showLinkModal" class="modal-overlay" @click.self="showLinkModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Link Existing Tools</h3>
          <button class="close-button" @click="showLinkModal = false">×</button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingAvailable" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading available tools...</p>
          </div>

          <div v-else-if="!availableMCPTools.length" class="empty-state">
            <p>No tools available to link. Create a new tool first.</p>
          </div>

          <div v-else class="tools-list modal-tools-list">
            <div class="list-header">
              <div class="header-cell name-cell">Tool</div>
              <div class="header-cell type-cell">Type</div>
              <div class="header-cell actions-cell">Action</div>
            </div>

            <div v-for="tool in availableMCPTools" :key="tool.id" class="tool-row">
              <div class="cell name-cell">
                <div class="tool-name">
                  <h5>{{ tool.name }}</h5>
                  <p v-if="tool.description">{{ tool.description }}</p>
                </div>
              </div>
              
              <div class="cell type-cell">
                <span class="transport-badge" :class="tool.transport_type">
                  {{ getTransportTypeInfo(tool.transport_type).label }}
                </span>
              </div>
              
              <div class="cell actions-cell">
                <button 
                  v-if="!isToolLinked(tool.id)"
                  class="link-button"
                  @click="linkMCPTool(tool.id)"
                >
                  <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Link
                </button>
                <button 
                  v-else
                  class="unlink-button"
                  @click="unlinkMCPTool(tool.id)"
                >
                  <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18"/>
                    <path d="M6 6l12 12"/>
                  </svg>
                  Unlink
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-content small">
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
          <button class="close-button" @click="cancelDelete">×</button>
        </div>
        
        <div class="modal-body">
          <p>Are you sure you want to remove this MCP tool from the agent? This action cannot be undone.</p>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="secondary-button" @click="cancelDelete">
            Cancel
          </button>
          <button type="button" class="danger-button" @click="deleteMCPTool">
            Remove Tool
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mcp-tools-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  min-height: calc(100vh - 300px);
}

.mcp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
}

.header-content {
  flex: 1;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--space-sm);
  line-height: 1.3;
}

.section-description {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
}

.header-actions {
  display: flex;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--primary-color);
  color: #0B0C10;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.secondary {
  background: var(--background-soft);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.action-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.button-icon {
  width: 16px;
  height: 16px;
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  text-align: center;
  color: var(--text-muted);
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

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--error-color);
  margin-bottom: var(--space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  text-align: center;
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-color);
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  margin-bottom: var(--space-md);
}

.empty-state h4 {
  margin-bottom: var(--space-sm);
  color: var(--text-color);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: var(--space-lg);
  max-width: 400px;
}

/* Tools List */
.tools-list {
  background: var(--background-base);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Modal-specific tools list layout */
.modal-tools-list .list-header,
.modal-tools-list .tool-row {
  grid-template-columns: 2fr 120px 120px;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 120px 2fr 100px 80px;
  background: var(--background-soft);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-muted);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.tool-row {
  display: grid;
  grid-template-columns: 2fr 120px 2fr 100px 80px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
  min-height: 80px;
}

.tool-row:hover {
  background: var(--background-soft);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tool-row:last-child {
  border-bottom: none;
}

.header-cell,
.cell {
  padding: var(--space-lg) var(--space-md);
  display: flex;
  align-items: center;
}

.name-cell {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--space-xs);
}

.tool-name h5 {
  margin: 0;
  font-weight: 600;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.3;
}

.tool-name p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.4;
  max-width: 280px;
}

.transport-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: uppercase;
}

.transport-badge.stdio {
  background: var(--primary-soft);
  color: var(--primary-color);
}

.transport-badge.http {
  background: var(--success-soft);
  color: var(--success-color);
}

.transport-badge.sse {
  background: var(--warning-soft);
  color: var(--warning-color);
}

.config-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
}

.config-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  flex-wrap: wrap;
}

.config-label {
  color: var(--text-muted);
  font-weight: 500;
  min-width: 60px;
  flex-shrink: 0;
}

.config-value {
  background: var(--background-muted);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--text-color);
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  flex: 1;
  min-width: 0;
}

.status-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.status-badge.enabled {
  background: var(--success-soft);
  color: var(--success-color);
}

.status-badge.disabled {
  background: var(--error-soft);
  color: var(--error-color);
}

.actions-cell {
  justify-content: center;
}

.icon-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: var(--background-muted);
  color: var(--text-color);
}

.icon-button.delete:hover {
  background: var(--error-soft);
  color: var(--error-color);
}

.icon-button svg {
  width: 16px;
  height: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(6px);
  padding: var(--space-lg);
}

.modal-content {
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--o12);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-content.large {
  max-width: 900px;
}

.modal-content.small {
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xl) var(--space-xl) var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--background-base);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.3;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--background-soft);
  color: var(--text-color);
  transform: scale(1.05);
}

.modal-body {
  padding: var(--space-xl);
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl) var(--space-xl);
  border-top: 1px solid var(--border-color);
  background: var(--background-base);
}

/* Form Styles */
.form-section {
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.form-section h4 {
  margin-bottom: var(--space-lg);
  color: var(--text-color);
  font-size: 1.125rem;
  font-weight: 700;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: var(--space-sm);
  display: inline-block;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-xs);
  color: var(--text-muted);
  font-weight: 500;
  font-size: var(--text-sm);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-base);
  color: var(--text-color);
  font-size: var(--text-sm);
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
}

/* Presets */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
}

.preset-card {
  padding: var(--space-lg);
  background: var(--background-base);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.preset-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.preset-card:hover {
  background: var(--background-base);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.preset-card:hover::before {
  transform: scaleX(1);
}

.preset-card h5 {
  margin: 0 0 var(--space-sm) 0;
  font-weight: 700;
  color: var(--text-color);
  font-size: 1rem;
}

.preset-card p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
}

/* Transport Types */
.transport-types {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.transport-option {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.transport-option.selected {
  background: var(--primary-soft);
  border-color: var(--primary-color);
}

.transport-option input[type="radio"] {
  margin: 0;
  width: auto;
}

.transport-info h5 {
  margin: 0 0 var(--space-xs) 0;
  font-weight: 600;
  color: var(--text-color);
}

.transport-info p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Input Lists */
.input-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.input-add {
  display: flex;
  gap: var(--space-sm);
}

.input-add.dual {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--space-sm);
}

.input-add button {
  padding: var(--space-sm) var(--space-md);
  background: var(--primary-color);
  color: #0B0C10;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

.input-add button:hover {
  filter: brightness(1.1);
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm);
  background: var(--background-muted);
  border-radius: var(--radius-md);
  gap: var(--space-sm);
}

.list-item code {
  flex: 1;
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--text-color);
}

.remove-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--error-soft);
  color: var(--error-color);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: bold;
}

.remove-button:hover {
  background: var(--error-color);
  color: white;
}

/* Buttons */
.primary-button,
.secondary-button,
.danger-button,
.link-button,
.unlink-button {
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--text-sm);
}

.primary-button {
  background: var(--primary-color);
  color: #0B0C10;
}

.primary-button:hover {
  filter: brightness(1.1);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-button {
  background: var(--background-soft);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.secondary-button:hover {
  background: var(--background-muted);
}

.danger-button {
  background: var(--error-color);
  color: white;
}

.danger-button:hover {
  filter: brightness(1.1);
}

.link-button {
  background: var(--primary-color);
  color: #0B0C10;
  min-width: 80px;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  justify-content: center;
}

.link-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.unlink-button {
  background: var(--error-color);
  color: white;
  min-width: 80px;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  justify-content: center;
}

.unlink-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.link-button .button-icon,
.unlink-button .button-icon {
  width: 14px;
  height: 14px;
}



/* Responsive Design */
@media (max-width: 768px) {
  .mcp-header {
    flex-direction: column;
    gap: var(--space-lg);
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .list-header,
  .tool-row {
    grid-template-columns: 1fr auto;
  }

  .type-cell,
  .config-cell,
  .status-cell {
    display: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .presets-grid {
    grid-template-columns: 1fr;
  }

  .transport-types {
    gap: var(--space-sm);
  }

  .transport-option {
    padding: var(--space-md);
  }

  .input-add.dual {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }

  .modal-overlay {
    padding: var(--space-md);
  }

  .modal-content {
    width: 100%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-lg);
  }

  .form-section {
    padding: var(--space-md);
  }
}

@media (max-width: 480px) {
  .mcp-tools-container {
    padding: var(--space-md);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-md);
  }

  .modal-footer {
    flex-direction: column;
    gap: var(--space-xs);
  }

  .modal-footer button {
    width: 100%;
  }
}
</style> 