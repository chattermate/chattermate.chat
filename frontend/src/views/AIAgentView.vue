<!--
ChatterMate - A I Agent View
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
import { ref, defineAsyncComponent } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Lazy load the AIAgentSetup component
const AIAgentSetup = defineAsyncComponent(() => 
  import('@/components/aiagent/AIAgentSetup.vue')
)

const selectedModel = ref('openai')
const isWorkflowFullscreen = ref(false)

// Handle fullscreen toggle from workflow editor
const handleWorkflowFullscreenToggle = (isFullscreen: boolean) => {
    isWorkflowFullscreen.value = isFullscreen
}
</script>

<template>
    <DashboardLayout :hide-sidebar="isWorkflowFullscreen" :hide-header="isWorkflowFullscreen">
        <div class="dashboard-container">
            <!-- Main Chat Area -->
            <div class="chat-section">
                <AIAgentSetup :model="selectedModel" @toggle-fullscreen="handleWorkflowFullscreenToggle" />
            </div>
        </div>
    </DashboardLayout>
</template>

<style scoped>
.dashboard-container {
    display: flex;
    min-height: 100%;
    position: relative;
}

.chat-section {
    flex: 1;
    min-width: 0;
}
</style>