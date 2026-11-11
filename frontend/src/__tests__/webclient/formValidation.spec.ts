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
import { isValidPhoneNumber, validateFormField } from '@/webclient/forms/validation'

describe('form field validation', () => {
    it('requires required fields, and nothing else on an empty optional one', () => {
        expect(validateFormField({ label: 'Name', type: 'text', required: true }, '  ')).toBe('Name is required')
        expect(validateFormField({ label: 'Name', type: 'email' }, '')).toBeNull()
    })

    it('checks emails and phone numbers', () => {
        expect(validateFormField({ label: 'Email', type: 'email' }, 'not-an-email')).toBe('Please enter a valid email address')
        expect(validateFormField({ label: 'Email', type: 'email' }, 'a@b.co')).toBeNull()
        expect(validateFormField({ label: 'Phone', type: 'tel' }, '12-34')).toBe('Please enter a valid phone number')
        expect(validateFormField({ label: 'Phone', type: 'tel' }, '+44 20 7946 0123')).toBeNull()
    })

    it('checks text length', () => {
        expect(validateFormField({ label: 'Note', type: 'textarea', minLength: 5 }, 'abc')).toBe('Note must be at least 5 characters')
        expect(validateFormField({ label: 'Note', type: 'text', maxLength: 3 }, 'abcd')).toBe('Note must not exceed 3 characters')
    })

    it('checks numbers, using the length limits as bounds', () => {
        expect(validateFormField({ label: 'Qty', type: 'number' }, 'x')).toBe('Qty must be a valid number')
        // Pinned current behaviour (odd): number bounds come from minLength/maxLength.
        expect(validateFormField({ label: 'Qty', type: 'number', minLength: 2 }, '1')).toBe('Qty must be at least 2')
        expect(validateFormField({ label: 'Qty', type: 'number', maxLength: 9 }, '10')).toBe('Qty must not exceed 9')
    })

    it('accepts 7 to 15 digits as a phone number', () => {
        expect(isValidPhoneNumber('1234567')).toBe(true)
        expect(isValidPhoneNumber('123456')).toBe(false)
        expect(isValidPhoneNumber('1234567890123456')).toBe(false)
    })

    it('accepts exactly 15 digits, with or without punctuation', () => {
        expect(isValidPhoneNumber('123456789012345')).toBe(true)
        expect(isValidPhoneNumber('+1 (234) 567-890-12345')).toBe(true)
        expect(validateFormField({ label: 'Phone', type: 'tel' }, '+12 345 678 901 2345')).toBeNull()
    })

    it('accepts text exactly at its length limits', () => {
        expect(validateFormField({ label: 'Note', type: 'text', minLength: 5 }, 'abcde')).toBeNull()
        expect(validateFormField({ label: 'Note', type: 'textarea', maxLength: 3 }, 'abc')).toBeNull()
    })

    it('accepts numbers exactly at their bounds', () => {
        expect(validateFormField({ label: 'Qty', type: 'number', minLength: 2 }, '2')).toBeNull()
        expect(validateFormField({ label: 'Qty', type: 'number', maxLength: 9 }, '9')).toBeNull()
    })

    it('treats a numeric 0 on a required number field as blank', () => {
        // Pinned current behaviour (bug): isBlank uses `!value`, so the number 0 is
        // reported as missing; the string '0' passes.
        expect(validateFormField({ label: 'Qty', type: 'number', required: true }, 0)).toBe('Qty is required')
        expect(validateFormField({ label: 'Qty', type: 'number', required: true }, '0')).toBeNull()
    })
})
