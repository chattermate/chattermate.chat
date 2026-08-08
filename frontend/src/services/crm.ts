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
import { apiPath } from '@/config/api'

export type CrmProvider = 'hubspot' | 'pipedrive'

export interface CrmConnection {
  provider: CrmProvider
  status: 'active' | 'expired' | 'revoked'
  display_name: string | null
  external_account_id: string
  last_error: string | null
  created_at: string | null
  recent_failures: number
}

export interface CrmTestResult {
  ok: boolean
  account_name: string | null
  error: string | null
}

export default {
  async listConnections(): Promise<CrmConnection[]> {
    const response = await api.get('/crm/connections')
    return response.data
  },

  /** Browser-navigation URL — the install endpoint replies with a redirect
   *  to the CRM's OAuth consent page.
   *
   *  Resolved at call time, like every other API URL: import.meta.env is baked
   *  at build time, so a self-hoster's window.APP_CONFIG.API_URL never reaches
   *  it and the browser leaves for the wrong host with no session cookie. */
  getInstallUrl(provider: CrmProvider): string {
    return apiPath(`/crm/${provider}/install`)
  },

  async testConnection(provider: CrmProvider): Promise<CrmTestResult> {
    const response = await api.post(`/crm/${provider}/test`)
    return response.data
  },

  async disconnect(provider: CrmProvider): Promise<void> {
    await api.delete(`/crm/${provider}`)
  },
}
