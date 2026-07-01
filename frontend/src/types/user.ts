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

import type { Permission } from "@/services/roles"

export interface Role {
  id: string
  name: string
  description?: string
  permissions?: Permission[]
  created_at?: string
  updated_at?: string
  is_default?: boolean 
}

export interface UserGroup {
  id: string
  name: string
  description?: string
  organization_id: string
  users?: User[]
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  full_name: string
  organization_id: string
  is_active?: boolean
  groups?: UserGroup[]
  role?: Role
  created_at?: string
  updated_at?: string
  profile_pic?: string
  profile_pic_url?: string
  is_online?: boolean
  last_seen?: string
} 
