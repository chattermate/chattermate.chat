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
 * Validation for workflow form fields (full-screen and in-chat forms).
 */

import { isValidEmail } from '../../types/widget'

export interface FormFieldRule {
    label?: string
    type?: string
    required?: boolean
    minLength?: number
    maxLength?: number
}

/** 7 to 15 digits once spaces and punctuation are removed (international range). */
export const isValidPhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 7 && digits.length <= 15
}

const isBlank = (value: unknown): boolean => !value || value.toString().trim() === ''

/** The error to show for a field's value, or null when it is valid. */
export const validateFormField = (field: FormFieldRule, value: any): string | null => {
    if (field.required && isBlank(value)) return `${field.label} is required`
    if (isBlank(value)) return null

    if (field.type === 'email' && !isValidEmail(value)) return 'Please enter a valid email address'
    if (field.type === 'tel' && !isValidPhoneNumber(value)) return 'Please enter a valid phone number'

    if (field.type === 'text' || field.type === 'textarea') {
        if (field.minLength && value.length < field.minLength) {
            return `${field.label} must be at least ${field.minLength} characters`
        }
        if (field.maxLength && value.length > field.maxLength) {
            return `${field.label} must not exceed ${field.maxLength} characters`
        }
    }

    if (field.type === 'number') {
        const number = parseFloat(value)
        if (isNaN(number)) return `${field.label} must be a valid number`
        // Pinned current behaviour (odd): number bounds come from minLength/maxLength,
        // while the number input itself is given min/max.
        if (field.minLength && number < field.minLength) return `${field.label} must be at least ${field.minLength}`
        if (field.maxLength && number > field.maxLength) return `${field.label} must not exceed ${field.maxLength}`
    }

    return null
}
