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

import { choicesFrom } from '../webclient/product-choice'
import { settleProductSheet } from '../webclient/product-sheet'

/** How long the sheet waits for the shop before it offers the product page instead. */
export const PRODUCT_OPTIONS_TIMEOUT_MS = 10000

const NONE = { options: [], variants: [], complete: false }

/**
 * The product sheet's options, read from the shop when the sheet opens
 * (product_options → product_options_result). No answer in time is the same as
 * a product the sheet can't show: its own page takes over.
 */
export function useProductOptions(options: {
    on: (event: string, listener: (...args: any[]) => void) => void
    emit: (event: string, data?: unknown) => void
}) {
    const timers = new Map<string, ReturnType<typeof setTimeout>>()

    const settle = (productId: string, data: Record<string, unknown>) => {
        clearTimeout(timers.get(productId))
        timers.delete(productId)
        settleProductSheet(productId, choicesFrom(data))
    }

    options.on('product_options_result', (data: Record<string, unknown>) => {
        if (data && typeof data.product_id === 'string') settle(data.product_id, data)
    })

    const requestProductOptions = (productId: string) => {
        clearTimeout(timers.get(productId))
        timers.set(productId, setTimeout(() => settle(productId, NONE), PRODUCT_OPTIONS_TIMEOUT_MS))
        options.emit('product_options', { product_id: productId })
    }

    return { requestProductOptions }
}
