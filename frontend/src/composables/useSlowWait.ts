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

import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/** How long a first page may take before the step offers a way on. */
export const SLOW_FIRST_PAGE_MS = 120000

/**
 * True once something has been waited on for `afterMs`. `since` is when the
 * wait began (null when there is none), so leaving the step and coming back
 * doesn't start it over.
 */
export function useSlowWait(since: Ref<number | null>, afterMs: number) {
  const slow = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(
    since,
    (began) => {
      clearTimeout(timer)
      slow.value = false
      if (began === null) return
      const left = began + afterMs - Date.now()
      if (left <= 0) slow.value = true
      else timer = setTimeout(() => (slow.value = true), left)
    },
    { immediate: true },
  )
  onBeforeUnmount(() => clearTimeout(timer))

  return { slow }
}
