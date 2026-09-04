/*
 * Copyright 2024-2026 ChatterMate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Copy for the "New chat" control. Starting a new chat ends the current one for
 * good, so both surfaces (chat header and the Ask AI bar) ask the same question in
 * the same words, from here.
 */
export const NEW_CHAT_LABEL = 'Start a new chat'
export const NEW_CHAT_CONFIRM_QUESTION = 'Start a new chat? This ends the current one.'
export const NEW_CHAT_CONFIRM_ACTION = 'Start new chat'
export const NEW_CHAT_CANCEL_ACTION = 'Cancel'
export const NEW_CHAT_FAILED_TEXT = "Couldn't start a new chat. Please try again."

/** How long the confirmation stays up before it gives up on being answered. */
export const NEW_CHAT_CONFIRM_TIMEOUT_MS = 15000
