/*
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
*/

import api from './api'

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  notification_metadata?: Record<string, any>
  is_read: boolean
  created_at: string
}

export const notificationService = {
  async getNotifications(skip = 0, limit = 50): Promise<Notification[]> {
    const response = await api.get(`/notifications?skip=${skip}&limit=${limit}`)
    return response.data
  },

  async markAsRead(notificationId: number): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`)
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count')
    return response.data.count
  },
}
