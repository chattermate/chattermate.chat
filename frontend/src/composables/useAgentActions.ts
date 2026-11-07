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

import { computed, ref } from 'vue'
import { agentActionsService } from '@/services/agentActions'
import { apiErrorMessage } from '@/utils/apiError'
import type { AgentAction, AgentActionInput } from '@/types/agentActions'

/** State and calls for one agent's declared actions. */
export function useAgentActions(agentId: () => string) {
  const actions = ref<AgentAction[]>([])
  const cap = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const loadError = ref<string | null>(null)

  const atCap = computed(() => cap.value > 0 && actions.value.length >= cap.value)

  async function load() {
    loading.value = true
    loadError.value = null
    try {
      const result = await agentActionsService.list(agentId())
      actions.value = result.actions
      cap.value = result.cap
    } catch (error) {
      loadError.value = apiErrorMessage(error, "Couldn't load actions.")
    } finally {
      loading.value = false
    }
  }

  /** Create or update. Returns the saved action, or throws with a readable message. */
  async function save(input: AgentActionInput, existingId?: string): Promise<AgentAction> {
    saving.value = true
    try {
      if (existingId) {
        const saved = await agentActionsService.update(agentId(), existingId, input)
        actions.value = actions.value.map((a) => (a.id === saved.id ? saved : a))
        return saved
      }
      const saved = await agentActionsService.create(agentId(), input)
      actions.value = [...actions.value, saved]
      return saved
    } catch (error) {
      throw new Error(apiErrorMessage(error, "Couldn't save the action."))
    } finally {
      saving.value = false
    }
  }

  async function setEnabled(actionId: string, enabled: boolean): Promise<void> {
    try {
      const saved = await agentActionsService.setEnabled(agentId(), actionId, enabled)
      actions.value = actions.value.map((a) => (a.id === saved.id ? saved : a))
    } catch (error) {
      throw new Error(apiErrorMessage(error, "Couldn't update the action."))
    }
  }

  async function remove(actionId: string): Promise<void> {
    try {
      await agentActionsService.remove(agentId(), actionId)
      actions.value = actions.value.filter((a) => a.id !== actionId)
    } catch (error) {
      throw new Error(apiErrorMessage(error, "Couldn't delete the action."))
    }
  }

  return { actions, cap, atCap, loading, saving, loadError, load, save, setEnabled, remove }
}
