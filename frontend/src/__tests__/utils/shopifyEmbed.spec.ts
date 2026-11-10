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

import { afterEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { isEmbeddedShopify } from '@/utils/shopifyEmbed'
import { useImageFallback } from '@/composables/useImageFallback'

const realTop = window.top
const at = (path: string) => window.history.replaceState(null, '', path)
const framed = (yes: boolean) => Object.defineProperty(window, 'top', { value: yes ? {} : window, configurable: true })

afterEach(() => {
    at('/')
    Object.defineProperty(window, 'top', { value: realTop, configurable: true })
})

describe('isEmbeddedShopify', () => {
    it('is true when Shopify opened the page with its params', () => {
        at('/shopify/inbox?shop=acme.myshopify.com&host=abc')
        expect(isEmbeddedShopify()).toBe(true)
    })

    // The app moves to pages without the params; it is still the embedded app
    it('is true on an app route inside the admin frame', () => {
        framed(true)
        at('/shopify/customize')
        expect(isEmbeddedShopify()).toBe(true)
    })

    it('is false for the dashboard, which is never framed', () => {
        framed(false)
        at('/shopify/customize')
        expect(isEmbeddedShopify()).toBe(false)
        framed(true)
        at('/conversations')
        expect(isEmbeddedShopify()).toBe(false)
    })
})

describe('useImageFallback', () => {
    it('falls back when the image fails, and tries again for a new one', async () => {
        const source = ref('a.png')
        const { failed, onError } = useImageFallback(source)

        onError()
        expect(failed.value).toBe(true)

        source.value = 'b.png'
        await nextTick()
        expect(failed.value).toBe(false)
    })
})
