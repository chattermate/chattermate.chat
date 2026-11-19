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

import { AxiosError } from 'axios'
import { aiService } from '@/services/ai'

/**
 * Make sure the organization has an AI model before an agent is made. Hosted
 * builds switch on the managed ChatterMate AI (no key, the backend injects
 * it); open source needs the admin's own provider, so false means "ask for
 * it first".
 */
export async function ensureAiConfig(managedAvailable: boolean): Promise<boolean> {
  try {
    await aiService.getOrganizationConfig()
    return true
  } catch (err) {
    if (!(err instanceof AxiosError) || err.response?.status !== 404) throw err
    if (!managedAvailable) return false
    await aiService.setupAI({ model_type: 'CHATTERMATE', model_name: 'chattermate', api_key: '' })
    return true
  }
}
