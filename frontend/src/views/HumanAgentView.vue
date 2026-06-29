<!--
ChatterMate - Human Agent View
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
import { ref, onMounted, nextTick } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import UserList from '@/components/human-agent/UserList.vue'
import GroupList from '@/components/human-agent/GroupList.vue'
import RoleList from '@/components/human-agent/RoleList.vue'
import { listUsers } from '@/services/users'
import { listGroups } from '@/services/groups'
import { listRoles } from '@/services/roles'

type Tab = 'users' | 'groups' | 'roles'
const activeTab = ref<Tab>('users')
const searchQuery = ref('')

const peopleCount = ref<number | null>(null)
const teamsCount = ref<number | null>(null)
const rolesCount = ref<number | null>(null)

const userListRef = ref<InstanceType<typeof UserList> | null>(null)

const loadCounts = async () => {
  try { peopleCount.value = (await listUsers()).length } catch { /* noop */ }
  try { teamsCount.value = (await listGroups()).length } catch { /* noop */ }
  try { rolesCount.value = (await listRoles()).length } catch { /* noop */ }
}
onMounted(loadCounts)

const onInvite = async () => {
  activeTab.value = 'users'
  await nextTick()
  userListRef.value?.openCreate?.()
}
</script>

<template>
  <DashboardLayout>
    <div class="human-agent-container">
      <!-- Page header -->
      <header class="page-header">
        <div class="title-block">
          <h1 class="page-title">Human Agents</h1>
          <p class="page-subtitle">The people behind your AI — who picks up when a conversation needs a human.</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4-4"></path></svg>
            <input v-model="searchQuery" placeholder="Search people…" />
          </div>
          <button class="invite-btn" @click="onInvite">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M19 8v6M22 11h-6"></path></svg>
            Invite agent
          </button>
        </div>
      </header>

      <!-- Pill tabs -->
      <nav class="tab-pills">
        <button :class="['tab-pill', { active: activeTab === 'users' }]" @click="activeTab = 'users'">
          People <span class="tab-badge" v-if="peopleCount !== null">{{ peopleCount }}</span>
        </button>
        <button :class="['tab-pill', { active: activeTab === 'groups' }]" @click="activeTab = 'groups'">
          Teams <span class="tab-badge" v-if="teamsCount !== null">{{ teamsCount }}</span>
        </button>
        <button :class="['tab-pill', { active: activeTab === 'roles' }]" @click="activeTab = 'roles'">
          Roles <span class="tab-badge" v-if="rolesCount !== null">{{ rolesCount }}</span>
        </button>
      </nav>

      <!-- Content -->
      <div class="content-area">
        <UserList v-if="activeTab === 'users'" ref="userListRef" :search-query="searchQuery" @changed="loadCounts" />
        <GroupList v-else-if="activeTab === 'groups'" :search-query="searchQuery" @changed="loadCounts" />
        <RoleList v-else-if="activeTab === 'roles'" :search-query="searchQuery" @changed="loadCounts" />
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.human-agent-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1180px;
  margin: 0 auto;
  width: 100%;
  padding: var(--space-lg) var(--space-md);
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.page-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
  color: var(--text);
}

.page-subtitle {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 14px;
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: var(--radius-btn);
  min-width: 220px;
  color: var(--muted2);
}

.search-box input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 14px;
  font-family: var(--font-sans);
}

.search-box input::placeholder {
  color: var(--muted2);
}

.invite-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  white-space: nowrap;
  transition: filter var(--transition-fast);
}

.invite-btn:hover {
  filter: brightness(1.05);
}

/* Pill tabs */
.tab-pills {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 12px;
  margin-bottom: 24px;
  align-self: flex-start;
}

.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  color: var(--muted);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.tab-pill:hover:not(.active) {
  color: var(--text2);
}

.tab-pill.active {
  background: var(--accent-bg-12);
  color: var(--accent-ink);
  font-weight: 600;
}

.tab-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 1px 7px;
  border-radius: var(--radius-pill);
  background: var(--o06);
  color: var(--muted2);
}

.tab-pill.active .tab-badge {
  background: var(--accent-bg-12);
  color: var(--accent-ink);
}

.content-area {
  flex: 1;
}

@media (max-width: 768px) {
  .header-actions {
    width: 100%;
  }
  .search-box {
    flex: 1;
  }
}
</style>
