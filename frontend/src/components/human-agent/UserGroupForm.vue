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
import { ref, onMounted } from 'vue'
import type { User } from '@/types/user'
import { listGroups } from '@/services/groups'
import type { UserGroup } from '@/types/user'

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  close: []
  groupToggle: [groupId: string, checked: boolean]
}>()

const groups = ref<UserGroup[]>([])
const loading = ref(false)
const selectedGroups = ref<string[]>(props.user.groups?.map(g => g.id) || [])

const fetchGroups = async () => {
  try {
    loading.value = true
    groups.value = await listGroups()
  } catch (err) {
    console.error('Failed to load groups:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchGroups)
</script>

<template>
  <div class="groups-form">
    <div v-if="loading" class="loading">Loading groups...</div>
    <div v-else class="groups-list">
      <div v-for="group in groups" :key="group.id" class="group-item">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="selectedGroups.includes(group.id)"
            @change="$emit('groupToggle', group.id, ($event.target as HTMLInputElement).checked)"
            :disabled="loading"
          />
          <div class="group-info">
            <span class="group-name">{{ group.name }}</span>
            <span v-if="group.description" class="group-description">{{ group.description }}</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.groups-form {
  padding: var(--space-md);
}

.groups-list {
  max-height: 400px;
  overflow-y: auto;
}

.group-item {
  padding: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
}

.group-item:last-child {
  border-bottom: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
}

.group-info {
  display: flex;
  flex-direction: column;
}

.group-name {
  font-weight: 500;
}

.group-description {
  font-size: var(--text-sm);
  opacity: 0.7;
}

.loading {
  text-align: center;
  padding: var(--space-xl);
  opacity: 0.7;
}
</style> 