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

export type LeadStage = 'visitor' | 'lead' | 'customer'

export interface PersonListItem {
  id: string
  name?: string | null
  email?: string | null
  is_anonymous: boolean
  lead_stage: LeadStage
  qualified: boolean
  source?: Record<string, any> | null
  captured_at?: string | null
  last_activity?: string | null
  synced: boolean
}

export interface PeopleListResponse {
  items: PersonListItem[]
  total: number
  page: number
  page_size: number
}

export interface PeopleStats {
  total_people: number
  new_leads_7d: number
  customers: number
  synced_to_crm: number
}

export interface TimelineEntry {
  stage: string
  at: string
}

export interface PersonConversation {
  session_id: string
  agent_name?: string | null
  status?: string | null
  last_message?: string | null
  created_at?: string | null
}

export interface PersonDetail {
  id: string
  name?: string | null
  email?: string | null
  is_anonymous: boolean
  lead_stage: LeadStage
  qualified: boolean
  source?: Record<string, any> | null
  created_at?: string | null
  lead_qualified_at?: string | null
  meta_data?: Record<string, any> | null
  summary?: string | null
  captured_attributes: Record<string, any>
  timeline: TimelineEntry[]
  conversations: PersonConversation[]
}
