<!--
ChatterMate - A I Config Settings
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

<template>
  <DashboardLayout>
    <div class="dashboard-container">
      <div class="settings-section">
        <AISetup @ai-setup-complete="handleSetupComplete" />
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AISetup from '@/components/ai/AISetup.vue'

const handleSetupComplete = () => {
  // Optionally handle completion
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100%;
  position: relative;
}

.settings-section {
  flex: 1;
  padding: var(--space-lg);
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-header h1 {
  font-size: var(--text-2xl);
  color: var(--text-color);
  margin-bottom: var(--space-sm);
}

.description {
  color: var(--text-color);
  opacity: 0.7;
}
</style> 