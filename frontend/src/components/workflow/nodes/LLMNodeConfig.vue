<!--
ChatterMate - LLM Node Configuration
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
import { ref, computed } from 'vue'
import { useAgentEdit } from '@/composables/useAgentEdit'
import KnowledgeGrid from '@/components/agent/KnowledgeGrid.vue'
import { ExitCondition } from '@/types/workflow'
import type { UserGroup } from '@/types/user'

interface FormData {
  system_prompt: string
  temperature: number
  exit_condition: string
  auto_transfer_enabled: boolean
  transfer_group_id: string
  ask_for_rating: boolean
}

const props = defineProps<{
  modelValue: FormData
  validationErrors: Record<string, string>
  userGroups: UserGroup[]
  loadingGroups: boolean
  agentId: string
  organizationId: string
  collapsedSections: Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FormData): void
  (e: 'validateField', field: string): void
  (e: 'toggleSection', section: string): void
}>()

// Local reactive copy of the form data
const localFormData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// AI generation state
const showAIPrompt = ref(false)
const aiPrompt = ref('')

// Initialize agent edit composable (using a mock agent object for AI generation)
const mockAgent = {
  id: 'temp-agent',
  name: 'Workflow Node Agent',
  display_name: 'Workflow Node Agent',
  description: 'Temporary agent for AI generation',
  agent_type: 'general',
  instructions: '',
  transfer_to_human: false,
  ask_for_rating: false,
  organization_id: 'temp',
  created_by: 'temp',
  created_at: new Date(),
  updated_at: new Date(),
  is_active: true,
  enable_rate_limiting: false,
  overall_limit_per_ip: 0,
  requests_per_sec: 0,
  conversation_starters: [],
  knowledge_base_ids: [],
  canvas_data: {}
} as any

const { generateInstructions, isLoading: aiLoading, error: aiError } = useAgentEdit(mockAgent)

// Handle field updates
const updateField = (field: keyof FormData, value: any) => {
  const updated = { ...localFormData.value, [field]: value }
  emit('update:modelValue', updated)
  emit('validateField', field)
}

// Handle AI generation for system prompt
const handleGenerateWithAI = async () => {
  if (!aiPrompt.value.trim()) return
  
  try {
    const generatedInstructions = await generateInstructions(aiPrompt.value)
    if (generatedInstructions.length > 0) {
      // Join the generated instructions with newlines
      updateField('system_prompt', generatedInstructions.join('\n'))
      showAIPrompt.value = false
      aiPrompt.value = ''
    }
  } catch (err) {
    console.error('Failed to generate instructions:', err)
  }
}

const validateFieldOnChange = (field: string) => {
  emit('validateField', field)
}

const toggleSection = (section: string) => {
  emit('toggleSection', section)
}
</script>

