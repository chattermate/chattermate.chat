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

import { ref } from 'vue'
import type { Agent } from '@/types/agent'
import { agentService } from '@/services/agent'
import { useAgentStorage } from '@/utils/storage'

export function useAgentEdit(agent: Agent) {
  const agentStorage = useAgentStorage()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Basic state
  const displayName = ref<string>(agent.display_name || agent.name)
  const isActive = ref<boolean>(agent.is_active)
  const instructions = ref<string[]>(
    Array.isArray(agent.instructions) ? [...agent.instructions] : [agent.instructions || ''],
  )

  // Instructions handlers
  const addInstruction = () => {
    instructions.value.push('')
  }

  const removeInstruction = (index: number) => {
    instructions.value.splice(index, 1)
  }
  
  // Generate instructions with AI
  const generateInstructions = async (prompt: string): Promise<string[]> => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await agentService.generateInstructions(prompt, instructions.value)
      return response
    } catch (err: any) {
      if (err?.response?.status === 429) {
        error.value = err?.response?.data?.detail || 'Rate limit exceeded. Please try again later.';
      } else {
        error.value = 'Failed to generate instructions'
      }
      console.error('Generate instructions error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Save handler
  const handleSave = async () => {
    try {
      isLoading.value = true
      error.value = null

      const updatedData = {
        display_name: displayName.value,
        is_active: isActive.value,
        instructions: instructions.value.filter((i) => i.trim()),
      }

      const updatedAgent = await agentService.updateAgent(agent.id, updatedData)
      agentStorage.updateAgent(updatedAgent)

      return updatedAgent
    } catch (err) {
      error.value = 'Failed to update agent'
      console.error('Save error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    displayName,
    isActive,
    instructions,
    isLoading,
    error,
    addInstruction,
    removeInstruction,
    generateInstructions,
    handleSave,
  }
}
