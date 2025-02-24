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
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import UserList from '@/components/human-agent/UserList.vue'
import GroupList from '@/components/human-agent/GroupList.vue'
import RoleList from '@/components/human-agent/RoleList.vue'

const activeTab = ref('users') // users, groups, roles
</script>

<template>
  <DashboardLayout>
    <div class="human-agent-container">
      <!-- Tab Navigation -->
      <nav class="tab-nav">
        <button 
          :class="['tab-btn', { active: activeTab === 'users' }]"
          @click="activeTab = 'users'"
        >
          Users
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'groups' }]"
          @click="activeTab = 'groups'"
        >
          Groups
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'roles' }]"
          @click="activeTab = 'roles'"
        >
          Roles
        </button>
      </nav>

      <!-- Content Area -->
      <div class="content-area">
        <UserList v-if="activeTab === 'users'" />
        <GroupList v-if="activeTab === 'groups'" />
        <RoleList v-if="activeTab === 'roles'" />
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.human-agent-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
}

.tab-nav {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  color: var(--text-color);
  opacity: 0.7;
  cursor: pointer;
  font-size: var(--text-base);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-normal);
}

.tab-btn:hover {
  opacity: 1;
}

.tab-btn.active {
  opacity: 1;
  border-bottom-color: var(--primary-color);
}

.content-area {
  flex: 1;
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}
</style> 