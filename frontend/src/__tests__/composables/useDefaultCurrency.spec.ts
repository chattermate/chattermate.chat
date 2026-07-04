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

import { describe, it, expect, vi, afterEach } from 'vitest'
import { detectDefaultCurrency } from '@/modules/enterprise/composables/useDefaultCurrency'

const mockTimeZone = (timeZone: string | undefined) => {
    vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
        resolvedOptions: () => ({ timeZone }),
    } as any)
}

describe('detectDefaultCurrency', () => {
    afterEach(() => vi.restoreAllMocks())

    it('returns INR for Indian timezones', () => {
        mockTimeZone('Asia/Kolkata')
        expect(detectDefaultCurrency()).toBe('INR')
        mockTimeZone('Asia/Calcutta')
        expect(detectDefaultCurrency()).toBe('INR')
    })

    it('returns INR for an Indian browser locale', () => {
        mockTimeZone('UTC')
        vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-IN')
        expect(detectDefaultCurrency()).toBe('INR')
    })

    it('returns USD elsewhere', () => {
        mockTimeZone('America/New_York')
        vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
        expect(detectDefaultCurrency()).toBe('USD')
    })

    it('returns USD when Intl is unavailable', () => {
        vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
            throw new Error('no Intl')
        })
        expect(detectDefaultCurrency()).toBe('USD')
    })
})
