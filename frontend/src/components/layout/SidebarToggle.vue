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
import { navIconSvg } from './navIcons'

defineProps<{
    isCollapsed: boolean
}>()

defineEmits<{
    (e: 'toggle'): void
}>()
</script>

<template>
    <button
        type="button"
        class="toggle-btn"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!isCollapsed"
        @click="$emit('toggle')"
        v-html="navIconSvg('panelLeft', 16)"
    ></button>
</template>

<style scoped>
.toggle-btn {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    padding: 0;
    background: transparent;
    border: 1px solid var(--o08);
    border-radius: var(--radius-md);
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

.toggle-btn :deep(svg) {
    display: block;
}
</style>