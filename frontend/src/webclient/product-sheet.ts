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
 * The product sheet's state: the product whose options the visitor is choosing,
 * opened from a card in any message and drawn once over the panel (ProductSheet).
 */

import { ref } from 'vue'
import type { WidgetProduct, WidgetProductChoices } from '../types/widget'

export interface OpenSheet {
    product: WidgetProduct
    shopDomain?: string | null
    /** Null while they are being read (product_options); then what the shop said. */
    choices: WidgetProductChoices | null
}

export const productSheet = ref<OpenSheet | null>(null)

export function openProductSheet(product: WidgetProduct, shopDomain?: string | null): void {
    productSheet.value = { product, shopDomain, choices: null }
}

export function closeProductSheet(): void {
    productSheet.value = null
}

/** The shop's answer for the open product (a late answer for another product is dropped). */
export function settleProductSheet(productId: string, choices: WidgetProductChoices): void {
    if (productSheet.value?.product.id === productId) productSheet.value = { ...productSheet.value, choices }
}
