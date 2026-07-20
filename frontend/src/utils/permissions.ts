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

export function hasPermission(permission: string): boolean {
  const user = userService.getCurrentUser()
  return user?.role?.permissions?.some(p => p.name === permission) || false
}

export function hasAnyPermission(permissions: string[]): boolean {
  // super_admin holds everything — the backend's has_any_permission bypasses
  // on it, and the two layers disagreeing means a page renders then 403s.
  return hasPermission('super_admin') || permissions.some(permission => hasPermission(permission))
}

// Common permission checks
export const permissionChecks = {
  canManageOrganization: () => hasPermission('manage_organization'),
  canViewOrganization: () => hasAnyPermission(['manage_organization', 'view_organization']),
  canManageAIConfig: () => hasPermission('manage_ai_config'),
  canViewAIConfig: () => hasAnyPermission(['manage_ai_config', 'view_ai_config']),
  canManageUsers: () => hasPermission('manage_users'),
  canViewAgents: () => hasAnyPermission(['manage_agents', 'view_agents']),
  canManageAgents: () => hasPermission('manage_agents'),
  // Any inbox grant opens the Inbox: own/group chats, the unclaimed AI queue,
  // or everything. Keep in sync with get_unified_chat_auth in core/auth.py.
  canViewChats: () =>
    hasAnyPermission(['view_all_chats', 'view_assigned_chats', 'view_unassigned_chats']),
  // The people directory is its own read grant; the org-wide chat permissions
  // imply it. Mirrors PEOPLE_READ_PERMISSIONS in core/auth.py.
  canViewPeople: () => hasAnyPermission(['view_people', 'view_all_chats', 'manage_all_chats']),
  // Editing a person (mark customer, correct a phone) needs the stronger grant
  canManagePeople: () => hasAnyPermission(['view_all_chats', 'manage_all_chats']),
  // Claiming a chat. Mirrors TAKEOVER_PERMISSIONS in api/session_to_agent.py
  canTakeOverChats: () => hasAnyPermission(['manage_all_chats', 'manage_assigned_chats']),
  canManageKnowledge: () => hasPermission('manage_knowledge'),
  canViewAnalytics: () => hasPermission('view_analytics'),
  canViewTickets: () => hasAnyPermission(['view_tickets', 'manage_tickets']),
  canManageTickets: () => hasPermission('manage_tickets'),
  canApproveTicketActions: () => hasPermission('approve_ticket_actions')
}