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
import { onMounted } from 'vue'
import type { TicketListFilters } from '@/types/ticket'
import { useUsers } from '@/composables/useUsers'

defineProps<{ filters: TicketListFilters }>()

const STATUS_PILLS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'breaching', label: 'SLA breaching' },
  { value: 'resolved', label: 'Resolved' },
]

const AI_PILLS = [
  { value: 'all', label: 'All AI', color: 'var(--muted)' },
  { value: 'investigating', label: 'Investigating', color: 'var(--c-info)' },
  { value: 'awaiting', label: 'Awaiting human', color: 'var(--c-warn)' },
  { value: 'human', label: 'Human-owned', color: 'var(--c-neutral)' },
  { value: 'resolved', label: 'AI-resolved', color: 'var(--c-positive)' },
]

const { users, fetchUsers } = useUsers()
onMounted(() => {
  fetchUsers().catch(() => {})
})
</script>

<template>
  <div class="filter-bar">
    <div class="pill-group">
      <button
        v-for="pill in STATUS_PILLS"
        :key="pill.value"
        class="pill"
        :class="{ active: filters.status === pill.value }"
        @click="filters.status = pill.value"
      >
        {{ pill.label }}
      </button>
    </div>

    <select v-model="filters.priority" class="filter-select">
      <option value="all">Priority · All</option>
      <option value="urgent">Urgent</option>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </select>

    <select v-model="filters.assignee" class="filter-select">
      <option value="all">Assignee · All</option>
      <option value="unassigned">Unassigned / AI</option>
      <option v-for="user in users" :key="user.id" :value="user.id">
        {{ user.full_name || user.email }}
      </option>
    </select>

    <div class="pill-group">
      <button
        v-for="pill in AI_PILLS"
        :key="pill.value"
        class="pill with-dot"
        :class="{ active: filters.ai === pill.value }"
        @click="filters.ai = pill.value"
      >
        <span class="dot" :style="{ background: pill.color }"></span>{{ pill.label }}
      </button>
    </div>

    <div class="search-wrap">
      <span class="search-glyph"></span>
      <input v-model="filters.search" class="search-input" placeholder="Search tickets…" />
    </div>

    <select v-model="filters.sort" class="filter-select">
      <option value="updated">Sort · Updated</option>
      <option value="created">Newest</option>
      <option value="priority">Priority</option>
    </select>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.pill-group {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 10px;
}
.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  background: transparent;
  color: var(--muted);
}
.pill.active {
  background: var(--o10);
  color: var(--text);
  font-weight: var(--font-weight-semibold);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.filter-select {
  padding: 8px 11px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 9px;
  color: var(--text);
  font-size: 12.5px;
  cursor: pointer;
}
.search-wrap {
  position: relative;
  margin-left: auto;
}
.search-glyph {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  width: 11px;
  height: 11px;
  border: 1.5px solid var(--faint);
  border-radius: 50%;
}
.search-input {
  width: 190px;
  padding: 8px 12px 8px 30px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 9px;
  color: var(--text);
  font-size: 12.5px;
  outline: none;
}
.search-input:focus {
  border-color: var(--o16);
}
</style>
