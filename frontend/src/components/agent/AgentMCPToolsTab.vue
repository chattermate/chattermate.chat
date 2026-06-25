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
          <span v-for="i in 4" :key="i" class="empty-icon-dot"></span>
        </div>
        <h4>No MCP Tools Connected</h4>
        <p>Connect MCP tools to extend your agent's capabilities with external services and APIs.</p>
        <button class="primary-button" @click="openCreateModal">
          Create Your First Tool
        </button>
      </div>

      <!-- Tools List -->
      <div v-else class="tools-list">
        <div v-for="tool in agentMCPTools" :key="tool.id" class="tool-card">
          <div class="tool-card-main">
            <div class="tool-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div class="tool-meta">
              <div class="tool-name">
                <span class="tool-name-text">{{ tool.name }}</span>
                <span class="transport-chip">{{ getTransportTypeInfo(tool.transport_type).label }}</span>
              </div>
              <div class="tool-desc">{{ tool.description || 'Custom MCP tool' }}</div>
            </div>
          </div>
          <div class="tool-card-actions">
            <span class="tool-status">
              <span class="status-dot"></span>{{ tool.enabled ? 'connected' : 'disabled' }}
            </span>
            <button class="remove-button" @click="confirmDelete(tool.id)" title="Remove tool">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create MCP Tool Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>Create MCP tool</h3>
          <button class="close-button" @click="showCreateModal = false">✕</button>
        </div>

        <div class="modal-body">
          <!-- Presets -->
          <div class="form-section">
            <h4>Quick start presets</h4>
            <div class="presets-grid">
              <button
                v-for="preset in mcpPresets"
                :key="preset.name"
                class="preset-card"
                :class="{ selected: createForm.name === preset.name }"
                @click="applyPreset(preset)"
              >
                <h5>{{ preset.name }}</h5>
                <p>{{ preset.description }}</p>
              </button>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="form-section">
            <h4>Basic information</h4>
            <div class="form-grid">
              <div class="form-group">
                <label for="tool-name">Tool name <span class="req">*</span></label>
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
            <h4>Transport type</h4>
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
                <span class="radio-circle"><span class="radio-dot"></span></span>
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
          <h3>Link existing tools</h3>
          <button class="close-button" @click="showLinkModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingAvailable" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading available tools...</p>
          </div>

          <div v-else-if="!availableMCPTools.length" class="empty-state modal-empty">
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
          <button class="close-button" @click="cancelDelete">✕</button>
        </div>
        
        <div class="modal-body">
          <p class="confirm-text">Are you sure you want to remove this MCP tool from the agent? This action cannot be undone.</p>
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
}

/* ---------- Header ---------- */
.mcp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}

.header-content {
  flex: 1;
}

.section-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 6px;
  line-height: 1.3;
}

.section-description {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
  max-width: 560px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 18px;
  background: var(--accent-ink);
  color: var(--on-accent);
  border: none;
  border-radius: var(--radius-chip);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.secondary {
  background: var(--o05);
  color: var(--text);
  border: 1px solid var(--o14);
  font-weight: 500;
}

.action-button:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.action-button.secondary:hover {
  filter: none;
  background: var(--o08);
}

.button-icon {
  width: 16px;
  height: 16px;
}

/* ---------- Loading / Error ---------- */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  text-align: center;
  color: var(--muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--o10);
  border-radius: 50%;
  border-top-color: var(--accent-ink);
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md);
}

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--c-coral);
  margin-bottom: var(--space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---------- Empty State ---------- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed var(--o14);
  border-radius: var(--radius-card);
  padding: 58px 30px;
  text-align: center;
}

.empty-icon {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  margin-bottom: 16px;
}

.empty-icon-dot {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--o12);
}

.empty-state h4 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 19px;
  color: var(--text);
  margin: 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--muted);
  margin: 6px 0 20px;
  max-width: 380px;
  line-height: 1.5;
}

