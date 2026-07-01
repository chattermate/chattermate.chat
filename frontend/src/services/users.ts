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
import type { User } from '@/types/user'

export interface TeamAgentStats {
  id: string
  full_name: string
  email: string
  profile_pic?: string | null
  is_online: boolean
  last_seen?: string | null
  is_active: boolean
  role?: string | null
  is_admin: boolean
  groups: string[]
  active_chats: number
  resolved_chats: number
  capacity: number
}

export interface TeamKpis {
  team_size: number
  admins: number
  agents: number
  online_now: number
  active_chats: number
  total_capacity: number
  waiting_handoff: number
  oldest_wait_minutes: number
}

export interface TeamOverview {
  kpis: TeamKpis
  agents: TeamAgentStats[]
}

export async function listUsers(): Promise<User[]> {
  const response = await api.get('users')
  return response.data
}

/**
 * Aggregated Human-Agents dashboard (KPIs + per-agent load/resolved).
 * Returns null if the backend endpoint isn't available yet (graceful fallback).
 */
export async function getTeamOverview(): Promise<TeamOverview | null> {
  try {
    const response = await api.get('users/team-overview')
    return response.data
  } catch (err) {
    return null
  }
}

export async function getUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export async function createUser(userData: Partial<User>): Promise<User> {
  const response = await api.post('users', userData)
  return response.data
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const response = await api.put(`users/${id}`, userData)
  return response.data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`users/${id}`)
}

export async function updateUserPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  await api.put(`users/${id}/password`, {
    current_password: currentPassword,
    new_password: newPassword
  })
}

export async function updateUserProfile(id: string, profileData: Partial<User>): Promise<User> {
  const response = await api.put(`users/${id}/profile`, profileData)
  return response.data
}

export async function uploadProfilePic(formData: FormData): Promise<User> {
  const response = await api.post('/users/me/profile-pic', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export async function updateUserStatus(id: string, isOnline: boolean): Promise<void> {
  await api.post(`/users/${id}/status`, { is_online: isOnline })
} 