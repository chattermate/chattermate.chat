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

import { describe, expect, it } from 'vitest'
import { allowsHost, buildReturnUrl, parseConnectRequest, parseReturnUrl } from '@/utils/wordpressConnect'

const RETURN = 'https://shop.example.com/wp-admin/admin-post.php?action=chattermate_connect'

describe('parseReturnUrl', () => {
  it('takes the plugin admin-post action on http and https', () => {
    expect(parseReturnUrl(RETURN)?.host).toBe('shop.example.com')
    expect(parseReturnUrl('http://localhost:8080/blog/wp-admin/admin-post.php?action=chattermate_connect')).not.toBeNull()
  })

  it.each([
    ['another action', 'https://shop.example.com/wp-admin/admin-post.php?action=delete_everything'],
    ['no action', 'https://shop.example.com/wp-admin/admin-post.php'],
    ['another path', 'https://evil.example/login?action=chattermate_connect'],
    ['a script URL', 'javascript:alert(1)//wp-admin/admin-post.php?action=chattermate_connect'],
    ['credentials in the URL', 'https://user:pass@shop.example.com/wp-admin/admin-post.php?action=chattermate_connect'],
    ['not a URL', 'shop.example.com/wp-admin/admin-post.php'],
    ['nothing', undefined],
  ])('refuses %s', (_label, raw) => {
    expect(parseReturnUrl(raw)).toBeNull()
  })
})

describe('parseConnectRequest', () => {
  it('reads the return, the nonce and the site name', () => {
    const request = parseConnectRequest({ return_url: RETURN, state: 'a1b2c3d4e5', site_name: '  Larkfield Goods ' })
    expect(request?.state).toBe('a1b2c3d4e5')
    expect(request?.siteName).toBe('Larkfield Goods')
  })

  it('names the site by its host when no name is given', () => {
    expect(parseConnectRequest({ return_url: RETURN, state: 'abc12345' })?.siteName).toBe('shop.example.com')
  })

  it('takes the public host from site_url, which can differ from the admin host', () => {
    const request = parseConnectRequest({ return_url: RETURN, state: 'abc12345', site_url: 'https://www.larkfield.example/' })
    expect(request?.siteHost).toBe('www.larkfield.example')
    expect(parseConnectRequest({ return_url: RETURN, state: 'abc12345', site_url: 'javascript:x' })?.siteHost).toBe('shop.example.com')
  })

  it('refuses a request without a WordPress nonce', () => {
    expect(parseConnectRequest({ return_url: RETURN })).toBeNull()
    expect(parseConnectRequest({ return_url: RETURN, state: '"><script>' })).toBeNull()
    expect(parseConnectRequest({ return_url: RETURN, state: 'short' })).toBeNull()
  })
})

describe('buildReturnUrl', () => {
  const request = parseConnectRequest({ return_url: RETURN, state: 'abc123xyz' })!

  it('sends the widget ID and the nonce back, keeping the action', () => {
    const url = new URL(buildReturnUrl(request, { widgetId: 'w-1' }))
    expect(url.searchParams.get('action')).toBe('chattermate_connect')
    expect(url.searchParams.get('widget_id')).toBe('w-1')
    expect(url.searchParams.get('state')).toBe('abc123xyz')
  })

  it('says so when the admin cancels', () => {
    const url = new URL(buildReturnUrl(request, { error: 'cancelled' }))
    expect(url.searchParams.get('error')).toBe('cancelled')
    expect(url.searchParams.has('widget_id')).toBe(false)
  })
})

describe('allowsHost', () => {
  it('allows every site when the list is empty', () => {
    expect(allowsHost([], 'shop.example.com')).toBe(true)
  })

  it('matches the host exactly or under a wildcard', () => {
    expect(allowsHost(['shop.example.com'], 'shop.example.com')).toBe(true)
    expect(allowsHost(['*.example.com'], 'shop.example.com')).toBe(true)
    expect(allowsHost(['localhost:8080'], 'localhost:8080')).toBe(true)
  })

  it('does not stretch a domain to look-alikes', () => {
    expect(allowsHost(['example.com'], 'shop.example.com')).toBe(false)
    expect(allowsHost(['*.example.com'], 'badexample.com')).toBe(false)
  })
})
