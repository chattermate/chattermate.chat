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
 * The line under the agent's name in the widget header.
 *
 * It used to be the hardcoded "Online · replies instantly" — asserted at 3am
 * with everyone logged off, on an agent whose AI never answers. What the widget
 * may honestly claim depends on who has to reply:
 *
 * - the AI answers → it really is instant, around the clock
 * - a person has to answer → only true inside the organization's business hours
 *
 * Availability is decided server-side from business hours alone. `is_online` is
 * set at login and cleared only on logout or a manual toggle, so it reports
 * people who closed a tab days ago as present.
 */
export type PresenceMode = 'ai' | 'human'

export interface WidgetPresence {
  mode?: PresenceMode
  available?: boolean
}

export interface PresenceLine {
  text: string
  online: boolean
}

/** The words for each case; the redesigned widget brings its own (webclient/copy.ts). */
export interface PresenceWording {
  ai: string
  human: string
  away: string
}

export const PRESENCE_TEXT: PresenceWording = {
  ai: 'Online · replies instantly',
  human: 'Online · usually replies in a few minutes',
  away: "Away · we'll reply when we're back",
}

/**
 * @param presence  what the server said when the widget loaded
 * @param handedOverToHuman  a person has taken this conversation over, so the
 *   AI is no longer answering it whatever the agent is configured to do
 * @param wording  the words to use (the classic widget's by default)
 */
export function presenceLine(
  presence?: WidgetPresence | null,
  handedOverToHuman = false,
  wording: PresenceWording = PRESENCE_TEXT,
): PresenceLine {
  // Absent presence means an older widget payload: keep the previous wording
  // rather than declaring the team away on no evidence.
  const mode: PresenceMode = handedOverToHuman ? 'human' : (presence?.mode ?? 'ai')

  if (mode === 'ai') {
    return { text: wording.ai, online: true }
  }

  const available = presence?.available !== false
  return available
    ? { text: wording.human, online: true }
    : { text: wording.away, online: false }
}
