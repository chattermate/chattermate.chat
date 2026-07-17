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
import type { PeopleListResponse, PeopleStats, PersonDetail } from '@/types/people'

export interface ListPeopleParams {
  stage?: string
  search?: string
  page?: number
  page_size?: number
  /** 'identified' (default) or 'anonymous' — the identity split */
  view?: string
}

export const peopleService = {
  async listPeople(params: ListPeopleParams = {}): Promise<PeopleListResponse> {
    const response = await api.get('/people', { params })
    return response.data
  },

  async getStats(): Promise<PeopleStats> {
    const response = await api.get('/people/stats')
    return response.data
  },

  async getPerson(customerId: string): Promise<PersonDetail> {
    const response = await api.get(`/people/${customerId}`)
    return response.data
  },

  async markAsCustomer(customerId: string): Promise<PersonDetail> {
    const response = await api.post(`/people/${customerId}/mark-customer`)
    return response.data
  },

  /** Explicit human edit — the one path allowed to correct a phone. */
  async updatePerson(
    customerId: string,
    payload: { full_name?: string; phone?: string },
  ): Promise<PersonDetail> {
    const response = await api.patch(`/people/${customerId}`, payload)
    return response.data
  },
}
