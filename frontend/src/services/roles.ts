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

import type { Role } from '@/types/user'
import api from './api'

export interface Permission {
  id: number
  name: string
  description: string
}

export async function listRoles(): Promise<Role[]> {
    const response = await api.get('/roles')
    return response.data
}

export async function getRole(id: string): Promise<Role> {
  const response = await api.get(`/roles/${id}`)
  return response.data
}

export async function listPermissions(): Promise<Permission[]> {
  const response = await api.get('/roles/permissions/all')
  return response.data
}

export async function createRole(roleData: Partial<Role>): Promise<Role> {
  const response = await api.post('roles', roleData)
  return response.data
}

export async function updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
  const response = await api.put(`roles/${id}`, roleData)
  return response.data
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`roles/${id}`)
} 