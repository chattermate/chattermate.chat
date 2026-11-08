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

export type JourneyStatus = 'draft' | 'live' | 'paused'
export type ConditionKind = 'url' | 'event' | 'ctx' | 'user' | 'action'
export type ConditionOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists'

export interface Condition {
  kind: ConditionKind
  value: string
  op?: ConditionOp | null
  operand?: string | number | boolean | null
}

export interface JourneyChip {
  label: string
  kind: 'text' | 'action'
  value: string
  /** Left out of the step while this holds. */
  hide_when?: Condition | null
}

export interface JourneyThen {
  kind: 'next' | 'message' | 'block' | 'start_journey'
  value?: string | null
}

export interface JourneyStep {
  id: string
  title: string
  skippable: boolean
  triggers: Condition[]
  message: string
  chips: JourneyChip[]
  allowed_actions: string[]
  done_when: Condition[]
  then: JourneyThen
  nudge?: { after_min: number; message: string } | null
}

export interface JourneyDefinition {
  audience: { kind: 'everyone' | 'new_users' | 'rules'; rules: Condition[] }
  start: { kind: 'url' | 'event' | 'manual'; value?: string | null }
  steps: JourneyStep[]
  finish: { message: string }
  variable_fallbacks: Record<string, string>
}

export interface JourneyInput {
  key: string
  name: string
  status: JourneyStatus
  priority: number
  auto_open: boolean
  goal_event: string | null
  template_key: string | null
  definition: JourneyDefinition
}

export interface Journey extends JourneyInput {
  id: string
  agent_id: string
  version: number
  created_at: string | null
  updated_at: string | null
}

export interface JourneyTemplate {
  key: string
  name: string
  group: string
  summary: string
  goal_event: string | null
  steps: string[]
  actions: Record<string, string>
}

export interface FunnelStep {
  step_id: string
  title: string
  reached: number
  done: number
  skipped: number
  dropped: number
  median_seconds: number | null
}

export interface Funnel {
  started: number
  finished: number
  goal_reached: number
  median_seconds_to_finish: number | null
  steps: FunnelStep[]
}

export interface StuckUser {
  customer_id: string
  name: string | null
  email: string | null
  reached_at: string | null
  last_seen_at: string
}

export interface ContextKey {
  key: string
  source: 'token' | 'context'
  last_seen_at: string
}

export interface PersonJourney {
  journey_id: string
  journey_name: string
  status: 'active' | 'finished' | 'dismissed'
  started_at: string
  finished_at: string | null
  goal_at: string | null
  current_step_id: string | null
  steps: { step_id: string; title: string; reached_at: string | null; done_at: string | null; skipped_at: string | null; done_by: string | null }[]
}
