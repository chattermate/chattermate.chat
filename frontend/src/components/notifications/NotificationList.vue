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
import { ref, computed, onMounted } from 'vue'
import { notificationService, type Notification } from '@/services/notification'
import { getNotificationIcon } from './notificationIcons'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    close: [],
    'notification-read': []
}>()

const notifications = ref<Notification[]>([])
const isLoading = ref(false)
const error = ref('')

const fetchNotifications = async () => {
    try {
        isLoading.value = true
        notifications.value = await notificationService.getNotifications()
    } catch (err) {
        error.value = 'Failed to load notifications'
        console.error('Error fetching notifications:', err)
    } finally {
        isLoading.value = false
    }
}

const markAsRead = async (id: number) => {
    try {
        await notificationService.markAsRead(id)
        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
            notification.is_read = true
            emit('notification-read')
        }
    } catch (err) {
        console.error('Error marking notification as read:', err)
    }
}

const activeFilter = ref<'all' | 'unread'>('all')

const filteredNotifications = computed(() =>
    activeFilter.value === 'unread'
        ? notifications.value.filter(n => !n.is_read)
        : notifications.value
)

const hasUnread = computed(() => notifications.value.some(n => !n.is_read))

const markAllRead = async () => {
    const unread = notifications.value.filter(n => !n.is_read)
    for (const n of unread) {
        try {
            await notificationService.markAsRead(n.id)
            n.is_read = true
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
    }
    if (unread.length) emit('notification-read')
}

const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // Less than a minute
    if (diff < 60000) {
        return 'just now'
    }

    // Less than an hour
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000)
        return `${mins} min ago`
    }

    // Less than a day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000)
        return `${hours}h ago`
    }

    // Show date
    return date.toLocaleDateString()
}

onMounted(fetchNotifications)
</script>

<template>
    <div class="notification-drawer" :class="{ open: isOpen }">
        <div class="drawer-header">
            <h3>Notifications</h3>
            <div class="header-actions">
                <button
                    class="refresh-button"
                    @click="fetchNotifications"
                    :disabled="isLoading"
                    :class="{ 'loading': isLoading }"
                    title="Refresh"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                    </svg>
                </button>
                <button class="close-button" @click="emit('close')" title="Close">&times;</button>
            </div>
        </div>

        <div class="drawer-filter">
            <div class="filter-tabs">
                <button class="filter-tab" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">All</button>
                <button class="filter-tab" :class="{ active: activeFilter === 'unread' }" @click="activeFilter = 'unread'">Unread</button>
            </div>
            <button class="mark-all" :disabled="!hasUnread" @click="markAllRead">Mark all read</button>
        </div>

        <div class="drawer-content">
            <div v-if="isLoading" class="state-message">
                Loading notifications...
            </div>

            <div v-else-if="error" class="state-message">
                {{ error }}
            </div>

            <div v-else-if="!filteredNotifications.length" class="empty-state">
                <div class="empty-title">You're all caught up</div>
                <div class="empty-sub">No {{ activeFilter === 'unread' ? 'unread ' : '' }}notifications.</div>
            </div>

            <div v-else class="notifications">
                <div v-for="notification in filteredNotifications" :key="notification.id" class="notification-item"
                    :class="{ unread: !notification.is_read }" @click="markAsRead(notification.id)">
                    <span class="notification-icon-wrap">
                        <img v-if="getNotificationIcon(notification.type.toLowerCase())"
                            :src="getNotificationIcon(notification.type.toLowerCase())" class="notification-type-icon"
                            :alt="notification.type" />
                    </span>
                    <div class="notification-body">
                        <div class="notification-top">
                            <span class="notification-title">{{ notification.title }}</span>
                            <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
                        </div>
                        <div class="notification-message">{{ notification.message }}</div>
                    </div>
                    <span class="unread-dot" :class="{ on: !notification.is_read }"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notification-drawer {
    position: fixed;
    top: 0;
    right: -380px;
    width: 380px;
    max-width: 90vw;
    height: 100vh;
    background: var(--bg2);
    border-left: 1px solid var(--o08);
    transition: right 0.3s ease;
    z-index: var(--z-drawer);
    display: flex;
    flex-direction: column;
}

