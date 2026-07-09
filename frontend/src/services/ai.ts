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

import  api  from './api'
import type { AIConfigResponse, AISetupResponse, AIProvider } from '@/types/ai'

export interface AIConfig {
  model_type: string;
  model_name: string;
  api_key: string;
}

export const aiService = {
  async getProviders(): Promise<AIProvider[]> {
    const response = await api.get('/ai/providers')
    return response.data.providers
  },

  async getOrganizationConfig(): Promise<AIConfig> {
    const response = await api.get('/ai/config')
    return response.data
  },

  async setupAI(config: AIConfig): Promise<void> {
    await api.post('/ai/setup', config)
  },
  
  async updateAI(config: AIConfig): Promise<void> {
    await api.put('/ai/config', config)
  },
}
