<!--
ChatterMate - Sidebar Toggle
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