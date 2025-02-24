<!--
ChatterMate - A I Setup
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
import { useAISetup } from '@/composables/useAISetup'
import { computed } from 'vue'

const emit = defineEmits<{
  (e: 'ai-setup-complete'): void
}>()

const {
  isLoading,
  error,
  providers,
  setupConfig,
  saveAISetup
} = useAISetup()

const showApiKey = computed(() => setupConfig.value.provider !== 'ollama')

const handleSubmit = async () => {
  try {
    if (setupConfig.value.provider === 'ollama') {
      setupConfig.value.apiKey = 'not_required'
    }
    const success = await saveAISetup()
    if (success) {
      emit('ai-setup-complete')
    }
  } catch (error) {
    console.error('Submit error:', error)
  }
}
</script>

<template>
  <div class="ai-setup">
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
    </div>
    
    <form v-else @submit.prevent="handleSubmit" class="setup-form">
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-group">
      
        <p class="setup-description">Set up your AI provider to start using ChatterMate's intelligent features.</p>

        <label for="provider">AI Provider</label>
        <select 
          id="provider" 
          v-model="setupConfig.provider"
          required
          class="form-control"
        >
          <option value="">Select Provider</option>
          <option 
            v-for="provider in providers" 
            :key="provider.value" 
            :value="provider.value"
          >
            {{ provider.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="model">Model Name</label>
        <input
          id="model"
          type="text"
          v-model="setupConfig.model"
          required
          placeholder="Enter model name (e.g. gpt-4)"
          class="form-control"
        />
      </div>

      <div v-if="showApiKey" class="form-group">
        <label for="apiKey">API Key</label>
        <input
          id="apiKey"
          type="password"
          v-model="setupConfig.apiKey"
          :required="showApiKey"
          placeholder="Enter your API key"
          class="form-control"
        />
        <p class="key-hint">Your API key will be encrypted and stored securely</p>
      </div>

      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Saving...' : 'Save Configuration' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.ai-setup {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 15px rgb(131, 129, 129);
}

.setup-form {
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
  font-weight: 500;
  color: var(--text-color);
}

.form-control {
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-family: inherit;
  background: var(--background-color);
  color: var(--text-color);
}

.key-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

.submit-button {
  padding: var(--space-sm) var(--space-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 500;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
  background: var(--error-soft);
  color: var(--error-color);
  border-radius: var(--radius-lg);
  border: 1px solid var(--error-color);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-bottom-color: var(--primary-color);
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
}

.setup-header {
  margin-bottom: var(--space-lg);
  text-align: left;
}

.setup-header h3 {
  color: var(--text-primary);
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: var(--space-sm);
  line-height: 1.4;
}

.setup-description {
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}
</style>