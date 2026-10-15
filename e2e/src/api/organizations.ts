import type { ApiClient } from './client'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export async function isSetUp(api: ApiClient): Promise<boolean> {
  const body = await api.get<{ is_setup: boolean }>('/organizations/setup-status')
  return body.is_setup
}

/**
 * Open every day, all day. Handover only reaches a human inside business hours, so
 * without this a nightly run outside 9–5 would take the "we'll email you" branch.
 */
export async function setAlwaysOpen(api: ApiClient, orgId: string): Promise<void> {
  await setBusinessHours(api, orgId, true)
}

/** Closed every day — for after-hours journeys (an org-wide change: `*.org.spec.ts` only). */
export async function setAlwaysClosed(api: ApiClient, orgId: string): Promise<void> {
  await setBusinessHours(api, orgId, false)
}

async function setBusinessHours(api: ApiClient, orgId: string, open: boolean): Promise<void> {
  const businessHours = Object.fromEntries(DAYS.map((day) => [day, { start: '00:00', end: '23:59', enabled: open }]))
  await api.patch(`/organizations/${orgId}`, { data: { business_hours: businessHours } })
}

/** Change the org's website, which decides the sites allowed to call the API (`*.org.spec.ts` only). */
export async function setOrgDomain(api: ApiClient, orgId: string, domain: string): Promise<void> {
  await api.patch(`/organizations/${orgId}`, { data: { domain } })
}
