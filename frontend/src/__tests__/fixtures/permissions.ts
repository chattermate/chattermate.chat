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
 *
 * The keys are asserted against the real permissionChecks in
 * utils/permissions.spec.ts, so a check added to the app but not here fails
 * that test instead of silently returning undefined in some other spec.
 */
export const createPermissionMocks = (defaultValue = true) => ({
  canViewAgents: vi.fn(() => defaultValue),
  canManageAgents: vi.fn(() => defaultValue),
  canManageUsers: vi.fn(() => defaultValue),
  canViewChats: vi.fn(() => defaultValue),
  canViewUnassignedChats: vi.fn(() => defaultValue),
  canViewPeople: vi.fn(() => defaultValue),
  canManagePeople: vi.fn(() => defaultValue),
  canTakeOverChats: vi.fn(() => defaultValue),
  canManageAllChats: vi.fn(() => defaultValue),
  canManageKnowledge: vi.fn(() => defaultValue),
  canViewKnowledge: vi.fn(() => defaultValue),
  canViewAnalytics: vi.fn(() => defaultValue),
  canViewOrganization: vi.fn(() => defaultValue),
  canManageOrganization: vi.fn(() => defaultValue),
  canManageAIConfig: vi.fn(() => defaultValue),
  canViewAIConfig: vi.fn(() => defaultValue),
  canViewTickets: vi.fn(() => defaultValue),
  canManageTickets: vi.fn(() => defaultValue),
  canApproveTicketActions: vi.fn(() => defaultValue),
  canViewSubscription: vi.fn(() => defaultValue),
  canManageSubscription: vi.fn(() => defaultValue),
})

/**
 * A cached-user blob shaped like the API's, for specs that want the REAL
 * permission checks to run instead of mocking them away. Mocking
 * permissionChecks cannot catch a nav item and its route disagreeing about
 * which permission they need — only driving both from one user can.
 */
export const userWithPermissions = (permissions: string[]) => ({
  id: 'user-1',
  email: 'someone@example.com',
  full_name: 'Someone',
  organization_id: 'org-1',
  role: {
    id: 1,
    name: 'Test Role',
    permissions: permissions.map((name, id) => ({ id, name, description: name })),
  },
})

/** Exactly what a seeded Human Agent role holds. */
export const HUMAN_AGENT_PERMISSIONS = [
  'view_assigned_chats',
  'manage_assigned_chats',
  'view_unassigned_chats',
  'view_people',
]
