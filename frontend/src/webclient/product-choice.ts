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
 * What the redesigned panel shows on a product card and in its sheet (plan 3.1,
 * 3.2), worked out from the product the server sent. Pure.
 */

import type { WidgetProduct, WidgetProductVariant } from '../types/widget'

/** "Only N left" shows at this stock or fewer, and only for tracked stock. */
export const LOW_STOCK = 5

export type Selection = Record<string, string>

const priceNumber = (price?: string | null) => (price == null || price === '' ? NaN : Number(price))

/** The stock still left when it is low enough to say so, else null. */
export function lowStock(product: WidgetProduct): number | null {
    const left = product.total_inventory
    return product.tracks_inventory === true && typeof left === 'number' && left > 0 && left <= LOW_STOCK ? left : null
}

/** Whether the price shown is the lowest of several ("From £X"). */
export const hasPriceRange = (product: WidgetProduct): boolean =>
    priceNumber(product.price_max) > priceNumber(product.price)

const variantsOf = (product: WidgetProduct): WidgetProductVariant[] =>
    Array.isArray(product.variants) ? product.variants.filter(v => v && typeof v.id === 'string' && !!v.id) : []

/** Whether the customer has to choose a variant, and can, in the sheet. */
export const needsChoice = (product: WidgetProduct): boolean =>
    product.published === true && variantsOf(product).length > 1 && variantsOf(product).some(v => v.available)

/** The variant the selection names, if every option is chosen. */
export function variantFor(product: WidgetProduct, selection: Selection): WidgetProductVariant | null {
    const options = product.options || []
    return variantsOf(product).find(v => options.every(o => v.options[o.name] === selection[o.name])) ?? null
}

/** Whether a value can still lead to a variant on sale, with the other choices kept. */
export function valueAvailable(product: WidgetProduct, selection: Selection, option: string, value: string): boolean {
    const wanted = { ...selection, [option]: value }
    return variantsOf(product).some(v => v.available
        && Object.entries(wanted).every(([name, chosen]) => v.options[name] === chosen))
}

/** Start from the first variant on sale, so Add works at once when it is the one wanted. */
export function firstSelection(product: WidgetProduct): Selection {
    const start = variantsOf(product).find(v => v.available)
    return start ? { ...start.options } : {}
}
