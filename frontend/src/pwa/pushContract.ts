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

/**
 * The message contract between the service worker (src/sw.ts) and the page
 * (src/composables/useNotifications.ts). Both sides import from here so a
 * rename can never silently break background toasts or notification taps.
 */
export const SW_MESSAGE = {
  /** SW → page: a background push arrived; page shows the in-app toast state */
  BACKGROUND_NOTIFICATION: 'BACKGROUND_NOTIFICATION',
  /** SW → page: user tapped a notification the SW couldn't navigate() itself */
  OPEN_CONVERSATION: 'OPEN_CONVERSATION',
} as const

/** The one place the conversation deep-link URL is spelled. */
export const CONVERSATIONS_PATH = '/conversations'

export const conversationSessionUrl = (sessionId?: string | null): string =>
  sessionId ? `${CONVERSATIONS_PATH}?session=${encodeURIComponent(sessionId)}` : '/'
