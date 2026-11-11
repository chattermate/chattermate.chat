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

/**
 * Product helpers for Shopify product messages.
 */

export interface ProductRef {
    handle?: string | null
    id?: string | number | null
}

export type ProductUrlResult =
    | { url: string }
    | { error: 'missing_shop' | 'missing_product' }

/** The storefront page for a product: by handle, else by id. */
export const productUrl = (product: ProductRef, shopDomain?: string | null): ProductUrlResult => {
    if (!shopDomain) return { error: 'missing_shop' }
    if (product.handle) return { url: `https://${shopDomain}/products/${product.handle}` }
    if (product.id) return { url: `https://${shopDomain}/products/${product.id}` }
    return { error: 'missing_product' }
}

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(([^)]+)\)/g
const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)]+)\)/g
const BARE_URL = /https?:\/\/[^\s)]+/g

/**
 * Text shown above product cards: images are dropped (the cards show them) and
 * bare URLs become "[link removed]", while markdown links are kept.
 */
export const stripUrlsForProducts = (text?: string | null): string => {
    if (!text) return ''
    const markdownLinks: string[] = []
    let processed = text
        .replace(MARKDOWN_IMAGE, '')
        .replace(MARKDOWN_LINK, (match) => {
            markdownLinks.push(match)
            return `__MARKDOWN_LINK_${markdownLinks.length - 1}__`
        })
        .replace(BARE_URL, '[link removed]')
    // A function replacer: a link text holding `$&` or `$1` must come back as written.
    markdownLinks.forEach((link, index) => {
        processed = processed.replace(`__MARKDOWN_LINK_${index}__`, () => link)
    })
    // Clean up the blank lines left where images were.
    return processed.replace(/\n\s*\n\s*\n/g, '\n\n').trim()
}
