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
/**
 * Edit an agent's name (what visitors see), role line and description.
 * Emits the trimmed fields; the agent page saves them.
 */
import { ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

/** The backend's limits (AgentUpdate). */
const NAME_MAX = 100
const DESCRIPTION_MAX = 500

export interface AgentEdit {
  display_name: string
  name: string
  description: string
}

const props = defineProps<{
  displayName: string | null
  role: string
  description: string | null
  saving?: boolean
}>()

const emit = defineEmits<{ (e: 'close'): void; (e: 'save', edit: AgentEdit): void }>()

const draftName = ref(props.displayName || props.role)
const draftRole = ref(props.role)
const draftDescription = ref(props.description ?? '')

const submit = () => {
  const role = draftRole.value.trim()
  if (!role) return
  emit('save', {
    display_name: draftName.value.trim() || role,
    name: role,
    description: draftDescription.value.trim(),
  })
}
</script>

<template>
  <BaseModal title="Edit agent" width="480px" @close="emit('close')">
    <form id="agent-edit-form" class="ae-form" @submit.prevent="submit">
      <label class="ae-field">
        <span class="ae-label">Name</span>
        <input v-model="draftName" class="ae-input" :maxlength="NAME_MAX" data-autofocus placeholder="What visitors see, e.g. Ava">
      </label>
      <label class="ae-field">
        <span class="ae-label">Role</span>
        <input v-model="draftRole" class="ae-input" :maxlength="NAME_MAX" required placeholder="e.g. Sales &amp; Product Guide">
      </label>
      <label class="ae-field">
        <span class="ae-label">Description</span>
        <textarea v-model="draftDescription" class="ae-input ae-textarea" rows="3" :maxlength="DESCRIPTION_MAX" placeholder="What this agent is for"></textarea>
      </label>
    </form>
    <template #actions>
      <button type="button" class="btn btn-ghost" @click="emit('close')">Cancel</button>
      <button type="submit" form="agent-edit-form" class="btn btn-primary" :disabled="saving || !draftRole.trim()">Save</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.ae-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}

.ae-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ae-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
}

.ae-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--o12);
  border-radius: var(--radius-input);
  background: var(--o05);
  color: var(--text);
  font: inherit;
  font-size: 14px;
  box-sizing: border-box;
}

.ae-input:focus {
  outline: none;
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

.ae-textarea {
  resize: vertical;
  min-height: 60px;
  line-height: 1.5;
}
</style>
