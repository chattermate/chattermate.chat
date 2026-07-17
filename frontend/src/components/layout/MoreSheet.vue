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

<script setup lang="ts" name="MoreSheet">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNavItems, navIconSvg, formatBadgeCount } from './navItems'
import InstallPrompt from '@/components/pwa/InstallPrompt.vue'
import type { ThemeMode } from '@/composables/useTheme'

const props = defineProps<{
    open: boolean
    isOnline?: boolean
    statusUpdating?: boolean
    themeMode?: ThemeMode
    unreadCount?: number
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'toggle-status'): void
    (e: 'toggle-theme'): void
    (e: 'notifications'): void
    (e: 'logout'): void
}>()

const router = useRouter()
const { moreNavItems } = useNavItems()

const themeLabel = computed(() =>
    props.themeMode === 'dark' ? 'Dark' : props.themeMode === 'light' ? 'Light' : 'System'
)

const badgeText = computed(() => formatBadgeCount(props.unreadCount))

const navigate = (to?: string) => {
    if (!to) return
    emit('close')
    router.push(to)
}
</script>

<template>
    <Teleport to="body">
        <Transition name="more-sheet">
            <div v-if="open" class="more-sheet-root">
                <div class="more-scrim" @click="emit('close')"></div>
                <div class="more-sheet" role="dialog" aria-label="More">
                    <div class="drag-handle" aria-hidden="true"></div>

                    <!-- Availability -->
                    <button
                        type="button"
                        class="availability-card"
                        :class="{ offline: !isOnline }"
                        :disabled="statusUpdating"
                        @click="emit('toggle-status')"
                    >
                        <span class="availability-dot" :class="{ online: isOnline }"></span>
                        <span class="availability-text">
                            <span class="availability-title">{{ isOnline ? "You're online" : "You're offline" }}</span>
                            <span class="availability-sub">{{ isOnline ? 'Receiving new chats' : 'Not receiving new chats' }}</span>
                        </span>
                        <span class="toggle-track" :class="{ on: isOnline }">
                            <span class="toggle-knob"></span>
                        </span>
                    </button>

                    <!-- Theme -->
                    <button type="button" class="sheet-row standalone" @click="emit('toggle-theme')">
                        <span class="row-icon theme-icon" aria-hidden="true">
                            <svg v-if="themeMode === 'dark'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                            <svg v-else-if="themeMode === 'light'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                            <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        </span>
                        <span class="row-label">Theme</span>
                        <span class="row-value">{{ themeLabel }}</span>
                    </button>

                    <!-- Overflow nav links -->
                    <div class="sheet-card">
                        <button
                            v-for="item in moreNavItems"
                            :key="item.to"
                            type="button"
                            class="sheet-row"
                            @click="navigate(item.to)"
                        >
                            <span class="row-icon" v-html="navIconSvg(item.icon, 20)"></span>
                            <span class="row-label">{{ item.label }}</span>
                            <span class="row-chevron" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                            </span>
                        </button>
                    </div>

                    <!-- Notifications -->
                    <button type="button" class="sheet-row standalone" @click="emit('notifications')">
                        <span class="row-icon" v-html="navIconSvg('bell', 20)"></span>
                        <span class="row-label">Notifications</span>
                        <span v-if="unreadCount" class="row-badge">{{ badgeText }}</span>
                    </button>

                    <!-- Install as app (hidden once installed) -->
                    <div class="install-slot">
                        <InstallPrompt />
                    </div>

                    <!-- Logout -->
                    <button type="button" class="logout-row" @click="emit('logout')">
                        <span class="row-icon" v-html="navIconSvg('logout', 19)"></span>
                        Log out
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.more-sheet-root {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.more-scrim {
    position: absolute;
    inset: 0;
    background: var(--scrim);
    backdrop-filter: blur(2px);
}

.more-sheet {
    position: relative;
    background: var(--bg2);
    border-top: 1px solid var(--o07);
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    padding: 12px 18px calc(var(--space-lg) + var(--safe-bottom));
    box-shadow: var(--shadow-lg);
    max-height: calc(100dvh - 60px);
    overflow-y: auto;
}

.drag-handle {
    width: 38px;
    height: 5px;
    border-radius: 3px;
    background: var(--o10);
    margin: 0 auto 18px;
}

.availability-card {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 16px;
    background: var(--success-color-soft);
    border: 1px solid color-mix(in srgb, var(--success-color) 35%, transparent);
    margin-bottom: 14px;
    cursor: pointer;
    font-family: var(--font-sans);
    color: var(--text);
    text-align: left;
    transition: opacity var(--transition-fast);
}

.availability-card.offline {
    background: var(--o04);
    border-color: var(--o10);
}

.availability-card:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.availability-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--muted);
    flex-shrink: 0;
}

.availability-dot.online {
    background: var(--success-color);
    box-shadow: 0 0 0 4px var(--success-color-soft);
}

.availability-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.availability-title {
    font-weight: var(--font-weight-semibold);
    font-size: 15px;
}

.availability-sub {
    font-size: 12px;
    color: var(--muted);
}

.toggle-track {
    width: 48px;
    height: 28px;
    border-radius: 16px;
    background: var(--toggle-track-off);
    position: relative;
    flex-shrink: 0;
    transition: background-color var(--transition-fast);
}

.toggle-track.on {
    background: var(--success-color);
}

.toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--toggle-knob);
    transition: transform var(--transition-fast);
}

.toggle-track.on .toggle-knob {
    transform: translateX(20px);
}

.sheet-card {
    background: var(--o04);
    border: 1px solid var(--o07);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 14px;
}

.sheet-card .sheet-row + .sheet-row {
    border-top: 1px solid var(--o06);
}

.sheet-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 14px 16px;
    background: none;
    border: none;
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 15px;
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    text-align: left;
    transition: background-color var(--transition-fast);
    -webkit-tap-highlight-color: transparent;
}

.sheet-row:hover {
    background: var(--o05);
}

.sheet-row.standalone {
    background: var(--o04);
    border: 1px solid var(--o07);
    border-radius: 14px;
    margin-bottom: 14px;
}

.row-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text3);
    flex-shrink: 0;
}

.theme-icon {
    color: var(--c-purple);
}

.row-label {
    flex: 1;
    min-width: 0;
}

.row-value {
    color: var(--muted);
    font-size: 14px;
}

.row-chevron {
    color: var(--muted);
    display: flex;
}

.row-badge {
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    border-radius: 11px;
    background: var(--c-coral);
    color: var(--on-light);
    font-size: 12px;
    font-weight: var(--font-weight-bold);
    display: flex;
    align-items: center;
    justify-content: center;
}

.install-slot {
    margin-bottom: 14px;
}

.install-slot:empty {
    display: none;
}

.logout-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 13px;
    background: none;
    border: none;
    color: var(--c-coral);
    font-family: var(--font-sans);
    font-weight: var(--font-weight-semibold);
    font-size: 15px;
    cursor: pointer;
}

.logout-row .row-icon {
    color: inherit;
}

/* Slide-up transition */
.more-sheet-enter-active,
.more-sheet-leave-active {
    transition: opacity var(--transition-normal);
}

.more-sheet-enter-active .more-sheet,
.more-sheet-leave-active .more-sheet {
    transition: transform var(--transition-normal);
}

.more-sheet-enter-from,
.more-sheet-leave-to {
    opacity: 0;
}

.more-sheet-enter-from .more-sheet,
.more-sheet-leave-to .more-sheet {
    transform: translateY(100%);
}
</style>
