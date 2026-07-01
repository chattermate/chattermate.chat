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

import type { User } from "@/types/user"

export interface BusinessHours {
  start: string
  end: string
  enabled: boolean
}

export interface BusinessHoursDict {
  monday: BusinessHours
  tuesday: BusinessHours
  wednesday: BusinessHours
  thursday: BusinessHours
  friday: BusinessHours
  saturday: BusinessHours
  sunday: BusinessHours
}

export interface Organization {
  id: string
  name: string
  domain: string
  timezone: string
  business_hours: BusinessHoursDict
  settings: Record<string, any>
  is_active: boolean
}

export interface OrganizationCreate {
  name: string
  domain: string
  timezone: string
  business_hours: BusinessHoursDict
  admin_email: string
  admin_name: string
  admin_password: string
  settings?: Record<string, any>
}

export interface OrganizationUpdate {
  name?: string
  domain?: string
  timezone?: string
  business_hours?: BusinessHoursDict
  settings?: Record<string, any>
}

export interface OrganizationResponse extends Omit<OrganizationCreate, 'admin_password'> {
  id: string
  is_active: boolean
  access_token?: string
  refresh_token?: string
  token_type?: string
  user: User
}
