<!--
ChatterMate - Widget Apps Settings
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
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import WidgetAppList from '@/components/widget-app/WidgetAppList.vue'
</script>

<template>
  <DashboardLayout>
    <div class="dashboard-container">
      <div class="settings-section">
        <WidgetAppList />
      </div>
    </div>
  </DashboardLayout>
</template>

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
</style>