.notification-drawer.open {
    right: 0;
    /* Only while open. Parked at right:-380px the panel is off-screen, but a
       shadow cast 20px leftward with a 50px blur still reaches ~45px back onto
       the page, above the content — and this drawer is mounted by
       DashboardLayout on every screen, so the band followed you everywhere.
       Invisible on the dark theme, a grey edge on the light one. */
    box-shadow: -20px 0 50px rgba(0, 0, 0, 0.4);
}

.drawer-header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--o07);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg2);
}

.drawer-header h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: var(--font-weight-bold);
    color: var(--text);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.refresh-button {
    background: transparent;
    border: 1px solid var(--o12);
    border-radius: 8px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    color: var(--muted);
    transition: background-color 0.2s ease, color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.refresh-button:hover {
    background: var(--o06);
    color: var(--text);
}

.refresh-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.refresh-button.loading svg {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.close-button {
    background: transparent;
    border: 1px solid var(--o12);
    font-size: 15px;
    cursor: pointer;
    color: var(--muted);
    transition: background-color 0.2s ease, color 0.2s ease;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
}

.close-button:hover {
    background: var(--o06);
    color: var(--text);
}

/* Filter row */
.drawer-filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 18px;
    border-bottom: 1px solid var(--o07);
}

.filter-tabs {
    display: flex;
    gap: 4px;
    padding: 3px;
    background: var(--surface);
    border: 1px solid var(--o08);
    border-radius: 9px;
}

.filter-tab {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 5px 13px;
    border-radius: 6px;
    color: var(--muted);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    transition: background-color 0.15s ease, color 0.15s ease;
}

.filter-tab.active {
    background: var(--accent-bg-12);
    color: var(--accent-ink);
}

.mark-all {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--accent-ink);
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    transition: filter 0.15s ease, opacity 0.15s ease;
}

.mark-all:hover:not(:disabled) {
    filter: brightness(1.1);
}

.mark-all:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.drawer-content {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--o05);
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.notification-item:hover {
    background: var(--o03);
}

.notification-item.unread {
    background: var(--accent-bg-06);
}

.notification-icon-wrap {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
}

.notification-type-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    filter: var(--icon-filter, brightness(0) invert(1));
    opacity: var(--icon-opacity, 0.55);
}

.notification-body {
    flex: 1;
    min-width: 0;
}

.notification-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
}

.notification-title {
    font-size: 14px;
    font-weight: var(--font-weight-semibold);
    color: var(--text2);
    word-break: break-word;
}

.notification-time {
    font-size: 11px;
    color: var(--muted2);
    flex-shrink: 0;
    white-space: nowrap;
}

.notification-message {
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.5;
    margin-top: 3px;
    word-break: break-word;
}

.unread-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: transparent;
    margin-top: 6px;
}

.unread-dot.on {
    background: var(--accent-solid);
}

.state-message {
    padding: var(--space-md);
    text-align: center;
    color: var(--muted2);
}

.empty-state {
    padding: 60px 24px;
    text-align: center;
}

.empty-title {
    font-size: 14px;
    color: var(--muted2);
    margin-bottom: 4px;
}

.empty-sub {
    font-size: 12.5px;
    color: var(--faint);
}

/* Mobile: full-screen panel per design */
@media (max-width: 768px) {
    .notification-drawer {
        width: 100%;
        max-width: 100vw;
        right: -100vw;
        height: 100vh;
        height: 100dvh;
        border-left: none;
    }

    .notification-drawer.open {
        right: 0;
    }

    .drawer-header {
        padding-top: calc(20px + var(--safe-top));
    }

    .drawer-content {
        padding-bottom: var(--safe-bottom);
    }
}
</style>