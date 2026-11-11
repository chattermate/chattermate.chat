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
import { firstSelection, hasPriceRange, lowStock, needsChoice, valueAvailable, variantFor } from '@/webclient/product-choice'
import type { WidgetProduct } from '@/types/widget'

const tee: WidgetProduct = {
    id: 'p1', title: 'Tee', price: '20.00', price_max: '24.00', published: true,
    tracks_inventory: true, total_inventory: 3,
    options: [{ name: 'Size', values: ['S', 'M', 'L'] }, { name: 'Colour', values: ['Red', 'Blue'] }],
    variants: [
        { id: '1', available: false, options: { Size: 'S', Colour: 'Red' } },
        { id: '2', available: true, options: { Size: 'M', Colour: 'Red' }, price: '22.00' },
        { id: '3', available: true, options: { Size: 'S', Colour: 'Blue' } },
        { id: '4', available: false, options: { Size: 'L', Colour: 'Blue' } },
    ],
}

describe('product choice', () => {
    it('says low stock only for tracked stock of five or fewer', () => {
        expect(lowStock(tee)).toBe(3)
        expect(lowStock({ ...tee, total_inventory: 6 })).toBeNull()
        expect(lowStock({ ...tee, total_inventory: 0 })).toBeNull()
        expect(lowStock({ ...tee, tracks_inventory: false })).toBeNull()
        expect(lowStock({ ...tee, total_inventory: undefined })).toBeNull()
    })

    it('knows a price range', () => {
        expect(hasPriceRange(tee)).toBe(true)
        expect(hasPriceRange({ ...tee, price_max: '20.00' })).toBe(false)
        expect(hasPriceRange({ ...tee, price_max: null })).toBe(false)
    })

    it('needs a choice for a published product with several variants, one on sale', () => {
        expect(needsChoice(tee)).toBe(true)
        expect(needsChoice({ ...tee, published: false })).toBe(false)
        expect(needsChoice({ ...tee, variants: tee.variants!.map(v => ({ ...v, available: false })) })).toBe(false)
        expect(needsChoice({ ...tee, variants: [tee.variants![1]] })).toBe(false)
    })

    it('finds the chosen variant, and none until every option is picked', () => {
        expect(variantFor(tee, { Size: 'M', Colour: 'Red' })?.id).toBe('2')
        expect(variantFor(tee, { Size: 'M' })).toBeNull()
    })

    it('marks values that cannot lead to a variant on sale', () => {
        const red = { Size: 'M', Colour: 'Red' }
        expect(valueAvailable(tee, red, 'Size', 'S')).toBe(false)
        expect(valueAvailable(tee, red, 'Size', 'M')).toBe(true)
        expect(valueAvailable(tee, { Size: 'S', Colour: 'Blue' }, 'Size', 'L')).toBe(false)
    })

    it('starts on the first variant on sale', () => {
        expect(firstSelection(tee)).toEqual({ Size: 'M', Colour: 'Red' })
        expect(firstSelection({ ...tee, variants: [] })).toEqual({})
    })
})
