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

export type TicketStatus =
  | 'open'
  | 'triaging'
  | 'investigating'
  | 'awaiting_approval'
  | 'in_progress'
  | 'resolved_pending_confirmation'
  | 'resolved'
  | 'closed'
  | 'reopened'

export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low'

export type TicketAiState = 'investigating' | 'awaiting' | 'human' | 'resolved'

export type ResolutionOutcome =
  | 'fixed'
  | 'workaround'
  | 'not_a_bug'
  | 'duplicate'
  | 'cannot_reproduce'
  | 'customer_unresponsive'
  | 'escalated_external'

export interface TicketListItem {
  id: string
  ticket_number: number
  display_number: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  tags?: string[] | null
  assignee_user_id?: string | null
  assignee_name?: string | null
  ai_state?: TicketAiState | null
  sla_due_at?: string | null
  resolved_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Ticket extends TicketListItem {
  organization_id: string
  customer_id?: string | null
  original_title?: string | null
  description?: string | null
  severity?: number | null
  source: 'chat_ai' | 'human_agent' | 'manual' | 'api'
  intent?: string | null
  triage_confidence?: number | null
  ai_summary?: string | null
  group_id?: string | null
  agent_id?: string | null
  duplicate_of_ticket_id?: string | null
  resolution_outcome?: ResolutionOutcome | null
  resolution_summary?: string | null
  customer_resolution_message?: string | null
  first_response_at?: string | null
  closed_at?: string | null
  confirmation_requested_at?: string | null
  reopened_count: number
  external_ref_type?: string | null
  external_ref_id?: string | null
  external_ref_url?: string | null
  created_by_user_id?: string | null
  assignee?: { id: string; full_name?: string | null; email?: string | null } | null
  customer?: { id: string; full_name?: string | null; email?: string | null } | null
}

export type TicketActivityType =
  | 'comment'
  | 'status_change'
  | 'assignment'
  | 'priority_change'
  | 'ai_triage'
  | 'ai_investigation_started'
  | 'ai_investigation_completed'
  | 'ai_resolution_proposed'
  | 'ai_resolution_approved'
  | 'ai_resolution_rejected'
  | 'customer_notified'
  | 'customer_replied'
  | 'csat_requested'
  | 'reopened'
  | 'jira_escalated'

export interface TicketActivity {
  id: string
  activity_type: TicketActivityType
  actor_type: 'user' | 'ai' | 'customer' | 'system'
  actor_user_id?: string | null
  actor_name?: string | null
  body?: string | null
  is_internal: boolean
  activity_metadata?: Record<string, any> | null
  created_at?: string | null
}

export interface InvestigationRun {
  id: string
  run_type: 'triage' | 'investigation'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'budget_exceeded'
  trigger: string
  error?: string | null
  tool_calls_used: number
  model_name?: string | null
  started_at?: string | null
  finished_at?: string | null
  created_at?: string | null
}

export interface TicketDetail {
  ticket: Ticket
  activities: TicketActivity[]
  runs: InvestigationRun[]
  linked_session_ids: string[]
  possible_duplicates?: TicketListItem[]
  /** Linked conversation or customer email exists — gates "send to customer" UI. */
  can_notify_customer?: boolean
}

export interface Pagination {
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TicketListResponse {
  tickets: TicketListItem[]
  pagination: Pagination
}

export interface TicketStats {
  open: number
  awaiting_approval: number
  sla_breaching: number
  ai_resolved_pct_7d?: number | null
}

export interface TicketListFilters {
  status: string
  priority: string
  assignee: string
  ai: string
  search: string
  sort: string
}

export interface TicketCreatePayload {
  title: string
  description?: string
  priority?: TicketPriority
  severity?: number
  tags?: string[]
  customer_id?: string
  /** Manual tickets: find-or-create the customer by email for direct-email notifications. */
  customer_email?: string
  customer_name?: string
  session_id?: string
  assignee_user_id?: string
  group_id?: string
}

export interface TicketUpdatePayload {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  severity?: number
  tags?: string[]
  assignee_user_id?: string | null
  group_id?: string | null
  resolution_outcome?: ResolutionOutcome
  resolution_summary?: string
  customer_resolution_message?: string
}

export interface SlaTarget {
  first_response_minutes: number
  resolution_minutes: number
}

export interface TicketSettings {
  autonomy_level: number
  auto_investigate_on_create: boolean
  min_confidence_to_auto_resolve: number
  confirmation_timeout_hours: number
  csat_enabled: boolean
  sla_targets?: Record<TicketPriority, SlaTarget> | null
  created_template?: string | null
  resolved_template?: string | null
  jira_escalation_enabled: boolean
  jira_escalation_priority?: TicketPriority | null
  investigation_mcp_tool_ids?: number[] | null
  alert_webhook_enabled: boolean
  max_tool_calls_per_run: number
  max_runs_per_ticket: number
}

export interface TicketUpdateEvent {
  ticket_id: string
  kind: 'created' | 'status' | 'triage' | 'comment' | 'run' | 'updated'
  payload: Record<string, any>
}
