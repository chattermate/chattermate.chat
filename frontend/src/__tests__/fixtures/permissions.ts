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

import { vi } from 'vitest'

/**
 * Mock map for @/utils/permissions' permissionChecks — one place to extend
 * when a new check is added, instead of every spec enumerating all methods.
 * Use inside vi.hoisted() so it exists before vi.mock factories run.
 */
export const createPermissionMocks = (defaultValue = true) => ({
  canViewAgents: vi.fn(() => defaultValue),
  canManageUsers: vi.fn(() => defaultValue),
  canViewChats: vi.fn(() => defaultValue),
  canManageKnowledge: vi.fn(() => defaultValue),
  canViewAnalytics: vi.fn(() => defaultValue),
  canViewOrganization: vi.fn(() => defaultValue),
  canManageOrganization: vi.fn(() => defaultValue),
  canViewAIConfig: vi.fn(() => defaultValue),
})
