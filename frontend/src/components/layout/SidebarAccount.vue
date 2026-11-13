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

<script setup lang="ts" name="SidebarAccount">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { navIconSvg, type NavItem } from './navItems'
import { useMyAvatar } from '@/composables/useMyAvatar'
import userAvatar from '@/assets/user.svg'
import type { User } from '@/types/user'

const props = defineProps<{
    user: User | null
    role: string
    isOnline: boolean
    statusUpdating: boolean
    collapsed: boolean
    /** Personal pages (User Settings, CLI & API tokens). */
    items: NavItem[]
}>()

const emit = defineEmits<{
    (e: 'toggle-status'): void
    (e: 'logout'): void
    (e: 'navigate'): void
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)

// Never the stored URL: the copy we hold was signed at login and expires an
// hour later. useMyAvatar asks the API, which signs on the spot.
const myAvatar = useMyAvatar(() => props.user?.profile_pic)
const avatarSrc = computed(() => (myAvatar.failed.value ? userAvatar : myAvatar.src.value ?? userAvatar))

const name = computed(() => props.user?.full_name || props.user?.email || '')
const statusText = computed(() => (props.isOnline ? 'Online' : 'Offline'))
const triggerLabel = computed(() => `Account menu: ${name.value}, ${statusText.value.toLowerCase()}`)

// The usable items, in order, for the menu's keyboard model
const menuItems = (): HTMLElement[] =>
    Array.from(menu.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])') ?? [])

const focusItem = (index: number) => {
    const items = menuItems()
    if (!items.length) return
    items[(index + items.length) % items.length].focus()
}

const openMenu = async (focusLast = false) => {
    open.value = true
    await nextTick()
    focusItem(focusLast ? -1 : 0)
}

/** Close; back to the trigger when the menu had focus (Escape, a pick). */
const close = (returnFocus = false) => {
    open.value = false
    if (returnFocus) trigger.value?.focus()
}

const onTriggerKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        openMenu(event.key === 'ArrowUp')
    }
}

// The WAI-ARIA menu pattern: arrows move, Home/End jump, Tab leaves
const onMenuKeydown = (event: KeyboardEvent) => {
    const items = menuItems()
    const current = items.indexOf(document.activeElement as HTMLElement)
    const moves: Record<string, number> = {
        ArrowDown: current + 1,
        ArrowUp: current - 1,
        Home: 0,
        End: items.length - 1,
    }
    if (event.key in moves) {
        event.preventDefault()
        focusItem(moves[event.key])
    } else if (event.key === 'Tab') {
        close()
    }
}

const onPointerDown = (event: PointerEvent) => {
    if (root.value && !root.value.contains(event.target as Node)) close()
}

const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close(true)
}

// Listen only while open: an idle menu costs nothing
watch(open, (isOpen) => {
    if (isOpen) {
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeydown)
    } else {
        document.removeEventListener('pointerdown', onPointerDown)
        document.removeEventListener('keydown', onKeydown)
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeydown)
})

const pick = (action: 'toggle-status' | 'logout' | 'navigate') => {
    close(action === 'toggle-status')
    if (action === 'toggle-status') emit('toggle-status')
    else if (action === 'logout') emit('logout')
    else emit('navigate')
}
</script>

