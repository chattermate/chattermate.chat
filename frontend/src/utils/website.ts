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

// The server (app/utils/domain_check.py: validate_org_website) has the final
// say on an organization's website; this is the quick check while typing.
export const WEBSITE_INVALID_MESSAGE = 'Please enter your website, like yourwebsite.com'

/** The host in what was typed: 'https://WWW.Acme.com/x' -> 'www.acme.com', or '' */
export const websiteHost = (typed: string): string => {
  const text = typed.trim()
  if (!text) return ''
  try {
    // URL lowercases the host and puts an international name in punycode
    return new URL(text.includes('//') ? text : `https://${text}`).hostname.replace(/\.$/, '')
  } catch {
    return ''
  }
}

/** Whether what was typed (a bare host or a pasted URL) can be a website */
export const looksLikeWebsite = (typed: string): boolean =>
  /^(?!-)[a-z0-9-]+(?<!-)(\.(?!-)[a-z0-9-]+(?<!-))+$/.test(websiteHost(typed))

/**
 * People type "docs.company.com", not "https://docs.company.com". Default the
 * scheme so an address that is perfectly fine isn't refused for lacking one.
 */
export const withScheme = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed
  // Leading slashes would produce https:////host — drop them first.
  return `https://${trimmed.replace(/^\/+/, '')}`
}
