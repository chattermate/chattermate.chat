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
import { onMounted, computed } from 'vue'
import Modal from '@/components/common/Modal.vue'
import GroupForm from './GroupForm.vue'
import { useGroups } from '@/composables/useGroups'
import type { User, UserGroup } from '@/types/user'

const props = defineProps<{
  searchQuery?: string
}>()

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const {
  groups,
  users,
  loading,
  error,
  showCreateModal,
  showEditModal,
  showMembersModal,
  showDeleteModal,
  selectedGroup,
  selectedUsers,
  fetchGroups,
  handleCreateGroup,
  handleEditGroup,
  handleUpdateGroup,
  handleManageMembers,
  handleUserSelection,
  handleDeleteGroup,
  handleDeleteConfirm
} = useGroups()

// Wrap create/delete to emit `changed` for the parent view's counters.
const onCreateGroup = async (groupData: Partial<UserGroup>) => {
  await handleCreateGroup(groupData)
  emit('changed')
}

const onDeleteConfirm = async () => {
  await handleDeleteConfirm()
  emit('changed')
}

// Filter cards by group name (case-insensitive).
const filteredGroups = computed(() => {
  const q = (props.searchQuery || '').trim().toLowerCase()
  if (!q) return groups.value
  return groups.value.filter(g => g.name.toLowerCase().includes(q))
})

const onlineCount = (group: UserGroup) =>
  group.users?.filter(u => u.is_online).length || 0

const memberCount = (group: UserGroup) => group.users?.length || 0

// Up to ~4 avatars in the stack.
const stackedMembers = (group: UserGroup) => (group.users || []).slice(0, 4)

const initials = (user: User) => {
  const name = (user.full_name || '').trim()
  if (!name) return '?'
  const parts = name.split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Deterministic accent per member, from the design palette tokens.
const avatarPalette = [
  'var(--c-purple)',
  'var(--c-coral)',
  'var(--c-online)',
  'var(--accent-ink)'
]
const avatarColor = (user: User) => {
  let hash = 0
  for (const ch of user.id || user.full_name || '') {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  }
  return avatarPalette[hash % avatarPalette.length]
}

onMounted(fetchGroups)
</script>

<template>
  <div class="group-list">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">Loading groups...</div>

    <div v-else class="teams-grid">
      <div v-for="group in filteredGroups" :key="group.id" class="team-card">
        <div class="card-header">
          <div class="team-name">{{ group.name }}</div>
          <span class="online-badge" :class="{ active: onlineCount(group) > 0 }">
            <span class="online-dot"></span>
            <span class="online-text">{{ onlineCount(group) }} online</span>
          </span>
        </div>

        <p v-if="group.description" class="team-desc">{{ group.description }}</p>
        <p v-else class="team-desc no-desc">No description</p>

        <div class="card-footer">
          <div class="members">
            <div class="avatar-stack">
              <div
                v-for="(member, i) in stackedMembers(group)"
                :key="member.id"
                class="avatar"
                :style="{ background: avatarColor(member), marginLeft: i ? '-9px' : '0' }"
                :title="member.full_name"
              >
                {{ initials(member) }}
              </div>
            </div>
            <span class="member-count">
              {{ memberCount(group) }} {{ memberCount(group) === 1 ? 'agent' : 'agents' }}
            </span>
          </div>
          <button class="manage-btn" @click="handleManageMembers(group)">Manage</button>
        </div>

        <!-- Hidden edit/delete affordances preserved on the card via context actions -->
        <div class="card-actions">
          <button class="card-action" title="Edit team" @click="handleEditGroup(group)">Edit</button>
          <button class="card-action delete" title="Delete team" @click="handleDeleteGroup(group)">Delete</button>
        </div>
      </div>

      <!-- Create a team (dashed) card -->
      <button class="create-card" @click="showCreateModal = true">
        <span class="create-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span class="create-title">Create a team</span>
        <span class="create-sub">Group agents by skill or channel</span>
      </button>
    </div>

    <!-- Create Group Modal -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #title>Create Group</template>
      <template #content>
        <GroupForm
          @submit="onCreateGroup"
          @cancel="showCreateModal = false"
        />
      </template>
    </Modal>

    <!-- Edit Group Modal -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #title>Edit Group</template>
      <template #content>
        <GroupForm
          :group="selectedGroup"
          @submit="handleUpdateGroup"
          @cancel="showEditModal = false"
        />
      </template>
    </Modal>

    <!-- Manage Members Modal -->
    <Modal v-if="showMembersModal" @close="showMembersModal = false">
      <template #title>Manage Members</template>
      <template #content>
        <div class="members-list">
          <div v-for="user in users" :key="user.id" class="member-item">
            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="selectedUsers.includes(user.id)"
                @change="handleUserSelection(user.id, ($event.target as HTMLInputElement).checked)"
                :disabled="loading"
              />
              <div class="user-info">
                <span class="user-name">{{ user.full_name }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </label>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #title>Delete Group</template>
      <template #content>
        <div class="delete-confirmation">
          <p>Are you sure you want to delete "{{ selectedGroup?.name }}"?</p>
          <p class="warning">This action cannot be undone.</p>
          <div class="form-actions">
            <button class="btn btn-secondary" @click="showDeleteModal = false">
              Cancel
            </button>
            <button class="btn btn-danger" @click="onDeleteConfirm">
              Delete
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.group-list {
  width: 100%;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 18px;
}

/* ── Team card ───────────────────────────────────────── */
.team-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  transition: border-color var(--transition-fast);
}

.team-card:hover {
  border-color: var(--o14);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.team-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 17.5px;
  letter-spacing: -0.01em;
  color: var(--text);
}

.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--o05);
  border: 1px solid var(--o10);
  flex-shrink: 0;
}

