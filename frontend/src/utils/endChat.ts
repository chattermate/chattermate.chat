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
 * Rating is a web-widget-only feature. External channels (WhatsApp, Messenger,
 * Instagram, Telegram, ...) render plain text and have no rating UI, so asking
 * there leaves the customer a question they cannot answer. The backend applies
 * the same rule to AI-ended chats.
 */
export const canRequestRating = (channel?: string | null): boolean =>
  !channel || channel === 'web'

/** Closing message shown to the customer when an agent ends the chat. */
export const endChatMessage = (channel?: string | null): string =>
  canRequestRating(channel)
    ? 'Thank you for contacting us. Do you mind rating our service?'
    : 'Thank you for contacting us.'
