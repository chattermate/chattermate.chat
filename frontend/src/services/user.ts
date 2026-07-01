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

import type { Role, User } from '@/types/user'
import api from './api'
import { uploadProfilePic } from './users'



export const userService = {
  userInfo: null as User | null,

  setCurrentUser(user: User) {
    this.userInfo = user
    localStorage.setItem('user_info', JSON.stringify(user))
  },
  getUserId(): string {
    return this.getCurrentUser()?.id || ''
  },

  getCurrentUser(): User | null {
    if (this.userInfo) return this.userInfo

    const storedUser = localStorage.getItem('user_info')
    if (storedUser) {
      try {
        this.userInfo = JSON.parse(storedUser)
        return this.userInfo
      } catch (err) {
        console.error('Failed to parse user info:', err)
        return null
      }
    }
    return null
  },

  clearCurrentUser() {
    this.userInfo = null
    localStorage.removeItem('user_info')
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser()
  },

  getUserName(): string {
    return this.getCurrentUser()?.full_name || ''
  },

  getUserEmail(): string {
    return this.getCurrentUser()?.email || ''
  },

  getUserRole(): string {
    return this.getCurrentUser()?.role?.name || 'User'
  },

  async updateFCMToken(token: string): Promise<unknown> {
    const response = await api.post('/users/token/fcm-token', { token })
    return response.data
  },

  async clearFCMToken(): Promise<unknown> {
    try {
      const response = await api.delete('/users/token/fcm-token')
      return response.data
    } catch (error) {
      console.error('Failed to clear FCM token:', error)
      // throw error
    }
  },

  async updateProfile(data: {
    full_name?: string
    email?: string
    current_password?: string
    password?: string
  }) {
    try {
      const response = await api.patch('/users/me', data)
      this.setCurrentUser(response.data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update profile')
    }
  },

  async uploadProfilePic(formData: FormData): Promise<void> {
    const user = await uploadProfilePic(formData)
    this.setCurrentUser(user)
  },
}
