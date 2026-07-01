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
  <div class="condition-node">
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      class="node-handle"
    />
    
    <div class="node-content">
      <div class="node-header">
        <div class="node-icon">🔀</div>
        <div class="node-title">{{ data.label || 'Condition' }}</div>
      </div>
      
      <div v-if="data.description" class="node-description">
        {{ data.description }}
      </div>
      
      <div v-if="data.config?.condition" class="node-preview">
        <div class="preview-label">Condition:</div>
        <div class="preview-content">
          {{ data.config.condition.substring(0, 80) }}{{ data.config.condition.length > 80 ? '...' : '' }}
        </div>
      </div>
    </div>
    
    <Handle
      id="true"
      type="source"
      :position="Position.Right"
      :style="{ top: '30%' }"
      class="node-handle true-handle"
    />
    <div class="handle-label true-label">True</div>
    
    <Handle
      id="false"
      type="source"
      :position="Position.Right"
      :style="{ top: '70%' }"
      class="node-handle false-handle"
    />
    <div class="handle-label false-label">False</div>
  </div>
</template>

<style scoped>
.condition-node {
  position: relative;
  background: var(--background-color);
  border: 2px solid #F59E0B;
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  min-width: 200px;
  max-width: 300px;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.condition-node:hover {
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
  background: #F59E0B;
  border: 2px solid var(--background-color);
  width: 12px;
  height: 12px;
}

.node-handle.true-handle {
  background: #10B981;
}

.node-handle.false-handle {
  background: #EF4444;
}

.node-handle:hover {
  transform: scale(1.2);
}

.handle-label {
  position: absolute;
  right: -35px;
  font-size: 0.6rem;
  color: var(--text-muted);
  font-weight: 500;
  pointer-events: none;
}

.true-label {
  top: 25%;
  color: #10B981;
}

.false-label {
  top: 65%;
  color: #EF4444;
}
</style> 