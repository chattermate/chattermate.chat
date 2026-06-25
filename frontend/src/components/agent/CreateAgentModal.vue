<!--
ChatterMate - Create Agent Modal
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
                                <div class="mode-icon">🤖</div>
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
                                <div class="mode-icon">🔀</div>
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
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: var(--background-base);
    border-radius: var(--radius-md);
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
    background: var(--primary-color);
    color: #0B0C10;
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