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

import type { Ref } from 'vue'
import type { QueueItem } from '@/types/knowledge'

const normalizeSource = (source: string) => source.trim().toLowerCase().replace(/\/+$/, '')
const sameSource = (a: string, b: string) => normalizeSource(a) === normalizeSource(b)

/** The newest row for each source: a retry must not be judged by the old failure.
 *  The queue API lists newest first. */
export const newestPerSource = (items: QueueItem[]) => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = normalizeSource(item.source)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** The website whose newest attempt failed, if any. PDFs are reported where they were picked. */
export const newestFailedWebsite = (items: QueueItem[]) =>
  newestPerSource(items).find((item) => item.status === 'failed' && item.source_type === 'website') ?? null

/**
 * Whether any just-sent source has already failed - a domain that doesn't
 * exist is refused the moment it is added. One look, no waiting: every other
 * failure only shows once the crawl has run (often minutes), so holding the
 * wizard for it would delay every site that reads fine. Later failures are
 * reported on the Test step.
 */
export function useCrawlCheck(fetchQueueItems: () => Promise<unknown>, queueItems: Ref<QueueItem[]>) {
  let cancelled = false

  /** The first of `sources` that has already failed, or null. */
  const firstFailure = async (sources: string[]): Promise<QueueItem | null> => {
    cancelled = false
    try {
      await fetchQueueItems()
    } catch (err) {
      // Not knowing is not a failure: move on, the Test step will tell.
      console.error('Failed to check the knowledge queue:', err)
      return null
    }
    if (cancelled) return null
    const mine = newestPerSource(queueItems.value).filter((item) => sources.some((s) => sameSource(s, item.source)))
    return mine.find((item) => item.status === 'failed') ?? null
  }

  /** Ignore the answer (the user went Back, or the step unmounted). */
  const cancel = () => {
    cancelled = true
  }

  return { firstFailure, cancel }
}
