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

import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { Agent, AgentUpdate } from '@/types/agent'
import { agentService } from '@/services/agent'

export function useAgentAdvanced(agent: Ref<Agent>) {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasUnsavedChanges = ref(false)
  
  // Rate limiting settings - local state
  const localSettings = ref({
    enableRateLimiting: agent.value.enable_rate_limiting || false,
    overallLimitPerIp: String(agent.value.overall_limit_per_ip || 100),
    requestsPerSec: String(agent.value.requests_per_sec || 1)
  })
  
  // Watch for changes in the agent object to update local state
  watch(() => agent.value, (newAgent) => {
    localSettings.value = {
      enableRateLimiting: newAgent.enable_rate_limiting || false,
      overallLimitPerIp: String(newAgent.overall_limit_per_ip || 100),
      requestsPerSec: String(newAgent.requests_per_sec || 1)
    }
    hasUnsavedChanges.value = false
  })
  
  // Tooltip content
  const rateLimitTooltipContent = () => {
    return `Enable to:\n• Limit requests per IP address\n• Prevent abuse\n• Control traffic\n• Protect your API`
  }

  const dailyLimitTooltipContent = () => {
    return `Maximum number of requests allowed per IP address per day.\nRecommended: 100-500 for most use cases.`
  }

  const requestsPerSecTooltipContent = () => {
    return `Maximum requests per second allowed from a single IP address.\nUse whole numbers (1-10) for better control.`
  }
  
  // Toggle rate limiting with API call
  const toggleRateLimiting = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedData: AgentUpdate = {
        enable_rate_limiting: !localSettings.value.enableRateLimiting,
        // When enabling, set default values
        ...((!localSettings.value.enableRateLimiting) && {
          overall_limit_per_ip: 100,
          requests_per_sec: 1
        })
      }
      
      const updatedAgent = await agentService.updateAgent(agent.value.id, updatedData)
      
      // Update the agent reference and local settings with the new data
      agent.value = { ...agent.value, ...updatedAgent }
      localSettings.value = {
        enableRateLimiting: updatedAgent.enable_rate_limiting,
        overallLimitPerIp: String(updatedAgent.overall_limit_per_ip),
        requestsPerSec: String(updatedAgent.requests_per_sec)
      }
      hasUnsavedChanges.value = false
      
      return updatedAgent
    } catch (err) {
      error.value = 'Failed to update rate limiting setting'
      console.error('Toggle rate limiting error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Update local rate limit values
  const updateLocalValue = (type: 'overallLimitPerIp' | 'requestsPerSec', value: string) => {
    if (type === 'requestsPerSec') {
      // Ensure whole numbers for requests per second
      const numValue = parseInt(value)
      if (numValue < 1) value = '1'
      else if (numValue > 10) value = '10'
      else value = String(numValue)
    }
    
    localSettings.value = {
      ...localSettings.value,
      [type]: value
    }
    hasUnsavedChanges.value = true
  }
  
  // Save rate limit settings
  const saveRateLimitSettings = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedData: AgentUpdate = {
        overall_limit_per_ip: parseInt(localSettings.value.overallLimitPerIp),
        requests_per_sec: parseInt(localSettings.value.requestsPerSec)
      }
      
      const updatedAgent = await agentService.updateAgent(agent.value.id, updatedData)
      
      // Update the agent reference and local settings with the new data
      agent.value = { ...agent.value, ...updatedAgent }
      localSettings.value = {
        ...localSettings.value,
        overallLimitPerIp: String(updatedAgent.overall_limit_per_ip),
        requestsPerSec: String(updatedAgent.requests_per_sec)
      }
      hasUnsavedChanges.value = false
      
      return updatedAgent
    } catch (err) {
      error.value = 'Failed to update rate limit settings'
      console.error('Update rate limit settings error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    localSettings,
    isLoading,
    error,
    hasUnsavedChanges,
    rateLimitTooltipContent,
    dailyLimitTooltipContent,
    requestsPerSecTooltipContent,
    toggleRateLimiting,
    updateLocalValue,
    saveRateLimitSettings
  }
} 