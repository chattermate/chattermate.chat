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

import { onBeforeUnmount, ref } from 'vue'
import { toast } from 'vue-sonner'

export const COPIED_FOR_MS = 2000

/**
 * Copy text to the clipboard. The button itself says it worked, for a
 * moment (`copied`); a failure gets a toast. Each copy restarts the moment.
 */
export function useCopyFeedback(copiedForMs: number = COPIED_FOR_MS) {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  onBeforeUnmount(() => clearTimeout(timer))

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy to clipboard')
      return false
    }
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), copiedForMs)
    return true
  }

  return { copied, copy }
}