<template>
  <div class="llm-node-config">
    <div class="form-group">
      <div class="instructions-header">
        <label for="system-prompt">Instructions *</label>
        <button 
          class="ai-generate-button" 
          @click="showAIPrompt = true"
          :disabled="aiLoading"
          type="button"
        >
          <span class="ai-icon">✨</span>
          Generate with AI
        </button>
      </div>
      <textarea
        id="system-prompt"
        :value="localFormData.system_prompt"
        @input="updateField('system_prompt', ($event.target as HTMLInputElement).value)"
        class="form-textarea"
        :class="{ 'error': validationErrors.system_prompt }"
        placeholder="Enter system prompt for the AI"
        rows="4"
        required
        @blur="validateFieldOnChange('system_prompt')"
      ></textarea>
      <div v-if="validationErrors.system_prompt" class="error-message">
        {{ validationErrors.system_prompt }}
      </div>
    </div>
    
    <div class="form-group">
      <label for="temperature">Temperature</label>
      <input
        id="temperature"
        :value="localFormData.temperature"
        @input="updateField('temperature', parseFloat(($event.target as HTMLInputElement).value))"
        type="number"
        class="form-input"
        :class="{ 'error': validationErrors.temperature }"
        min="0"
        max="2"
        step="0.1"
        placeholder="0.7"
        @blur="validateFieldOnChange('temperature')"
      />
      <div v-if="validationErrors.temperature" class="error-message">
        {{ validationErrors.temperature }}
      </div>
      <p class="help-text">
        Controls randomness in responses. Lower values (0.1) are more focused, higher values (1.5) are more creative.
      </p>
    </div>

    <div class="form-group">
      <label for="exit-condition">Exit Condition *</label>
      <select
        id="exit-condition"
        :value="localFormData.exit_condition"
        @change="updateField('exit_condition', ($event.target as HTMLSelectElement).value)"
        class="form-select"
        :class="{ 'error': validationErrors.exit_condition }"
        required
        @blur="validateFieldOnChange('exit_condition')"
      >
        <option :value="ExitCondition.SINGLE_EXECUTION">Single Execution</option>
        <option :value="ExitCondition.CONTINUOUS_EXECUTION">Continuous Execution</option>
      </select>
      <div v-if="validationErrors.exit_condition" class="error-message">
        {{ validationErrors.exit_condition }}
      </div>
      <p class="help-text">
        <template v-if="localFormData.exit_condition === ExitCondition.SINGLE_EXECUTION">
          Always moves to the next node after one AI response (default).
        </template>
        <template v-else-if="localFormData.exit_condition === ExitCondition.CONTINUOUS_EXECUTION">
          Stays on current node for ongoing conversation, until the end chat is requested.
        </template>
      </p>
    </div>

    <!-- Transfer to Human Setting - Only for Continuous Execution -->
    <div v-if="localFormData.exit_condition === ExitCondition.CONTINUOUS_EXECUTION" class="form-group">
      <label class="checkbox-group">
        <input
          :checked="localFormData.auto_transfer_enabled"
          @change="updateField('auto_transfer_enabled', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          class="form-checkbox"
        />
        <span class="checkbox-label">Enable automatic transfer to human</span>
      </label>
      <p class="help-text">
        When enabled, the AI can automatically transfer the conversation to a human agent when it determines human assistance is needed, without ending the chat.
      </p>

      <!-- Group selection - Only when transfer is enabled -->
      <div v-if="localFormData.auto_transfer_enabled" class="transfer-groups">
        <label for="transfer-group">Transfer Group</label>
        <div v-if="!loadingGroups">
          <select
            id="transfer-group"
            :value="localFormData.transfer_group_id"
            @change="updateField('transfer_group_id', ($event.target as HTMLSelectElement).value)"
            class="form-select"
          >
            <option value="">Select a group</option>
            <option v-for="group in userGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
          <p v-if="userGroups.length === 0" class="help-text no-groups-message">
            No groups available. 
            <router-link to="/human-agents" class="create-group-link">
              Create Group
            </router-link>
          </p>
          <p v-else class="help-text">
            Select the group that should handle transferred conversations.
          </p>
        </div>
        <div v-else class="loading-groups">
          Loading groups...
        </div>
      </div>
    </div>

    <!-- Request Rating Setting - Only for Continuous Execution -->
    <div v-if="localFormData.exit_condition === ExitCondition.CONTINUOUS_EXECUTION" class="form-group">
      <label class="checkbox-group">
        <input
          :checked="localFormData.ask_for_rating"
          @change="updateField('ask_for_rating', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          class="form-checkbox"
        />
        <span class="checkbox-label">Ask for rating once chat is ended</span>
      </label>
      <p class="help-text">
        When enabled, customers will be asked to rate their experience when the conversation ends.
      </p>
    </div>

    <!-- Knowledge Section -->
    <div class="form-group">
      <div class="knowledge-section">
        <div class="section-header knowledge-header" @click="toggleSection('knowledge')">
          <div class="section-title">
            <svg class="section-icon" :class="{ 'rotated': collapsedSections.knowledge }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
            <span>Knowledge Sources</span>
          </div>
        </div>
        
        <div class="section-content knowledge-content" :class="{ 'collapsed': collapsedSections.knowledge }">
          <div class="knowledge-wrapper">
            <KnowledgeGrid 
              v-if="!collapsedSections.knowledge"
              :agent-id="agentId" 
              :organization-id="organizationId"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- AI Prompt Modal -->
    <div v-if="showAIPrompt" class="ai-prompt-modal">
      <div class="ai-prompt-content">
        <h5>Generate Instructions with AI</h5>
        <textarea 
          v-model="aiPrompt"
          placeholder="Describe what you want this AI node to do. For example: 'Create instructions for a customer support assistant that helps with order tracking'"
          rows="4"
          class="ai-prompt-textarea"
        ></textarea>
        <div v-if="aiError" class="error-message">{{ aiError }}</div>
        <div class="ai-prompt-actions">
          <button 
            class="cancel-ai-button" 
            @click="showAIPrompt = false"
            :disabled="aiLoading"
            type="button"
          >
            Cancel
          </button>
          <button 
            class="generate-ai-button" 
            @click="handleGenerateWithAI"
            :disabled="aiLoading || !aiPrompt.trim()"
            type="button"
          >
            {{ aiLoading ? 'Generating...' : 'Generate' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Import shared form styles */
.form-group {
  margin-bottom: var(--space-sm);
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.85rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(201, 242, 78, 0.15);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.form-input.error:focus,
.form-textarea.error:focus,
.form-select.error:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message::before {
  content: "⚠";
  font-size: 0.8rem;
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 8px 0;
}

.checkbox-group input[type="checkbox"] {
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-label {
  font-size: 0.85rem;
  color: var(--text-color);
  line-height: 1.4;
}

.help-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.3;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}

/* Instructions Header Styles */
.instructions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.ai-generate-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-generate-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.ai-generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-icon {
  font-size: 0.8rem;
}

/* AI Prompt Modal Styles */
.ai-prompt-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ai-prompt-content {
  background: var(--background-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.ai-prompt-content h5 {
  margin: 0 0 var(--space-sm) 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.ai-prompt-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-soft);
  color: var(--text-color);
  font-size: 0.85rem;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
}

.ai-prompt-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

.cancel-ai-button,
.generate-ai-button {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  min-width: 80px;
  white-space: nowrap;
}

.cancel-ai-button {
  background: var(--background-muted);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.cancel-ai-button:hover {
  background: var(--background-alt);
  color: var(--text-color);
}

.generate-ai-button {
  background: var(--primary-color);
  color: white;
}

.generate-ai-button:hover {
  background: var(--primary-dark);
}

.generate-ai-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transfer groups styling */
.transfer-groups {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--background-alt);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.transfer-groups label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.no-groups-message {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-top: 4px;
}

.create-group-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.create-group-link:hover {
  text-decoration: underline;
}

.loading-groups {
  text-align: center;
  padding: var(--space-sm);
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Knowledge Section Styles */
.knowledge-section {
  margin-top: var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--background-color);
  overflow: hidden;
}

.knowledge-header .section-header {
  background: var(--background-muted);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.knowledge-header .section-header:hover {
  background: var(--background-alt);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}

.section-icon {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.section-icon.rotated {
  transform: rotate(-90deg);
}

.knowledge-content {
  padding: 0;
  max-height: none;
  overflow: visible;
  transition: all 0.3s ease;
}

.knowledge-content.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  overflow: hidden;
}

.knowledge-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Override KnowledgeGrid styles within LLMNodeConfig */
.knowledge-content :deep(.knowledge-grid-container) {
  padding: var(--space-sm);
  background: transparent;
  border-top: none;
}

.knowledge-content :deep(.knowledge-header) {
  margin-bottom: var(--space-sm);
  flex-direction: column;
  gap: var(--space-xs);
  align-items: stretch;
}

.knowledge-content :deep(.header-left) {
  flex-direction: column;
  gap: var(--space-xs);
  align-items: stretch;
}

.knowledge-content :deep(.header-left h3) {
  font-size: 1rem;
  margin-bottom: 0;
}

.knowledge-content :deep(.header-actions) {
  display: flex;
  gap: var(--space-xs);
  justify-content: center;
}

.knowledge-content :deep(.action-button) {
  font-size: 0.7rem;
  padding: 4px 8px;
  flex: 1;
  text-align: center;
  white-space: nowrap;
}

.knowledge-content :deep(.knowledge-grid) {
  font-size: 0.8rem;
}

.knowledge-content :deep(.knowledge-grid-header),
.knowledge-content :deep(.knowledge-grid-row) {
  grid-template-columns: 1fr 60px;
  min-height: auto;
}

.knowledge-content :deep(.header-cell),
.knowledge-content :deep(.grid-cell) {
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.75rem;
}

.knowledge-content :deep(.header-cell:nth-child(2)),
.knowledge-content :deep(.header-cell:nth-child(3)),
.knowledge-content :deep(.header-cell:nth-child(4)),
.knowledge-content :deep(.grid-cell:nth-child(2)),
.knowledge-content :deep(.grid-cell:nth-child(3)),
.knowledge-content :deep(.grid-cell:nth-child(4)) {
  display: none;
}

.knowledge-content :deep(.actions-cell) {
  width: 60px;
  text-align: center;
}

.knowledge-content :deep(.delete-button) {
  padding: 2px;
}

.knowledge-content :deep(.delete-icon) {
  width: 16px;
  height: 16px;
}

.knowledge-content :deep(.knowledge-empty) {
  padding: var(--space-md);
  text-align: center;
}

.knowledge-content :deep(.warning-message) {
  font-size: 0.8rem;
  margin-bottom: var(--space-xs);
}

.knowledge-content :deep(.warning-description) {
  font-size: 0.75rem;
  line-height: 1.4;
}

.knowledge-content :deep(.modal-content) {
  max-width: 30vw;
  max-height: 75vh;
  width: 65%;
}

/* Ensure knowledge modals have proper z-index */
.knowledge-content :deep(.modal-overlay) {
  z-index: 1001 !important;
  position: fixed !important;
  isolation: isolate;
  background: rgba(0, 0, 0, 0.4) !important;
}

.knowledge-content :deep(.modal-overlay),
.knowledge-content :deep(.modal-content) {
  pointer-events: auto;
}

.knowledge-content :deep(.modal-overlay) {
  backdrop-filter: blur(4px);
}

.knowledge-content :deep(.pagination) {
  flex-direction: column;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.knowledge-content :deep(.pagination-button) {
  width: 100%;
  font-size: 0.7rem;
  padding: var(--space-xs);
}

.knowledge-content :deep(.page-info) {
  font-size: 0.7rem;
  text-align: center;
}

/* Link modal overrides */
.knowledge-content :deep(.link-modal) {
  max-width: 65vw;
  width: 60%;
}

.knowledge-content :deep(.org-knowledge-grid .knowledge-grid-header),
.knowledge-content :deep(.org-knowledge-grid .knowledge-grid-row) {
  grid-template-columns: 2fr 0fr 100px;
  align-items: center;
}

.knowledge-content :deep(.org-knowledge-grid .type-cell) {
  display: none;
}

.knowledge-content :deep(.source-cell) {
  padding-left: var(--space-sm);
  white-space: normal;
  word-break: break-word;
  font-size: 0.75rem;
}

.knowledge-content :deep(.action-cell) {
  padding-right: var(--space-sm);
  text-align: right;
  width: 100px;
}

.knowledge-content :deep(.link-button),
.knowledge-content :deep(.unlink-button) {
  min-width: 70px;
  padding: 4px 8px;
  font-size: 0.7rem;
  display: inline-block;
}

.knowledge-content :deep(.org-knowledge-grid) .action-cell {
  display: block !important;
  visibility: visible !important;
}

.knowledge-content :deep(.org-knowledge-grid) .link-button,
.knowledge-content :deep(.org-knowledge-grid) .unlink-button {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

@media (max-width: 768px) {
  .knowledge-content :deep(.knowledge-grid-container) {
    padding: 4px;
  }
  
  .knowledge-content :deep(.header-actions) {
    flex-direction: column;
    gap: 4px;
  }
  
  .knowledge-content :deep(.action-button) {
    font-size: 0.65rem;
    padding: 3px 6px;
  }

  .knowledge-content :deep(.org-knowledge-grid .knowledge-grid-header),
  .knowledge-content :deep(.org-knowledge-grid .knowledge-grid-row) {
    grid-template-columns: 2fr 0fr 100px !important;
  }
  
  .knowledge-content :deep(.org-knowledge-grid) .action-cell {
    display: block !important;
    grid-column: 3 !important;
  }
}
</style> 