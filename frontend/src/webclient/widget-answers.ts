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
 * Answer options an agent turns on for the redesigned widget, in
 * customization_metadata.answers (the server reads the same keys, in
 * app/services/widget_answers.py).
 */

import type { AgentCustomization } from '../types/agent'

export const ANSWERS_KEY = 'answers'
export const FOLLOW_UPS_KEY = 'follow_ups'

/** Whether the agent suggests follow-up questions under its answers. */
export const followUpsOn = (customization: Partial<AgentCustomization> | null | undefined): boolean =>
    customization?.customization_metadata?.[ANSWERS_KEY]?.[FOLLOW_UPS_KEY] === true

/** The metadata with follow-ups turned on or off, every other key kept. */
export function withFollowUpsSetting(metadata: Record<string, any> | null | undefined, on: boolean): Record<string, any> {
    const current = metadata || {}
    return { ...current, [ANSWERS_KEY]: { ...(current[ANSWERS_KEY] || {}), [FOLLOW_UPS_KEY]: on } }
}
