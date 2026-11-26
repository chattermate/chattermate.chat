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
import { knowledgeService } from '@/services/knowledge'

/** A source as a list shows it: indexed (knowledge), or still in the queue. */
export interface RemovableSource {
  knowledgeId?: number | null
  queueId?: number
  /** Other agents use it too: this one lets go of it, they keep it. */
  shared?: boolean
}

/**
 * Taking a source off an agent from the Teach step. A site can be removed while
 * it is read: the server drops the run and the worker stops. Removed runs are
 * remembered so one leaving the queue isn't mistaken for one that finished.
 */
export function useSourceRemoval(agentId: string, onRemoved: () => Promise<unknown>) {
  const removing = ref(false)
  const removedQueueIds = new Set<number>()
  const removalError = ref<string | null>(null)

  const remove = async ({ knowledgeId, queueId, shared }: RemovableSource) => {
    if (removing.value) return
    removing.value = true
    removalError.value = null
    if (queueId) removedQueueIds.add(queueId)
    try {
      if (knowledgeId && shared) await knowledgeService.unlinkFromAgent(knowledgeId, agentId)
      else if (knowledgeId) await knowledgeService.deleteKnowledge(knowledgeId)
      else if (queueId) await knowledgeService.deleteQueueItem(queueId)
    } catch (err) {
      console.error('Failed to remove the source:', err)
      removalError.value = "We couldn't remove that source. Try again in a moment."
      if (queueId) removedQueueIds.delete(queueId)
    }
    // Either way: a failure may mean the list is out of date
    try {
      await onRemoved()
    } finally {
      removing.value = false
    }
  }

  return { remove, removing, removedQueueIds, removalError }
}
