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

export type ActionConfirmPolicy = 'never' | 'always' | 'when_overwriting'

export interface AgentActionInput {
  name: string
  label: string
  description: string
  parameters: Record<string, unknown>
  confirm: ActionConfirmPolicy
  /** Omitted on create to take the server default. */
  timeout_s?: number
  sensitive_form: boolean
  enabled: boolean
}

export interface AgentAction extends AgentActionInput {
  timeout_s: number
  id: string
  agent_id: string
  last_registered_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface AgentActionList {
  actions: AgentAction[]
  cap: number
}

export interface AgentActionModelView {
  name: string
  description: string
  parameters: Record<string, unknown>
}
