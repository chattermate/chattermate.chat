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
 * The setup wizard announces that the org's setup moved on (an agent, a
 * source, a finished run). Anything showing setup progress listens and
 * refreshes (the enterprise module's setup bar).
 */
export const SETUP_CHANGED_EVENT = 'chattermate:setup-changed'

export function notifySetupChanged(): void {
  window.dispatchEvent(new Event(SETUP_CHANGED_EVENT))
}

/**
 * Something other than the agent page changed an agent (the setup assistant
 * in the help drawer): a page showing it reloads it, so what it shows, and
 * what its next save sends, is current.
 */
export const AGENT_CHANGED_EVENT = 'chattermate:agent-changed'

export function notifyAgentChanged(agentId: string): void {
  window.dispatchEvent(new CustomEvent(AGENT_CHANGED_EVENT, { detail: { agentId } }))
}
