<!--
ChatterMate - Modal
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
defineProps<{
  title?: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <slot name="title"></slot>
        </h3>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <slot name="content"></slot>
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
  z-index: 100;
}

.modal-content {
  background: var(--background-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  min-width: 400px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 600;
  margin: 0;
 
}

.close-button {
  background: none;
  border: none;
  font-size: var(--text-2xl);
  cursor: pointer;
  padding: var(--space-xs);
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.close-button:hover {
  opacity: 1;
}

.modal-body {
  margin-top: var(--space-md);
}
</style> 