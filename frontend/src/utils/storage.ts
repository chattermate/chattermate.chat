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

import type { Agent } from '@/types/agent'
import type { UserGroup } from '@/types/user'

// Define interfaces locally to avoid direct imports from enterprise module
// These will be used as fallbacks when enterprise module isn't available
interface BasePlan {
  id?: string
  name?: string
  max_agents?: number
  max_messages?: number
  max_knowledge_sources?: number
  max_sub_pages?: number
  data_retention_days?: number
  features?: Record<string, boolean>
}

interface BaseSubscription {
  id?: string
  status?: string
  plan?: BasePlan
  quantity?: number
  current_period_end?: string
  trial_end?: string
}

// Use these types throughout the file
type Plan = BasePlan
type CurrentSubscription = BaseSubscription

const STORAGE_KEYS = {
  ACTIVE_AGENT: 'active_agent',
  AGENTS: 'agents',
  CURRENT_SUBSCRIPTION: 'current_subscription',
  AVAILABLE_PLANS: 'available_plans',
} as const

export const agentStorage = {
  // Store all agents
  setAgents(agents: Agent[]): void {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents))
  },

  // Get all agents
  getAgents(): Agent[] {
    const stored = localStorage.getItem(STORAGE_KEYS.AGENTS)
    if (!stored) return []
    try {
      return JSON.parse(stored) as Agent[]
    } catch (e) {
      console.error('Failed to parse stored agents:', e)
      return []
    }
  },
  setAgent(agent: Agent): void {
    const agents = this.getAgents()
    const index = agents.findIndex((a) => a.id === agent.id)
    if (index !== -1) {
      agents[index] = agent
    }
  },

  // Update specific agent
  updateAgent(updatedAgent: Agent): void {
    const agents = this.getAgents()
    const index = agents.findIndex((a) => a.id === updatedAgent.id)
    if (index !== -1) {
      agents[index] = updatedAgent
      this.setAgents(agents)
    }
  },



  // Update agent knowledge
  updateAgentKnowledge(agentId: string, knowledge: Agent['knowledge']): void {
    const agents = this.getAgents()
    const index = agents.findIndex((a) => a.id === agentId)
    if (index !== -1) {
      agents[index] = {
        ...agents[index],
        knowledge: knowledge,
      }
      this.setAgents(agents)

      // Update active agent if it's the same one
      const activeAgent = this.getActiveAgent()
      if (activeAgent && activeAgent.id === agentId) {
        this.setActiveAgent(agents[index])
      }
    }
  },

  // Get active agent
  getActiveAgent(): Agent | null {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_AGENT)
    if (!stored) return null
    try {
      return JSON.parse(stored) as Agent
    } catch (e) {
      console.error('Failed to parse active agent:', e)
      return null
    }
  },

  // Set active agent
  setActiveAgent(agent: Agent): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_AGENT, JSON.stringify(agent))
  },

  // Clear all stored agent data
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_AGENT)
    localStorage.removeItem(STORAGE_KEYS.AGENTS)
  },
}

// Subscription storage
export const subscriptionStorage = {
  // Store current subscription
  setCurrentSubscription(subscription: CurrentSubscription | null): void {
    if (subscription) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SUBSCRIPTION, JSON.stringify(subscription))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SUBSCRIPTION)
    }
  },

  // Get current subscription
  getCurrentSubscription(): CurrentSubscription | null {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SUBSCRIPTION)
    if (!stored) return null
    try {
      return JSON.parse(stored) as CurrentSubscription
    } catch (e) {
      console.error('Failed to parse stored subscription:', e)
      return null
    }
  },

  // Store available plans
  setAvailablePlans(plans: Plan[]): void {
    localStorage.setItem(STORAGE_KEYS.AVAILABLE_PLANS, JSON.stringify(plans))
  },

  // Get available plans
  getAvailablePlans(): Plan[] {
    const stored = localStorage.getItem(STORAGE_KEYS.AVAILABLE_PLANS)
    if (!stored) return []
    try {
      return JSON.parse(stored) as Plan[]
    } catch (e) {
      console.error('Failed to parse stored plans:', e)
      return []
    }
  },

  // Clear subscription data
  clearSubscriptionData(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SUBSCRIPTION)
    localStorage.removeItem(STORAGE_KEYS.AVAILABLE_PLANS)
  },

  // Check if a feature is enabled in the current plan
  hasFeature(featureName: string): boolean {
    const subscription = this.getCurrentSubscription()
    if (!subscription?.plan?.features) {
      return false
    }
    
    return Boolean(subscription.plan.features[featureName])
  },

  // Check multiple features at once
  hasFeatures(featureNames: string[]): { [key: string]: boolean } {
    const subscription = this.getCurrentSubscription()
    const result: { [key: string]: boolean } = {}
    
    featureNames.forEach(featureName => {
      result[featureName] = subscription?.plan?.features?.[featureName] || false
    })
    
    return result
  },

  // Get all available features for the current plan
  getAllFeatures(): { [key: string]: boolean } {
    const subscription = this.getCurrentSubscription()
    return subscription?.plan?.features || {}
  },

  // Check if subscription is active (not expired or cancelled)
  isSubscriptionActive(): boolean {
    const subscription = this.getCurrentSubscription()
    if (!subscription) return false

    const now = new Date()
    
    // If cancelled, check if still within current period
    if (subscription.status === 'cancelled') {
      if (subscription.current_period_end) {
        const periodEnd = new Date(subscription.current_period_end)
        return now <= periodEnd
      }
      return false
    }
    
    // If trial, check if trial is still active
    if (subscription.status === 'trial' && subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end)
      return now <= trialEnd
    }
    
    // For active subscriptions
    return subscription.status === 'active'
  },

  // Get plan limits
  getPlanLimits(): {
    maxAgents: number | null
    maxKnowledgeSources: number
    maxSubPages: number
    dataRetentionDays: number
  } {
    const subscription = this.getCurrentSubscription()
    if (!subscription?.plan) {
      return {
        maxAgents: 0,
        maxKnowledgeSources: 0,
        maxSubPages: 0,
        dataRetentionDays: 0
      }
    }

    return {
      maxAgents: subscription.plan.max_agents ?? 0,
      maxKnowledgeSources: subscription.plan.max_knowledge_sources ?? 0,
      maxSubPages: subscription.plan.max_sub_pages ?? 0,
      dataRetentionDays: subscription.plan.data_retention_days ?? 0
    }
  },
}

