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

import { shallowRef, toRaw, watch, type Ref } from 'vue'

const same = (a: unknown, b: unknown) => toRaw(a) === toRaw(b)

/**
 * Where a page or journey message sits in the chat. It isn't one of the messages
 * until it's answered, but it keeps the place it appeared in: whatever arrives
 * afterwards (a reply, a nudge, a human agent) goes below it, not above.
 */
export function usePromptPlace<T extends object>(
  messages: Ref<T[]>,
  prompt: Ref<{ message: string } | null | undefined>,
) {
  // The message it appeared after, and the first one to arrive since.
  let previous: T | undefined
  const following = shallowRef<T | null>(null)

  const placeAtEnd = () => {
    previous = messages.value[messages.value.length - 1]
    following.value = null
  }

  watch(() => prompt.value?.message, placeAtEnd)

  // History and a new chat replace the list: a place in the old one means nothing.
  watch(messages, (list) => {
    if (!following.value || !list.some((m) => same(m, following.value))) placeAtEnd()
  }, { flush: 'sync' })

  watch(() => messages.value.length, () => {
    if (!prompt.value || following.value) return
    const list = messages.value
    const next = list[list.findIndex((m) => same(m, previous)) + 1]
    if (next) following.value = next
  })

  /** It goes just before this message; null when nothing has arrived since. */
  const isBefore = (message: T) => !!prompt.value && same(message, following.value)
  const isLast = () => !!prompt.value && !following.value

  /** Where it belongs in the list once it joins the messages. */
  const index = () => {
    const at = messages.value.findIndex((m) => same(m, following.value))
    return at === -1 ? messages.value.length : at
  }

  return { isBefore, isLast, index }
}
