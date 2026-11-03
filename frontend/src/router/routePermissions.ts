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

// Groups from the leaf module, not from permissions.ts: this map is built at
// module scope, and permissions.ts sits inside the router import cycle.
import {
  AGENT_PERMISSIONS,
  AI_CONFIG_PERMISSIONS,
  CHAT_VIEW_PERMISSIONS,
  KNOWLEDGE_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
  PEOPLE_PERMISSIONS,
  TICKET_PERMISSIONS,
} from '@/utils/permissionGroups'
// Only ever called at runtime, so a partially-initialised module is harmless.
import { hasAnyPermission } from '@/utils/permissions'

/**
 * The one place a route's required permissions are written down.
 *
 * Both the router guard and the sidebar (navItems `show`) read this. They used to name permissions independently and had drifted: People
 * was listed in the nav for anyone with a chat grant but the route required
 * view_people, so an assigned-chats-only agent saw a link that bounced them.
 *
 * An empty array means "any authenticated user".
 */
export const ROUTE_PERMISSIONS: Record<string, readonly string[]> = {
  '/ai-agents': AGENT_PERMISSIONS,
  '/analytics': ['view_analytics'],
  '/knowledge': KNOWLEDGE_PERMISSIONS,
  // manage_knowledge, not the read pair: every /help-center endpoint the page
  // calls requires manage_knowledge, so a view_knowledge role would get the
  // link and a page that 403s on its first request.
  '/faq': ['manage_knowledge'],
  '/tickets': TICKET_PERMISSIONS,
  '/tickets/:id': TICKET_PERMISSIONS,
  '/settings/ticketing': ['manage_organization'],
  '/conversations': CHAT_VIEW_PERMISSIONS,
  '/people': PEOPLE_PERMISSIONS,
  '/human-agents': ['manage_users'],
  '/settings/organization': ORGANIZATION_PERMISSIONS,
  '/settings/ai-config': AI_CONFIG_PERMISSIONS,
  '/settings/integrations': ['manage_organization'],
  '/settings/app-integrations': ['manage_organization'],
  '/settings/widget-apps': ['manage_organization'],
  // Everyone can reach their own profile, and 403 must never deny itself or
  // the guard has nowhere to send anyone.
  '/settings/user': [],
  // Each user manages only their own tokens
  '/settings/access-tokens': [],
  '/403': [],
}

// Deliberately absent: /settings/subscription and its billing-setup child.
// The enterprise subscription guard redirects an expired org THERE, so gating
// it here would ping-pong (guard sends you to billing, this sends you to /403,
// guard sends you back) until Vue Router aborts. The nav hides it via
// canViewSubscription instead; gating the route needs the guard fixed first,
// which is an enterprise-submodule change.

/** Shopify embedded routes authenticate by session token, not by user role. */
const isShopifyPath = (path: string) => path.startsWith('/shopify')

/**
 * Whether the current user may open `path`.
 *
 * Unknown paths are allowed: the map lists what is restricted, so a public or
 * not-yet-mapped route must not become unreachable by omission.
 */
export function canAccessPath(path: string): boolean {
  if (isShopifyPath(path)) return true
  const required = ROUTE_PERMISSIONS[path]
  if (!required || required.length === 0) return true
  return hasAnyPermission([...required])
}

/**
 * Whether the user may open a resolved route.
 *
 * Takes the matched record paths rather than the URL so a parameterised route
 * is looked up by its pattern ('/tickets/:id'), not by '/tickets/42'.
 */
export function canAccessMatchedPaths(matchedPaths: string[]): boolean {
  return matchedPaths.every(canAccessPath)
}
