import { userService } from '@/services/user'

export function hasPermission(permission: string): boolean {
  const user = userService.getCurrentUser()
  return user?.role?.permissions?.some(p => p.name === permission) || false
}

export function hasAnyPermission(permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(permission))
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
  canViewChats: () => hasAnyPermission(['view_all_chats', 'view_assigned_chats']),
  canManageKnowledge: () => hasPermission('manage_knowledge'),
  canViewAnalytics: () => hasPermission('view_analytics')
} 