.online-badge.active {
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
}

.online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
}

.online-badge.active .online-dot {
  background: var(--c-online);
  box-shadow: 0 0 6px var(--c-online);
}

.online-text {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--muted);
}

.online-badge.active .online-text {
  color: var(--c-online);
}

.team-desc {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.55;
  margin: 12px 0 16px;
  flex: 1;
}

.no-desc {
  opacity: 0.7;
  font-style: italic;
}

/* ── Footer ──────────────────────────────────────────── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--o07);
}

.members {
  display: flex;
  align-items: center;
  gap: 11px;
}

.avatar-stack {
  display: flex;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 11.5px;
  color: var(--on-accent-solid);
  border: 2px solid var(--surface);
}

.member-count {
  font-size: 13px;
  color: var(--muted);
}

.manage-btn {
  padding: 9px 16px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: var(--radius-chip);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.manage-btn:hover {
  background: var(--o10);
}

/* Edit / delete affordances revealed on hover */
.card-actions {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.team-card:hover .card-actions {
  opacity: 1;
}

.card-action {
  padding: 3px 9px;
  font-size: 11.5px;
  font-weight: 500;
  border-radius: var(--radius-chip);
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.card-action:hover {
  background: var(--o10);
  color: var(--text);
}

.card-action.delete:hover {
  color: var(--c-coral);
  border-color: var(--c-coral);
}

/* ── Create a team card ──────────────────────────────── */
.create-card {
  background: transparent;
  border: 1.5px dashed var(--o16);
  border-radius: 18px;
  padding: 24px;
  min-height: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--muted2);
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.create-card:hover {
  border-color: var(--c-lime);
  color: var(--c-lime);
}

.create-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--o05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.create-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text2);
}

.create-sub {
  font-size: 12.5px;
  color: var(--muted2);
}

/* ── States ──────────────────────────────────────────── */
.error-message {
  color: var(--error-color);
  text-align: center;
  padding: var(--space-lg);
}

.loading {
  text-align: center;
  padding: var(--space-xl);
  opacity: 0.7;
}

/* ── Manage-members modal ────────────────────────────── */
.members-list {
  max-height: 400px;
  overflow-y: auto;
  margin: var(--space-md) 0;
}

.member-item {
  padding: var(--space-sm);
  border-bottom: 1px solid var(--o08);
}

.member-item:last-child {
  border-bottom: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
}

.user-email {
  font-size: var(--text-sm);
  opacity: 0.7;
}

/* ── Delete-confirm modal ────────────────────────────── */
.delete-confirmation {
  text-align: center;
  padding: var(--space-lg);
}

.delete-confirmation p {
  margin-bottom: var(--space-md);
}

.warning {
  color: var(--error-color);
  font-size: var(--text-sm);
  margin-top: var(--space-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.btn-danger {
  background: transparent;
  border: 1px solid rgba(255, 138, 115, 0.3);
  color: var(--c-coral);
}

.btn-danger:hover {
  background: rgba(255, 138, 115, 0.1);
}
</style>
