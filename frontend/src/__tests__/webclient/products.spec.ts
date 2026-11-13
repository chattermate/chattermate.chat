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
import { productUrl, stripUrlsForProducts } from '@/webclient/products'

describe('the storefront link for a product', () => {
    it('uses the handle, then the id', () => {
        expect(productUrl({ handle: 'blue-mug', id: 7 }, 'shop.myshopify.com')).toEqual({ url: 'https://shop.myshopify.com/products/blue-mug' })
        expect(productUrl({ id: 7 }, 'shop.myshopify.com')).toEqual({ url: 'https://shop.myshopify.com/products/7' })
    })

    it('reports what is missing instead of guessing', () => {
        expect(productUrl({ handle: 'blue-mug' }, '')).toEqual({ error: 'missing_shop' })
        expect(productUrl({ handle: 'blue-mug' }, null)).toEqual({ error: 'missing_shop' })
        expect(productUrl({}, 'shop.myshopify.com')).toEqual({ error: 'missing_product' })
    })

    it('treats an id of 0 as missing', () => {
        // Pinned current behaviour (bug): the id check is a truthiness test, so a
        // numeric id of 0 counts as no id (Shopify never issues 0, so harmless today).
        expect(productUrl({ id: 0 }, 'shop.myshopify.com')).toEqual({ error: 'missing_product' })
    })
})

describe('the text above product cards', () => {
    it('removes bare URLs and images but keeps markdown links', () => {
        const text = 'See https://shop.example/a and [our guide](https://shop.example/guide)\n\n![mug](https://cdn/x.png)\n\n\nDone'
        expect(stripUrlsForProducts(text)).toBe('See [link removed] and [our guide](https://shop.example/guide)\n\nDone')
    })

    it('keeps a markdown link whose text holds a dollar pattern', () => {
        expect(stripUrlsForProducts('Buy [deal $& more](https://shop.example/d) now')).toBe('Buy [deal $& more](https://shop.example/d) now')
    })

    it('handles empty text', () => {
        expect(stripUrlsForProducts('')).toBe('')
        expect(stripUrlsForProducts(null)).toBe('')
    })

    it('keeps ten or more markdown links each in its own place', () => {
        const links = Array.from({ length: 12 }, (_, i) => `[item ${i}](https://shop.example/p/${i})`)
        const text = links.join(' and ')
        expect(stripUrlsForProducts(text)).toBe(text)
    })
})
