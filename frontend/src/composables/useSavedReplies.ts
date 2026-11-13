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
import { savedReplyService, type SavedReply, type SavedReplyInput } from '@/services/savedReplies'

// One list for the app: the inbox's picker and the settings page share it, so
// a reply saved from the composer is in the picker at once
const replies = ref<SavedReply[]>([])
const loaded = ref(false)
let loading: Promise<void> | null = null

function sorted(list: SavedReply[]): SavedReply[] {
  return [...list].sort((a, b) => a.title.localeCompare(b.title))
}

/** The team's saved replies, loaded once and kept current by this tab's edits. */
export function useSavedReplies() {
  async function load(force = false): Promise<void> {
    if (loaded.value && !force) return
    loading ??= savedReplyService.list()
      .then((list) => { replies.value = sorted(list); loaded.value = true })
      .finally(() => { loading = null })
    return loading
  }

  async function create(input: SavedReplyInput): Promise<SavedReply> {
    const reply = await savedReplyService.create(input)
    replies.value = sorted([...replies.value, reply])
    return reply
  }

  async function update(id: number, input: SavedReplyInput): Promise<SavedReply> {
    const reply = await savedReplyService.update(id, input)
    replies.value = sorted(replies.value.map((r) => (r.id === id ? reply : r)))
    return reply
  }

  async function remove(id: number): Promise<void> {
    await savedReplyService.remove(id)
    replies.value = replies.value.filter((r) => r.id !== id)
  }

  return { replies, loaded, load, create, update, remove }
}

/** For tests: forget the list between them. */
export function resetSavedReplies(): void {
  replies.value = []
  loaded.value = false
  loading = null
}
