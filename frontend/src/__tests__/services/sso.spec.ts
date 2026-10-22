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
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/config/api', () => ({ getApiUrl: () => 'http://api.test/api/v1/' }))
vi.mock('@/services/api', () => ({ default: { get: vi.fn() } }))
vi.mock('@/services/user', () => ({ userService: { setCurrentUser: vi.fn() } }))

import api from '@/services/api'
import { userService } from '@/services/user'
import { ssoService } from '@/services/sso'

describe('ssoService.completeSignIn', () => {
  it('picks up the signed-in user from /users/me and caches it', async () => {
    ;(api.get as any).mockResolvedValue({ data: { id: 'u1', email: 'a@example.test' } })
    expect(await ssoService.completeSignIn()).toEqual({ id: 'u1', email: 'a@example.test' })
    expect(api.get).toHaveBeenCalledWith('/users/me')
    expect(userService.setCurrentUser).toHaveBeenCalledWith({ id: 'u1', email: 'a@example.test' })
  })
})

describe('ssoService.startUrl', () => {
  it('carries the login page query to the backend', () => {
    expect(ssoService.startUrl('google', { shopify_flow: '1', shop_id: '7', redirect: '/conversations' }))
      .toBe('http://api.test/api/v1/sso/google/start?shopify_flow=1&shop_id=7&redirect=%2Fconversations')
    // Repeated parameters stay repeated; empty ones (?flag) have no value to send.
    expect(ssoService.startUrl('google', { a: ['1', '2'], b: null }))
      .toBe('http://api.test/api/v1/sso/google/start?a=1&a=2')
  })

  it('adds no query when the login page has none', () => {
    expect(ssoService.startUrl('microsoft')).toBe('http://api.test/api/v1/sso/microsoft/start')
    expect(ssoService.startUrl('microsoft', {})).toBe('http://api.test/api/v1/sso/microsoft/start')
  })

  it('escapes the provider key', () => {
    expect(ssoService.startUrl('a/b')).toBe('http://api.test/api/v1/sso/a%2Fb/start')
  })
})

describe('ssoService.errorMessage', () => {
  it('names each backend error and falls back for unknown ones', () => {
    expect(ssoService.errorMessage('ambiguous_account')).toContain('More than one team account')
    expect(ssoService.errorMessage('already_linked')).toContain('unlink')
    expect(ssoService.errorMessage('wrong_domain')).toContain('Google domain')
    expect(ssoService.errorMessage('sign_in_refused')).toContain('does not allow')
    expect(ssoService.errorMessage('email_unverified')).toContain('not verified')
    expect(ssoService.errorMessage('something_new')).toBe('Single sign-on failed. Please try again.')
    expect(ssoService.errorMessage(null)).toBe('Single sign-on failed. Please try again.')
  })
})