/* ---------- Tools List ---------- */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  transition: border-color 0.2s ease;
}

.tool-card:hover {
  border-color: var(--o14);
}

.tool-card-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.tool-badge {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  flex-shrink: 0;
  background: var(--purple-bg);
  color: var(--c-purple);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-badge svg {
  width: 20px;
  height: 20px;
}

.tool-meta {
  min-width: 0;
}

.tool-name {
  display: flex;
  align-items: center;
  gap: 9px;
}

.tool-name-text {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15.5px;
  color: var(--text);
}

.transport-chip {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--o06);
  color: var(--muted);
  text-transform: uppercase;
}

.tool-desc {
  font-size: 13px;
  color: var(--muted);
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-card-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.tool-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--c-lime);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-lime);
}

.remove-button {
  padding: 7px 13px;
  background: transparent;
  border: 1px solid var(--coral-border);
  border-radius: 8px;
  color: var(--c-coral);
  font-family: var(--font-sans);
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.remove-button:hover {
  background: var(--coral-bg);
}

/* ---------- Modal Shell ---------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--scrim);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
}

.modal-content {
  width: 100%;
  max-width: 520px;
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 22px;
  padding: 30px;
  box-shadow: 0 40px 100px -30px rgba(0, 0, 0, 0.8);
  margin: auto;
}

.modal-content.large {
  max-width: 640px;
}

.modal-content.small {
  max-width: 460px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.modal-header h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--o08);
  color: var(--text);
}

.modal-body {
  display: flex;
  flex-direction: column;
}

.confirm-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

/* ---------- Form ---------- */
.form-section {
  margin-top: 24px;
}

.form-section:first-child {
  margin-top: 0;
}

.form-section h4 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
  margin: 0 0 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  margin-bottom: 0;
}

.form-group + .form-group,
.form-grid + .form-group,
.form-group + .input-list {
  margin-top: 14px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 8px;
  font-weight: 500;
}

.req {
  color: var(--c-coral);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 15px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-btn);
  color: var(--text);
  font-size: 14.5px;
  font-family: var(--font-sans);
  outline: none;
  transition: border-color 0.2s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--muted);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--accent-border);
}

/* ---------- Presets ---------- */
.presets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.preset-card {
  text-align: left;
  padding: 16px;
  border-radius: 14px;
  cursor: pointer;
  background: var(--bg);
  border: 1px solid var(--o10);
  font-family: var(--font-sans);
  transition: all 0.2s ease;
}

.preset-card:hover {
  border-color: var(--o16);
}

.preset-card.selected {
  background: var(--accent-bg-08);
  border-color: var(--accent-border);
}

.preset-card h5 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
  margin: 0;
}

.preset-card.selected h5 {
  color: var(--accent-ink);
}

.preset-card p {
  font-size: 12.5px;
  color: var(--muted);
  margin: 4px 0 0;
  line-height: 1.4;
}

/* ---------- Transport Types ---------- */
.transport-types {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.transport-option {
  display: flex;
  align-items: center;
  gap: 13px;
  text-align: left;
  padding: 15px 16px;
  border-radius: 13px;
  cursor: pointer;
  background: var(--bg);
  border: 1px solid var(--o10);
  transition: all 0.2s ease;
}

.transport-option:hover {
  border-color: var(--o16);
}

.transport-option.selected {
  background: var(--accent-bg-08);
  border-color: var(--accent-border);
}

.transport-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid var(--o16);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
}

.transport-option.selected .radio-circle {
  border-color: var(--accent-ink);
}

.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-ink);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.transport-option.selected .radio-dot {
  opacity: 1;
}

.transport-info h5 {
  margin: 0;
  font-weight: 600;
  font-size: 14.5px;
  color: var(--text);
}

.transport-option.selected .transport-info h5 {
  color: var(--accent-ink);
}

.transport-info p {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--muted);
}

/* ---------- Input Lists ---------- */
.input-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-add {
  display: flex;
  gap: 10px;
}

