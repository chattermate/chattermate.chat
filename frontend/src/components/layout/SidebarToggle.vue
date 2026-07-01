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
defineProps<{
    isCollapsed: boolean
}>()

defineEmits<{
    (e: 'toggle'): void
}>()
</script>

<template>
    <button class="toggle-btn" @click="$emit('toggle')">
        <span class="toggle-icon">{{ isCollapsed ? '▶' : '◀' }}</span>
    </button>
</template>

<style scoped>
.toggle-btn {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    background: var(--o05);
    border: 1px solid var(--o10);
    border-radius: 7px;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--transition-fast), color var(--transition-fast),
        border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.toggle-btn:hover {
    background: var(--o10);
    color: var(--text2);
}

.toggle-btn:focus-visible {
    outline: none;
    box-shadow: var(--ring-focus);
}

.toggle-icon {
    font-size: 12px;
    line-height: 1;
}
</style>