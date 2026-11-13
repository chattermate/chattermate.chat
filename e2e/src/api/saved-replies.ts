import type { ApiClient } from './client'
import type { Schemas } from './types'

export type SavedReply = Schemas['SavedReplyOut']

/** Adds an org-wide saved reply. Shortcuts are unique per org, so pass a unique one. */
export async function createSavedReply(
  api: ApiClient,
  reply: { title: string; body: string; shortcut?: string },
): Promise<SavedReply> {
  return api.post<SavedReply>('/saved-replies', { data: reply })
}

/** The org's saved replies, newest first. */
export async function savedReplies(api: ApiClient): Promise<SavedReply[]> {
  return api.get<SavedReply[]>('/saved-replies')
}

export async function deleteSavedReply(api: ApiClient, id: number): Promise<void> {
  await api.delete(`/saved-replies/${id}`)
}

/** Removes the reply a test saved through the UI, found by its shortcut. */
export async function deleteSavedReplyByShortcut(api: ApiClient, shortcut: string): Promise<void> {
  const saved = (await savedReplies(api)).find((reply) => reply.shortcut === shortcut)
  if (saved) await deleteSavedReply(api, saved.id)
}
