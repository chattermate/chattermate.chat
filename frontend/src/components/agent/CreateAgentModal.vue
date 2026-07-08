<!--
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<script setup lang="ts">
import type { Agent } from '@/types/agent'
import { useAgentCreate } from '@/composables/useAgentCreate'

const {
    agentName,
    useWorkflow,
    isCreating,
    error,
    createAgent
} = useAgentCreate()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'created', agent: Agent): void
    (e: 'openWorkflowBuilder', agent: Agent): void
}>()

const handleCreateAgent = async () => {
    const newAgent = await createAgent()
    if (newAgent) {
        emit('created', newAgent)
    }
}
</script>

<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Agent</h3>
                <button type="button" class="close-button" @click="$emit('close')">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="handleCreateAgent">
                    <div class="form-group">
                        <label for="agent-name">Agent Name</label>
                        <input 
                            id="agent-name" 
                            type="text" 
                            v-model="agentName" 
                            placeholder="e.g., Customer Support Bot"
                            :disabled="isCreating"
                            required
                        >
                        <div class="help-text">
                            Enter a name for your agent. This will be displayed to users.
                        </div>
                    </div>
                    
                    <div class="form-group mode-selection">
                        <label>Agent Mode</label>
                        <div class="mode-options">
                            <div 
                                class="mode-option" 
                                :class="{ 'selected': !useWorkflow }"
                                @click="useWorkflow = false"
                            >
                                <div class="mode-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4z"/>
                                        <path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z"/>
                                    </svg>
                                </div>
                                <div class="mode-details">
                                    <h4>AI Automode</h4>
                                    <p>Let the AI respond naturally based on instructions</p>
                                </div>
                            </div>
                            
                            <div 
                                class="mode-option" 
                                :class="{ 'selected': useWorkflow }"
                                @click="useWorkflow = true"
                            >
                                <div class="mode-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="6" cy="6" r="2.4"/>
                                        <circle cx="6" cy="18" r="2.4"/>
                                        <circle cx="18" cy="9" r="2.4"/>
                                        <path d="M8.4 6H13a3 3 0 0 1 3 3M6 8.4v7.2"/>
                                    </svg>
                                </div>
                                <div class="mode-details">
                                    <h4>Workflow Builder</h4>
                                    <p>Create custom conversation flows with drag-and-drop</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>
                    
                    <div class="form-actions">
                        <button 
                            type="button" 
                            class="cancel-button" 
                            @click="$emit('close')"
                            :disabled="isCreating"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            class="create-button"
                            :disabled="isCreating"
                        >
                            {{ isCreating ? 'Creating...' : 'Create Agent' }}
                        </button>
                    </div>
                </form>
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
    background-color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: var(--surface);
    border: 1px solid var(--o10);
    border-radius: 24px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
    animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg) var(--space-lg) var(--space-md);
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-color);
    font-weight: 600;
}

.close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
    line-height: 1;
    padding: 0;
    margin: 0;
}

.close-button:hover {
    color: var(--text-color);
}

.modal-body {
    padding: var(--space-lg);
}

.form-group {
    margin-bottom: var(--space-lg);
}

label {
    display: block;
    margin-bottom: var(--space-xs);
    font-weight: 500;
    color: var(--text-color);
}

input {
    width: 100%;
    padding: var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-soft);
    color: var(--text-color);
    font-size: 1rem;
    transition: border-color 0.2s ease;
}

input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-soft);
}

.help-text {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-top: var(--space-xs);
}

.error-message {
    background-color: var(--error-soft);
    color: var(--error-color);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-lg);
    font-size: 0.875rem;
}

.mode-options {
    display: flex;
    gap: var(--space-md);
    flex-direction: column;
}

.mode-option {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.2s ease;
}

.mode-option.selected {
    border-color: var(--primary-color);
    background-color: var(--primary-soft);
}

.mode-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: var(--radius-md);
    background: var(--o05);
    border: 1px solid var(--o10);
    color: var(--muted);
    transition: all 0.2s ease;
}

.mode-option.selected .mode-icon {
    background: var(--accent-bg-08);
    border-color: var(--accent-border);
    color: var(--accent-ink);
}

.mode-details {
    flex: 1;
}

.mode-details h4 {
    margin: 0 0 var(--space-xs);
    font-size: 1.1rem;
}

.mode-details p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.875rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-md);
    margin-top: var(--space-xl);
}

.cancel-button {
    padding: var(--space-md) var(--space-lg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-soft);
    color: var(--text-color);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-button:hover {
    background: var(--background-muted);
}

.create-button {
    padding: var(--space-md) var(--space-lg);
    border: none;
    border-radius: var(--radius-md);
    background: var(--accent-solid);
    color: var(--on-accent-solid);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.create-button:hover {
    background: var(--primary-dark);
}

.create-button:disabled,
.cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (min-width: 768px) {
    .mode-options {
        flex-direction: row;
    }
    
    .mode-option {
        flex: 1;
    }
}
</style> 