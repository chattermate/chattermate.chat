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

import { computed, onBeforeUnmount, watch, type Ref } from 'vue'
import { knowledgeService } from '@/services/knowledge'
import type { QueueItem } from '@/types/knowledge'

export const LEARNING_POLL_MS = 5000

/** Uploads are stored under a random prefix nobody chose. */
export const withoutUploadPrefix = (name: string) => name.replace(/^[0-9a-f]{32}_/, '')

export const isBeingRead = (item: { status: string }) =>
  item.status === 'pending' || item.status === 'processing'

export const isPdfSource = (item: QueueItem) => item.source_type.startsWith('pdf')

/** What a queue row is called on screen: a site or sitemap as is, a PDF by its
 *  own name, without the path, the signature on an S3 link, or the upload
 *  prefix. */
export const queueItemName = (item: QueueItem) => {
  if (!isPdfSource(item)) return item.source
  const [path] = item.source.split('?')
  return withoutUploadPrefix(path.split('/').pop() || item.source)
}

/**
 * The sources still being read, kept current while there are any. `onFinished`
 * gets the ids that stopped being read, whichever way it went.
 */
export function useLearningWatch(
  agentId: string,
  queueItems: Ref<QueueItem[]>,
  onFinished: (ids: number[]) => void,
) {
  const learning = computed(() => queueItems.value.filter(isBeingRead))
  let timer: ReturnType<typeof setInterval> | null = null

  const stop = () => {
    if (timer) clearInterval(timer)
    timer = null
  }

  // Only an answer stops the polling: a failed look says nothing about the crawl.
  const poll = async () => {
    try {
      const response = await knowledgeService.getAgentQueueItems(agentId)
      if (!timer) return
      queueItems.value = response?.queue_items ?? []
      if (!learning.value.length) stop()
    } catch (err) {
      console.error('Failed to check the knowledge queue:', err)
    }
  }

  watch(learning, (now, before) => {
    if (now.length && !timer) timer = setInterval(poll, LEARNING_POLL_MS)
    const finished = before.filter((b) => !now.some((n) => n.id === b.id)).map((b) => b.id)
    if (finished.length) onFinished(finished)
  })

  onBeforeUnmount(stop)

  return { learning }
}
