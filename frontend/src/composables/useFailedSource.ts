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
import { knowledgeService } from '@/services/knowledge'
import { userService } from '@/services/user'
import { newestFailedWebsite } from '@/composables/useCrawlCheck'
import type { QueueItem } from '@/types/knowledge'

// Once indexed knowledge has been seen there is nothing left to report until a reload
let learnedThisVisit = false

const DISMISSED_KEY = 'chattermate:failed-source-dismissed:v1'

const readDismissed = (): number | null => {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

/**
 * The website that failed to read, while the organization has learned nothing.
 *
 * A site that fails after the wizard's first look is only reported on the Test
 * step, so someone who has already moved on to the dashboard never hears of it
 * and runs an agent that answers from nothing. This keeps the reason in front
 * of them, with the way round it, until a source is indexed or they dismiss it.
 */
export function useFailedSource() {
  const failure = ref<QueueItem | null>(null)
  const dismissedId = ref<number | null>(readDismissed())

  const visible = computed(() => (failure.value && failure.value.id !== dismissedId.value ? failure.value : null))

  // Newest call wins: a slow earlier answer must not overwrite a later one.
  let latest = 0

  const refresh = async () => {
    // An organization that has learned something does not go back to knowing nothing.
    if (learnedThisVisit) return
    const orgId = userService.getCurrentUser()?.organization_id
    if (!orgId) return
    const call = ++latest
    try {
      const indexed = await knowledgeService.getKnowledgeByOrganization(orgId, 1, 1)
      if (call !== latest) return
      if ((indexed?.pagination?.total ?? indexed?.knowledge?.length ?? 0) > 0) {
        learnedThisVisit = true
        failure.value = null
        return
      }
      const queue = await knowledgeService.getOrgQueueItems(orgId)
      if (call !== latest) return
      const items = (queue?.queue_items ?? []) as QueueItem[]
      const crawling = items.some((i) => i.status === 'pending' || i.status === 'processing')
      failure.value = crawling ? null : newestFailedWebsite(items)
    } catch (err) {
      // No permission to see knowledge, or the call failed: say nothing.
      if (call === latest) failure.value = null
      console.error('Failed to check for an unreadable website:', err)
    }
  }

  const dismiss = () => {
    if (!failure.value) return
    dismissedId.value = failure.value.id
    try {
      localStorage.setItem(DISMISSED_KEY, String(failure.value.id))
    } catch {
      // Hidden for this visit; it may come back on the next one.
    }
  }

  return { failure: visible, refresh, dismiss }
}
