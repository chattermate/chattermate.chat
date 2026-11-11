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
import { citationLabel, citationTooltip, looksLikeOpaqueId, prettyType } from '@/webclient/citations'

describe('citation labels', () => {
    it('shows the readable name of a document', () => {
        expect(citationLabel({ name: 'Shipping policy', type: 'url' })).toBe('Shipping policy')
    })

    it('drops a stored hash prefix and a file extension', () => {
        expect(citationLabel({ name: 'ce983a1b2c3d4e5f6a7b_coachiq-faq.pdf', type: 'pdf' })).toBe('coachiq-faq')
    })

    it('falls back to the source type for an opaque id or no name', () => {
        expect(citationLabel({ name: '0123456789abcdef0123', type: 'website' })).toBe('Website')
        expect(citationLabel({ name: '', type: '' })).toBe('Knowledge base')
        expect(citationLabel({ name: '  ', type: 'unknown' })).toBe('Knowledge base')
    })

    it('adds the type to the tooltip unless the label already is the type', () => {
        expect(citationTooltip({ name: 'FAQ', type: 'url' })).toBe('FAQ · Url')
        expect(citationTooltip({ name: '', type: 'pdf' })).toBe('Pdf')
    })

    it('recognises hex ids and uuids', () => {
        expect(looksLikeOpaqueId('0123456789abcdef')).toBe(true)
        expect(looksLikeOpaqueId('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
        expect(looksLikeOpaqueId('returns-faq')).toBe(false)
        expect(prettyType('FILE')).toBe('File')
    })
})