// Workflow cache storage
export const workflowCacheStorage = {
  // Generate cache key for a workflow
  getCacheKey(workflowId: string): string {
    return `workflow_info_${workflowId}`
  },

  // Get workflow cache for a specific workflow
  getWorkflowCache(workflowId: string): any {
    const stored = localStorage.getItem(this.getCacheKey(workflowId))
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse workflow cache:', e)
      return null
    }
  },

  // Set workflow cache for a specific workflow
  setWorkflowCache(workflowId: string, data: any): void {
    const cacheData = {
      ...data,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(this.getCacheKey(workflowId), JSON.stringify(cacheData))
  },

  // Clear specific workflow cache
  clearWorkflowCache(workflowId: string): void {
    localStorage.removeItem(this.getCacheKey(workflowId))
  },

  // Clear all workflow caches (for cleanup)
  clearAllWorkflowCache(): void {
    // Find and remove all workflow cache keys
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('workflow_info_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  },

  // Update a single node in the cache
  updateNodeInCache(workflowId: string, node: any): void {
    const cache = this.getWorkflowCache(workflowId)
    if (!cache) return

    const nodeIndex = cache.nodes.findIndex((n: any) => n.id === node.id)
    if (nodeIndex !== -1) {
      cache.nodes[nodeIndex] = node
    } else {
      cache.nodes.push(node)
    }
    
    this.setWorkflowCache(workflowId, cache)
  },

  // Remove a node from the cache
  removeNodeFromCache(workflowId: string, nodeId: string): void {
    const cache = this.getWorkflowCache(workflowId)
    if (!cache) return
    console.log('Removing node from cache:', nodeId)
    
    cache.nodes = cache.nodes.filter((n: any) => n.id !== nodeId)
    // Also remove any connections involving this node
    cache.connections = cache.connections.filter((c: any) => 
      c.source_node_id !== nodeId && c.target_node_id !== nodeId
    )
    
    this.setWorkflowCache(workflowId, cache)
  },

  // Add a connection to the cache
  addConnectionToCache(workflowId: string, connection: any): void {
    const cache = this.getWorkflowCache(workflowId)
    if (!cache) return

    const existingIndex = cache.connections.findIndex((c: any) => c.id === connection.id)
    if (existingIndex !== -1) {
      cache.connections[existingIndex] = connection
    } else {
      cache.connections.push(connection)
    }
    
    this.setWorkflowCache(workflowId, cache)
  },

  // Remove a connection from the cache
  removeConnectionFromCache(workflowId: string, connectionId: string): void {
    const cache = this.getWorkflowCache(workflowId)
    if (!cache) return

    cache.connections = cache.connections.filter((c: any) => c.id !== connectionId)
    this.setWorkflowCache(workflowId, cache)
  }
}

// Create a composable for agent storage
export function useAgentStorage() {
  return {
    ...agentStorage,
  }
}

// Create a composable for workflow cache storage
export function useWorkflowCacheStorage() {
  return {
    ...workflowCacheStorage,
  }
}

// Create a composable for subscription storage
export function useSubscriptionStorage() {
  // Import enterprise types if available
  try {
    // This will be a dynamic import in the future when needed
    
    return {
      ...subscriptionStorage,
    }
  } catch (error) {
    console.warn('Enterprise module not available, using basic subscription storage')
    return {
      ...subscriptionStorage,
    }
  }
}