.input-add.dual {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
}

.input-add input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 15px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-btn);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-sans);
  outline: none;
}

.input-add input::placeholder {
  color: var(--muted);
}

.input-add input:focus {
  border-color: var(--accent-border);
}

.input-add button {
  padding: 11px 18px;
  background: var(--accent-ink);
  color: var(--on-accent);
  border: none;
  border-radius: var(--radius-chip);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  font-family: var(--font-sans);
  white-space: nowrap;
}

.input-add button:hover {
  filter: brightness(1.08);
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 14px;
  background: var(--bg);
  border: 1px solid var(--o08);
  border-radius: var(--radius-btn);
  gap: 10px;
}

.list-item code {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--text3);
  word-break: break-all;
}

.remove-button.icon,
.list-item .remove-button {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--coral-bg);
  color: var(--c-coral);
  border: 1px solid var(--coral-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}

.list-item .remove-button:hover {
  background: var(--c-coral);
  color: var(--on-accent);
}

/* ---------- Buttons ---------- */
.primary-button,
.secondary-button,
.danger-button,
.link-button,
.unlink-button {
  padding: 13px 22px;
  border: none;
  border-radius: var(--radius-btn);
  font-weight: 600;
  font-size: 14.5px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-button {
  padding: 13px 24px;
  background: var(--accent-ink);
  color: var(--on-accent);
}

.empty-state .primary-button {
  padding: 12px 22px;
  border-radius: var(--radius-btn);
}

.primary-button:hover {
  filter: brightness(1.08);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-button {
  background: var(--o05);
  color: var(--text);
  border: 1px solid var(--o14);
}

.secondary-button:hover {
  background: var(--o08);
}

.danger-button {
  background: var(--c-coral);
  color: var(--on-accent);
}

.danger-button:hover {
  filter: brightness(1.08);
}

.link-button {
  background: var(--accent-ink);
  color: var(--on-accent);
  min-width: 80px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  justify-content: center;
  padding: 9px 16px;
  font-size: 13px;
}

.link-button:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.unlink-button {
  background: transparent;
  color: var(--c-coral);
  border: 1px solid var(--coral-border);
  min-width: 80px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  justify-content: center;
  padding: 9px 16px;
  font-size: 13px;
}

.unlink-button:hover {
  background: var(--coral-bg);
  transform: translateY(-1px);
}

.link-button .button-icon,
.unlink-button .button-icon {
  width: 14px;
  height: 14px;
}

/* ---------- Modal Link/Delete list ---------- */
.modal-tools-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-tools-list .list-header {
  display: none;
}

.modal-tools-list .tool-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg);
  border: 1px solid var(--o08);
  border-radius: var(--radius-lg);
}

.modal-tools-list .name-cell {
  min-width: 0;
}

.modal-tools-list .tool-name h5 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14.5px;
  color: var(--text);
}

.modal-tools-list .tool-name p {
  margin: 3px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.modal-tools-list .transport-badge {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--o06);
  color: var(--muted);
  text-transform: uppercase;
}

.modal-tools-list .type-cell,
.modal-tools-list .actions-cell {
  display: flex;
  align-items: center;
}

.empty-state.modal-empty {
  border: 1.5px dashed var(--o16);
  border-radius: 14px;
  padding: 40px 24px;
}

.empty-state.modal-empty p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

/* ---------- Responsive ---------- */
@media (max-width: 768px) {
  .mcp-header {
    flex-direction: column;
    gap: 18px;
    align-items: stretch;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .tool-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .tool-card-actions {
    width: 100%;
    justify-content: space-between;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .presets-grid {
    grid-template-columns: 1fr;
  }

  .input-add.dual {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 16px;
  }

  .modal-content {
    padding: 22px;
  }
}

@media (max-width: 480px) {
  .mcp-tools-container {
    padding: 0 var(--space-md);
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .modal-footer button {
    width: 100%;
  }
}
</style>
