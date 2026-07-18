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

interface TakeoverCandidate {
  status?: string | null
  user_id?: string | null
}

/**
 * Whether a chat is claimable: still open, and nobody holds it.
 *
 * Covers both an AI-handled conversation (status open, no user) and one the AI
 * has queued for a human (status transferred). Single source of truth — the
 * chat pane and the info panel each carried their own version, and the pane's
 * narrower one meant the only way to claim an AI chat was via the info panel.
 *
 * Mirrors the backend guard: takeover_session refuses once user_id is set, so
 * offering the action for a chat another agent holds would only ever fail.
 */
export function canTakeOverChat(chat?: TakeoverCandidate | null): boolean {
  if (!chat) return false
  return chat.status !== 'closed' && !chat.user_id
}
