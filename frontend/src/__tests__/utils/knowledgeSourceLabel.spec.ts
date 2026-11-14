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
import { sourceLabel } from '@/utils/knowledgeSourceLabel'

describe('sourceLabel', () => {
  it('names a Shopify store source by its store', () => {
    expect(sourceLabel('shopify:teststore.myshopify.com')).toBe('Your Shopify store (teststore.myshopify.com)')
  })

  it('leaves websites as their address', () => {
    expect(sourceLabel('https://shop.example/faq')).toBe('https://shop.example/faq')
    expect(sourceLabel('shop.example')).toBe('shop.example')
  })

  it('leaves files and unknown prefixes alone', () => {
    expect(sourceLabel('returns-policy.pdf')).toBe('returns-policy.pdf')
    expect(sourceLabel('other:thing')).toBe('other:thing')
    expect(sourceLabel(':odd')).toBe(':odd')
  })
})
