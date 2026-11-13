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

import type { WidgetProduct, WidgetProductChoices, WidgetProductVariant } from '../types/widget'

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

/** Whether the customer has to choose a variant, and can, in the product sheet. */
export const needsChoice = (product: WidgetProduct): boolean =>
    product.published === true && product.has_choices === true

/** The variant the selection names, if every option is chosen. */
export function variantFor(choices: WidgetProductChoices, selection: Selection): WidgetProductVariant | null {
    if (!choices.options.length) return null
    return choices.variants.find(v => choices.options.every(o => v.options[o.name] === selection[o.name])) ?? null
}

/** Whether every option has a value chosen. */
export const everyOptionChosen = (choices: WidgetProductChoices, selection: Selection): boolean =>
    choices.options.every(o => selection[o.name] !== undefined)

/** Whether a value can still lead to a variant on sale, with the other choices kept. */
export function valueAvailable(choices: WidgetProductChoices, selection: Selection, option: string, value: string): boolean {
    const wanted = { ...selection, [option]: value }
    return choices.variants.some(v => v.available
        && Object.entries(wanted).every(([name, chosen]) => v.options[name] === chosen))
}

/** Start from the first variant on sale, so Add works at once when it is the one wanted. */
export function firstSelection(choices: WidgetProductChoices): Selection {
    const start = choices.variants.find(v => v.available)
    return start ? { ...start.options } : {}
}

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object'

/** The sheet's choices from the server's answer (product_options_result), validated. */
export function choicesFrom(data: Record<string, unknown>): WidgetProductChoices {
    const options = (Array.isArray(data.options) ? data.options : []).filter(isObject)
        .filter(o => typeof o.name === 'string' && o.name && Array.isArray(o.values))
        .map(o => ({ name: o.name as string, values: (o.values as unknown[]).filter((v): v is string => typeof v === 'string') }))
    const variants = (Array.isArray(data.variants) ? data.variants : []).filter(isObject)
        .filter(v => typeof v.id === 'string' && /^[0-9]{1,15}$/.test(v.id) && isObject(v.options))
        .map(v => ({
            id: v.id as string,
            title: typeof v.title === 'string' ? v.title : null,
            available: v.available === true,
            price: typeof v.price === 'string' ? v.price : null,
            options: Object.fromEntries(Object.entries(v.options as Record<string, unknown>)
                .filter((entry): entry is [string, string] => typeof entry[1] === 'string')),
        }))
    return { options, variants, complete: data.complete === true && options.length > 0 && variants.length > 1 }
}
