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
import { Handle, Position } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'

defineProps<{
  data: Node['data']
}>()
</script>

<template>
  <div class="action-node">
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      class="node-handle"
    />
    
    <div class="node-content">
      <div class="node-header">
        <div class="node-icon">⚡</div>
        <div class="node-title">{{ data.label || 'Action' }}</div>
      </div>
      
      <div v-if="data.description" class="node-description">
        {{ data.description }}
      </div>
      
      <div v-if="data.config?.actionType" class="node-preview">
        <div class="preview-label">Action Type:</div>
        <div class="preview-content">{{ data.config.actionType }}</div>
      </div>
      
      <div v-if="data.config?.url" class="node-preview">
        <div class="preview-label">URL:</div>
        <div class="preview-content">
          {{ data.config.url.substring(0, 80) }}{{ data.config.url.length > 80 ? '...' : '' }}
        </div>
      </div>
    </div>
    
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="node-handle"
    />
  </div>
</template>

<style scoped>
.action-node {
  position: relative;
  background: var(--background-color);
  border: 2px solid #EF4444;
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  min-width: 200px;
  max-width: 300px;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.action-node:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.node-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.node-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.node-title {
  font-weight: 600;
  color: var(--text-color);
  font-size: var(--text-sm);
}

.node-description {
  color: var(--text-muted);
  font-size: 0.75rem;
  line-height: 1.3;
}

.node-preview {
  background: var(--background-soft);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
}

.preview-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 2px;
}

.preview-content {
  font-size: 0.7rem;
  color: var(--text-color);
  line-height: 1.3;
}

.node-handle {
  background: #EF4444;
  border: 2px solid var(--background-color);
  width: 12px;
  height: 12px;
}

.node-handle:hover {
  background: #DC2626;
  transform: scale(1.2);
}
</style> 