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

import { userService } from '@/services/user'
import {
  AGENT_PERMISSIONS,
  AI_CONFIG_PERMISSIONS,
  CHAT_MANAGE_PERMISSIONS,
  CHAT_VIEW_PERMISSIONS,
  KNOWLEDGE_PERMISSIONS,
  UNASSIGNED_CHAT_VIEW_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
  PEOPLE_PERMISSIONS,
  SUBSCRIPTION_PERMISSIONS,
  TICKET_PERMISSIONS,
} from '@/utils/permissionGroups'

export function hasPermission(permission: string): boolean {
  const user = userService.getCurrentUser()
  return user?.role?.permissions?.some(p => p.name === permission) || false
}

export function hasAnyPermission(permissions: string[]): boolean {
  // super_admin holds everything — the backend's has_any_permission bypasses
  // on it, and the two layers disagreeing means a page renders then 403s.
  return hasPermission('super_admin') || permissions.some(permission => hasPermission(permission))
}

// The groups live in a leaf module (see permissionGroups.ts for why) and are
// re-exported here so existing importers keep working.
export * from '@/utils/permissionGroups'

// Common permission checks.
//
// Every check goes through hasAnyPermission, never bare hasPermission: it is
// the only one that honours super_admin, and the backend's check_permissions
// bypasses on it. When the two layers disagree the page renders and then 403s.
export const permissionChecks = {
  canManageOrganization: () => hasAnyPermission(['manage_organization']),
  canViewOrganization: () => hasAnyPermission(ORGANIZATION_PERMISSIONS),
  canManageAIConfig: () => hasAnyPermission(['manage_ai_config']),
  canViewAIConfig: () => hasAnyPermission(AI_CONFIG_PERMISSIONS),
  canManageUsers: () => hasAnyPermission(['manage_users']),
  canViewAgents: () => hasAnyPermission(AGENT_PERMISSIONS),
  canManageAgents: () => hasAnyPermission(['manage_agents']),
  canViewChats: () => hasAnyPermission(CHAT_VIEW_PERMISSIONS),
  canViewUnassignedChats: () => hasAnyPermission(UNASSIGNED_CHAT_VIEW_PERMISSIONS),
  canViewPeople: () => hasAnyPermission(PEOPLE_PERMISSIONS),
  // Correcting a person or marking them a customer is inbox work, not
  // administration — PEOPLE_WRITE_PERMISSIONS equals the read set.
  canManagePeople: () => hasAnyPermission(PEOPLE_PERMISSIONS),
  canTakeOverChats: () => hasAnyPermission(CHAT_MANAGE_PERMISSIONS),
  // Release, reassign or snooze a chat a teammate holds (the server's may_change_hands)
  canManageAllChats: () => hasAnyPermission(['manage_all_chats']),
  canManageKnowledge: () => hasAnyPermission(['manage_knowledge']),
  canViewKnowledge: () => hasAnyPermission(KNOWLEDGE_PERMISSIONS),
  canViewAnalytics: () => hasAnyPermission(['view_analytics']),
  canViewTickets: () => hasAnyPermission(TICKET_PERMISSIONS),
  canManageTickets: () => hasAnyPermission(['manage_tickets']),
  canApproveTicketActions: () => hasAnyPermission(['approve_ticket_actions']),
  canViewSubscription: () => hasAnyPermission(SUBSCRIPTION_PERMISSIONS),
  canManageSubscription: () => hasAnyPermission(['manage_subscription']),
}