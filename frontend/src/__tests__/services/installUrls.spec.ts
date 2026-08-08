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

import { describe, it, expect, afterEach, vi } from 'vitest'

// The axios client drags in the router and the enterprise feature loader, and
// none of that matters here: these helpers deliberately bypass it to build a
// raw URL for window.location.href.
vi.mock('@/services/api', () => ({ default: {} }))

import crmService from '@/services/crm'
import channelsService from '@/services/channels'
import { getJiraAuthUrl } from '@/services/jira'
import { apiPath } from '@/config/api'

type MutableWindow = { APP_CONFIG?: Record<string, string> }

function setRuntimeApiUrl(url: string) {
  ;(window as unknown as MutableWindow).APP_CONFIG = { API_URL: url }
}

/**
 * Install URLs are browser navigations, not XHR, so they skip the axios client
 * whose baseURL is already runtime-resolved. That makes them the one place a
 * build-time import.meta.env.VITE_API_URL can creep back in — which sends a
 * self-hoster to a host their session cookie was never scoped to, and the
 * install dies on "Not authenticated". See issue #287.
 */
describe('OAuth install URLs', () => {
  afterEach(() => {
    delete (window as unknown as MutableWindow).APP_CONFIG
  })

  const builders: Array<[string, () => string]> = [
    ['jira/authorize', () => getJiraAuthUrl()],
    ['crm/hubspot', () => crmService.getInstallUrl('hubspot')],
    ['crm/pipedrive', () => crmService.getInstallUrl('pipedrive')],
    ['channels/slack', () => channelsService.getSlackInstallUrl()],
  ]

  it.each(builders)('%s builds on the runtime API URL', (_name, build) => {
    setRuntimeApiUrl('https://self.hosted.example/api/v1')
    expect(build()).toMatch(/^https:\/\/self\.hosted\.example\/api\/v1\//)
  })

  it.each(builders)('%s never emits an "undefined" segment', (_name, build) => {
    // No APP_CONFIG and no baked VITE_API_URL: the published image's state.
    expect(build()).not.toContain('undefined')
  })

  it.each(builders)('%s re-reads the runtime config on every call', (_name, build) => {
    setRuntimeApiUrl('https://first.example/api/v1')
    const first = build()
    setRuntimeApiUrl('https://second.example/api/v1')
    expect(build()).not.toBe(first)
    expect(build()).toContain('second.example')
  })

  it.each(builders)('%s survives an API_URL with a trailing slash', (_name, build) => {
    // Starlette matches paths exactly, so a "//" from hand-concatenation 404s.
    setRuntimeApiUrl('https://self.hosted.example/api/v1/')
    expect(build()).not.toContain('/api/v1//')
  })

  it('points at the endpoint the backend actually mounts', () => {
    setRuntimeApiUrl('https://self.hosted.example/api/v1')
    expect(crmService.getInstallUrl('pipedrive')).toBe(
      'https://self.hosted.example/api/v1/crm/pipedrive/install',
    )
    expect(channelsService.getSlackInstallUrl()).toBe(
      'https://self.hosted.example/api/v1/channels/slack/install',
    )
    expect(getJiraAuthUrl()).toBe('https://self.hosted.example/api/v1/jira/authorize')
  })
})

describe('apiPath', () => {
  afterEach(() => {
    delete (window as unknown as MutableWindow).APP_CONFIG
  })

  it('joins on exactly one slash however the two sides are punctuated', () => {
    setRuntimeApiUrl('https://h.example/api/v1')
    expect(apiPath('/x')).toBe('https://h.example/api/v1/x')
    expect(apiPath('x')).toBe('https://h.example/api/v1/x')
    setRuntimeApiUrl('https://h.example/api/v1/')
    expect(apiPath('/x')).toBe('https://h.example/api/v1/x')
    expect(apiPath('x')).toBe('https://h.example/api/v1/x')
  })

  it('collapses repeated slashes on either side', () => {
    setRuntimeApiUrl('https://h.example/api/v1///')
    expect(apiPath('///x')).toBe('https://h.example/api/v1/x')
  })

  it('leaves the query string alone', () => {
    setRuntimeApiUrl('https://h.example/api/v1/')
    expect(apiPath('/shopify/auth?shop=a.myshopify.com&x=1')).toBe(
      'https://h.example/api/v1/shopify/auth?shop=a.myshopify.com&x=1',
    )
  })

  it('does not mangle the scheme separator', () => {
    setRuntimeApiUrl('https://h.example')
    expect(apiPath('/x')).toBe('https://h.example/x')
  })
})
