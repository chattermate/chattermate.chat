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
import { agentService } from '@/services/agent'
import { knowledgeService } from '@/services/knowledge'
import type { KnowledgeLinkedAgent } from '@/types/knowledge'
import type { ExplorerMode } from '@/composables/useKnowledgeExplorer'

/**
 * Which agents a knowledge source reaches. Agents answer only from sources
 * linked to them, so the explorer needs, per mode:
 * - org: the organization's agents, to ask which one a new source is for and
 *   to flag sources no agent uses;
 * - agent: how many sources the organization has, to point an agent with none
 *   linked at the ones it could use.
 */
export function useAgentKnowledgeCoverage(mode: ExplorerMode, organizationId: string) {
  const orgAgents = ref<KnowledgeLinkedAgent[]>([])
  const orgSourceCount = ref(0)
  const loaded = ref(false)

  const load = async () => {
    try {
      if (mode === 'org') {
        const agents = await agentService.getOrganizationAgents()
        orgAgents.value = (agents || []).map((a) => ({ id: a.id, name: a.display_name || a.name }))
      } else {
        const page = await knowledgeService.getKnowledgeByOrganization(organizationId, 1, 1)
        orgSourceCount.value = page?.pagination?.total ?? page?.knowledge?.length ?? 0
      }
    } catch (err) {
      // Coverage hints are advisory: without them the explorer still works.
      console.error('Failed to load knowledge coverage:', err)
    } finally {
      loaded.value = true
    }
  }

  return { orgAgents, orgSourceCount, loaded, load }
}