<template>
    <div ref="root" class="account" :class="{ collapsed }">
        <button
            ref="trigger"
            type="button"
            class="account-trigger"
            :aria-label="triggerLabel"
            aria-haspopup="menu"
            :aria-expanded="open"
            :title="collapsed ? name : undefined"
            @click="open ? close() : openMenu()"
            @keydown="onTriggerKeydown"
        >
            <span class="avatar-wrap">
                <img :src="avatarSrc" alt="" class="avatar" @error="myAvatar.onError" />
                <span class="status-dot" :class="{ online: isOnline }" aria-hidden="true"></span>
            </span>
            <span v-if="!collapsed" class="account-text">
                <span class="account-name">{{ name }}</span>
                <span class="account-meta">{{ role }} · {{ statusText }}</span>
            </span>
            <span v-if="!collapsed" class="account-chevron" aria-hidden="true" v-html="navIconSvg('chevronsUpDown', 16)"></span>
        </button>

        <div v-if="open" ref="menu" class="account-menu" role="menu" :aria-label="name" @keydown="onMenuKeydown">
            <button
                type="button"
                class="menu-row"
                role="menuitemcheckbox"
                tabindex="-1"
                :aria-checked="isOnline"
                :disabled="statusUpdating"
                @click="pick('toggle-status')"
            >
                <span class="row-dot" :class="{ online: isOnline }" aria-hidden="true"></span>
                <span class="row-label">{{ isOnline ? "You're online" : "You're offline" }}</span>
                <span class="row-hint">{{ isOnline ? 'Go offline' : 'Go online' }}</span>
            </button>
            <div class="menu-divider" role="separator"></div>
            <router-link
                v-for="item in items"
                :key="item.to"
                :to="item.to!"
                class="menu-row"
                role="menuitem"
                tabindex="-1"
                @click="pick('navigate')"
            >
                <span class="row-icon" aria-hidden="true" v-html="navIconSvg(item.icon, 16)"></span>
                <span class="row-label">{{ item.label }}</span>
            </router-link>
            <div v-if="items.length" class="menu-divider" role="separator"></div>
            <button type="button" class="menu-row" role="menuitem" tabindex="-1" @click="pick('logout')">
                <span class="row-icon" aria-hidden="true" v-html="navIconSvg('logout', 16)"></span>
                <span class="row-label">Log out</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.account {
    position: relative;
}

.account-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border: 0;
    border-radius: var(--radius-input);
    background: transparent;
    color: var(--text);
    font-family: var(--font-sans);
    text-align: left;
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.account.collapsed .account-trigger {
    justify-content: center;
    padding: 4px 0;
}

.account-trigger:hover,
.account-trigger[aria-expanded='true'] {
    background: var(--o04);
}

.account-trigger:focus-visible {
    outline: none;
    box-shadow: var(--ring-focus);
}

.avatar-wrap {
    position: relative;
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    background: var(--grad-purple-teal);
}

.status-dot {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--muted);
    box-shadow: 0 0 0 2px var(--bg2);
}

.status-dot.online {
    background: var(--c-positive);
}

.account-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    white-space: nowrap;
}

.account-name {
    font-size: 13px;
    font-weight: var(--font-weight-semibold);
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
}

.account-meta {
    font-size: 12px;
    color: var(--muted);
    overflow: hidden;
    text-overflow: ellipsis;
}

.account-chevron {
    flex-shrink: 0;
    display: flex;
    color: var(--faint);
}

.account-menu {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(100% + 8px);
    z-index: var(--z-drawer);
    min-width: 220px;
    padding: 4px;
    background: var(--surface);
    border: 1px solid var(--o10);
    border-radius: var(--radius-input);
    box-shadow: var(--shadow-lg);
}

/* On the rail the menu opens beside the avatar instead of over it */
.account.collapsed .account-menu {
    left: calc(100% + 10px);
    right: auto;
    bottom: 0;
    width: 240px;
}

.menu-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    height: 36px;
    padding: 0 10px;
    border: 0;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--text2);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    text-align: left;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
}

.menu-row:hover:not(:disabled),
.menu-row:focus-visible {
    outline: none;
    background: var(--o06);
    color: var(--text);
}

.menu-row:disabled {
    cursor: progress;
    opacity: 0.7;
}

.row-icon {
    display: flex;
    flex-shrink: 0;
    color: var(--muted);
}

.row-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin: 0 4px;
    border-radius: 50%;
    background: var(--muted);
}

.row-dot.online {
    background: var(--c-positive);
}

.row-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.row-hint {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--faint);
}

.menu-divider {
    height: 1px;
    margin: 4px 0;
    background: var(--o08);
}
</style>
