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

import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { formatBadgeCount } from '@/utils/badgeCount'

export const APP_NAME = 'ChatterMate'

/**
 * The name of every dashboard page, keyed by its route path pattern.
 *
 * One source for the sidebar label, the header breadcrumb and the browser tab
 * title, so the three cannot disagree. A path missing here (login, setup, the
 * Shopify views) gets the plain app name in the tab and no breadcrumb.
 */
export const PAGE_TITLES = {
  '/ai-agents': 'AI Agents',
  '/human-agents': 'Human Agents',
  '/conversations': 'Inbox',
  '/tickets': 'Tickets',
  '/tickets/:id': 'Ticket',
  '/people': 'People',
  '/knowledge': 'Knowledge',
  '/faq': 'Help center',
  '/analytics': 'Analytics',
  '/settings/organization': 'Organization',
  '/settings/subscription': 'Subscription',
  '/settings/subscription/setup/:planId': 'Subscription',
  '/settings/ticketing': 'Ticketing',
  '/settings/saved-replies': 'Saved replies',
  '/settings/integrations': 'Integrations',
  '/settings/app-integrations': 'App Integrations',
  '/settings/widget-apps': 'Widget Apps',
  '/settings/ai-config': 'AI Configuration',
  '/settings/user': 'User Settings',
  '/settings/access-tokens': 'CLI & API tokens',
} as const satisfies Readonly<Record<string, string>>

/** A route path pattern that has a page title. */
export type PagePath = keyof typeof PAGE_TITLES

const TITLE_BY_PATH: Readonly<Record<string, string>> = PAGE_TITLES

/** A titled page's name. Typed, so a nav link to an untitled page fails the build. */
export const pageTitle = (path: PagePath): string => PAGE_TITLES[path]

/** The current page's name, from the deepest matched route record. */
export function routePageTitle(route: Pick<RouteLocationNormalizedLoaded, 'matched'>): string | undefined {
  const record = route.matched[route.matched.length - 1]
  return record ? TITLE_BY_PATH[record.path] : undefined
}

/**
 * The browser tab title: "Analytics · ChatterMate", "(3) Inbox · ChatterMate"
 * when there is something waiting, or just the app name off the dashboard.
 */
export function documentTitle(page?: string, count?: number | null): string {
  if (!page) return APP_NAME
  const prefix = count ? `(${formatBadgeCount(count)}) ` : ''
  return `${prefix}${page} · ${APP_NAME}`
}
