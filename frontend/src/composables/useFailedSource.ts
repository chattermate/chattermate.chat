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
import { newestPerSource } from '@/composables/useCrawlCheck'
import type { QueueItem } from '@/types/knowledge'

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

  const refresh = async () => {
    const orgId = userService.getCurrentUser()?.organization_id
    if (!orgId) return
    try {
      const [queue, indexed] = await Promise.all([
        knowledgeService.getOrgQueueItems(orgId),
        knowledgeService.getKnowledgeByOrganization(orgId, 1, 1),
      ])
      const items = newestPerSource((queue?.queue_items ?? []) as QueueItem[])
      const learned = (indexed?.pagination?.total ?? indexed?.knowledge?.length ?? 0) > 0
      const crawling = items.some((i) => i.status === 'pending' || i.status === 'processing')
      failure.value = learned || crawling
        ? null
        : items.find((i) => i.status === 'failed' && i.source_type === 'website') ?? null
    } catch (err) {
      // No permission to see knowledge, or the call failed: say nothing.
      failure.value = null
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
