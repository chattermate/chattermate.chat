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

import { onBeforeUnmount, onMounted } from 'vue'

export interface InboxShortcutHandlers {
  /** J: the next conversation */
  next: () => void
  /** K: the previous one */
  previous: () => void
  /** E: close the open conversation */
  close: () => void
  /** /: the search box */
  search: () => void
  /** Esc: shut the details drawer */
  dismiss: () => void
  /** ?: the shortcuts sheet */
  help: () => void
}

/** The inbox's single-key shortcuts, for the help sheet and aria-keyshortcuts */
export const INBOX_SHORTCUTS: ReadonlyArray<{ keys: string; action: string }> = [
  { keys: 'J', action: 'Next conversation' },
  { keys: 'K', action: 'Previous conversation' },
  { keys: 'E', action: 'Close the conversation' },
  { keys: '/', action: 'Search' },
  { keys: 'Esc', action: 'Close the details panel' },
  { keys: '?', action: 'Show these shortcuts' },
]

/** Typing somewhere, or a dialog is open: a letter is text, not a command. */
function keysBelongElsewhere(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.isComposing) return true
  if (event.ctrlKey || event.metaKey || event.altKey) return true
  const target = event.target instanceof Element ? event.target : null
  if (target?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return true
  return !!document.querySelector('[role="dialog"][aria-modal="true"], [role="menu"]')
}

const KEYS: Record<string, keyof InboxShortcutHandlers> = {
  j: 'next',
  k: 'previous',
  e: 'close',
  '/': 'search',
  Escape: 'dismiss',
  '?': 'help',
}

export function useInboxShortcuts(handlers: InboxShortcutHandlers) {
  const onKeydown = (event: KeyboardEvent) => {
    const name = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
    if (!name) return
    // Escape still closes the drawer from inside it; letters never do
    if (name !== 'dismiss' && keysBelongElsewhere(event)) return
    if (name === 'dismiss' && document.querySelector('[role="dialog"][aria-modal="true"], [role="menu"]')) return
    event.preventDefault()
    handlers[name]()
  }

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}
