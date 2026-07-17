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

<script setup lang="ts" name="BottomNav">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNavItems, navIconSvg, formatBadgeCount } from './navItems'

const props = defineProps<{
    unreadCount?: number
    moreOpen?: boolean
}>()

const emit = defineEmits<{
    (e: 'more'): void
}>()

const route = useRoute()
const { primaryNavItems, moreNavItems } = useNavItems()

const isActive = (path?: string) => !!path && route.path.startsWith(path)

// More is "active" while its sheet is open or when the current page lives in it
const moreActive = computed(() =>
    props.moreOpen || moreNavItems.value.some(item => isActive(item.to))
)

const badgeText = computed(() => formatBadgeCount(props.unreadCount))
</script>

<template>
    <nav class="bottom-nav" aria-label="Primary">
        <router-link
            v-for="item in primaryNavItems"
            :key="item.to"
            :to="item.to!"
            class="bottom-nav-item"
            :class="{ active: isActive(item.to) }"
        >
            <span class="bottom-nav-icon" v-html="navIconSvg(item.icon, 24)"></span>
            <span class="bottom-nav-label">{{ item.label }}</span>
        </router-link>

        <button
            type="button"
            class="bottom-nav-item"
            :class="{ active: moreActive }"
            aria-label="More"
            @click="emit('more')"
        >
            <span class="bottom-nav-icon" v-html="navIconSvg('more', 24)"></span>
            <span class="bottom-nav-label">More</span>
            <span v-if="unreadCount" class="bottom-nav-badge">{{ badgeText }}</span>
        </button>
    </nav>
</template>

<style scoped>
.bottom-nav {
    display: none;
}

@media (max-width: 768px) {
    .bottom-nav {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 900;
        display: flex;
        justify-content: space-between;
        background: var(--bg2);
        border-top: 1px solid var(--o07);
        padding: 6px 14px calc(6px + var(--safe-bottom));
    }
}

.bottom-nav-item {
    position: relative;
    flex: 1;
    min-height: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 2px 0;
    background: none;
    border: none;
    color: var(--muted);
    text-decoration: none;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: color var(--transition-fast);
    -webkit-tap-highlight-color: transparent;
}

.bottom-nav-item.active {
    color: var(--accent-ink);
}

.bottom-nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.bottom-nav-icon :deep(svg) {
    width: 24px;
    height: 24px;
    display: block;
    stroke-width: 1.8;
}

.bottom-nav-label {
    font-size: 11px;
    font-weight: var(--font-weight-medium);
    line-height: 1;
}

.bottom-nav-item.active .bottom-nav-label {
    font-weight: var(--font-weight-semibold);
}

.bottom-nav-badge {
    position: absolute;
    top: 2px;
    left: calc(50% + 6px);
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    background: var(--c-danger);
    color: var(--on-dark);
    border: 1.5px solid var(--bg2);
    border-radius: var(--radius-pill);
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: var(--font-weight-bold);
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
