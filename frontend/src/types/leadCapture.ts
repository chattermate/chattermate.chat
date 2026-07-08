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

export type LeadAssignmentMode = 'none' | 'sales_team' | 'specific_person' | 'round_robin'
export type CrmSyncTarget = 'none' | 'hubspot' | 'salesforce'

export interface LeadField {
  key: string
  standard: boolean
  enabled: boolean
  required: boolean
  label?: string | null
  options?: string[] | null
}

export interface LeadCaptureConfig {
  agent_id: string
  enabled: boolean
  require_consent: boolean
  guidance?: string | null
  fields: LeadField[]
  assignment_mode: LeadAssignmentMode
  assignment_target_user_id?: string | null
  crm_sync_target: CrmSyncTarget
  slack_notify_enabled: boolean
}

export type LeadCaptureConfigUpdate = Omit<LeadCaptureConfig, 'agent_id'>
