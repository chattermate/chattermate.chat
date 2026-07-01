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
import type { OrganizationCreate, OrganizationResponse, OrganizationUpdate } from '@/types/organization'
import type { AxiosError } from 'axios'
import { userService } from './user'
import type { Organization } from '@/types/organization'


interface ErrorResponse {
  detail: string
}

export const createOrganization = async (data: OrganizationCreate) => {
  const response = await api.post<OrganizationResponse>('/organizations', data)

  // Store user info if available in response
  if (response.data.user) {
    userService.setCurrentUser(response.data.user)
  }

  return response.data
}

export async function getSetupStatus(): Promise<boolean> {
  try {
    const response = await api.get<{ is_setup: boolean }>('/organizations/setup-status')
    return response.data.is_setup
  } catch (err) {
    console.error('Failed to fetch organization setup status:', err)
    // In case of error, assume setup might be needed or system is unavailable
    // Returning true might prevent setup, returning false allows setup check again.
    return false 
  }
}

export const organizationService = {
  async getOrganization(id: string): Promise<Organization> {
    const response = await api.get(`/organizations/${id}`)
    return response.data
  },

  async updateOrganization(id: string, data: OrganizationUpdate): Promise<Organization> {
    const response = await api.patch(`/organizations/${id}`, data)
    return response.data
  },

  async getOrganizationStats(id: string) {
    const response = await api.get(`/organizations/${id}/stats`)
    return response.data
  }
}
