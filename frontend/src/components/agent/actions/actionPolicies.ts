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

import type { ActionConfirmPolicy, AgentActionInput } from '@/types/agentActions'

/** One place for how each confirm policy is named in the UI. */
export const CONFIRM_POLICIES: { value: ActionConfirmPolicy; label: string; hint: string }[] = [
  { value: 'never', label: 'Never asks', hint: 'Runs straight away. For drafts and things that are easy to undo.' },
  { value: 'always', label: 'Always asks', hint: 'The user approves every time. For sending, inviting, publishing or paying.' },
  { value: 'when_overwriting', label: 'Asks if overwriting', hint: 'Asks only when it would replace something the user already has.' },
]

export function policyLabel(policy: ActionConfirmPolicy): string {
  return CONFIRM_POLICIES.find((p) => p.value === policy)?.label ?? policy
}

/** Same rule as the server, so bad names are caught before saving. */
export const ACTION_NAME_PATTERN = /^[a-z][a-z0-9_]{0,63}$/

export const EMPTY_PARAMETERS = { type: 'object', properties: {} }

export function blankAction(): AgentActionInput {
  return {
    name: '',
    label: '',
    description: '',
    parameters: { ...EMPTY_PARAMETERS, properties: {} },
    confirm: 'never',
    sensitive_form: false,
    enabled: true,
  }
}

/** Parse the schema text box. Returns an error message instead of throwing. */
export function parseParameters(text: string): { value?: Record<string, unknown>; error?: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { error: 'Arguments must be valid JSON.' }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { error: 'Arguments must be a JSON object.' }
  }
  if ((parsed as Record<string, unknown>).type !== 'object') {
    return { error: 'Arguments need "type": "object".' }
  }
  return { value: parsed as Record<string, unknown> }
}
