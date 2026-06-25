<!--
ChatterMate - Notification List
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
import { ref, onMounted } from 'vue'
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
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                    </svg>
                </button>
                <button class="close-button" @click="emit('close')">&times;</button>
            </div>
        </div>

        <div class="drawer-content">
            <div v-if="isLoading" class="loading">
                Loading notifications...
            </div>

            <div v-else-if="error" class="error">
                {{ error }}
            </div>

            <div v-else-if="!notifications.length" class="empty">
                No notifications
            </div>

            <div v-else class="notifications">
                <div v-for="notification in notifications" :key="notification.id" class="notification-item"
                    :class="{ unread: !notification.is_read }" @click="markAsRead(notification.id)">
                    <div class="notification-header">
                        <img v-if="getNotificationIcon(notification.type.toLowerCase())"
                            :src="getNotificationIcon(notification.type.toLowerCase())" class="notification-type-icon"
                            :alt="notification.type" />
                        <div class="notification-time">
                            {{ formatTime(notification.created_at) }}
                        </div>
                    </div>
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notification-drawer {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: var(--bg2);
    border-left: 1px solid var(--o08);
    box-shadow: -20px 0 50px rgba(0, 0, 0, 0.4);
    transition: right 0.3s ease;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.notification-drawer.open {
    right: 0;
}

.drawer-header {
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--o08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg2);
}

.drawer-header h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    color: var(--text);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.refresh-button {
    background: var(--o05);
    border: 1px solid var(--o10);
    border-radius: 8px;
    cursor: pointer;
    padding: 6px;
    color: var(--muted);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.refresh-button:hover {
    background: var(--o10);
    color: var(--text);
    transform: scale(1.1);
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
    background: var(--o05);
    border: 1px solid var(--o10);
    font-size: 18px;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.2s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
}

.close-button:hover {
    background: var(--o10);
    color: var(--text);
}

.drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
}

.notification-item {
    margin: var(--space-sm);
    padding: var(--space-md);
    border-radius: 14px;
    background: var(--o05);
    border: 1px solid var(--o08);
    border-left: 3px solid var(--o12);
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;
    display: flex;
    flex-direction: column;
}

.notification-item:hover {
    transform: translateY(-1px);
    background: var(--o08);
}

.notification-item.unread {
    border-left-color: var(--accent-ink);
    background: rgba(201, 242, 78, 0.05);
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
    gap: var(--space-sm);
}

.notification-type-icon {
    width: 20px;
    height: 20px;
    color: var(--muted);
    flex-shrink: 0;
}

.notification-title {
    font-weight: 600;
    color: var(--text);
    margin-bottom: var(--space-xs);
    word-break: break-word;
}

.notification-message {
    font-size: var(--text-sm);
    color: var(--muted);
    word-break: break-word;
}

.notification-time {
    font-size: var(--text-xs);
    color: var(--text-color-lighter);
    white-space: nowrap;
}

.loading,
.error,
.empty {
    padding: var(--space-md);
    text-align: center;
    color: var(--text-color-light);
}
</style>