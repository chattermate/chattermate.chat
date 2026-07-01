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

import { describe, it, expect } from 'vitest'
import {
  validatePassword,
  validateDomain,
  validateEmail,
  validateName,
  validateOrgName
} from '../../utils/validators'

describe('validatePassword', () => {
  it('returns correct score for weak password', () => {
    const result = validatePassword('weak')
    expect(result.score).toBe(1) // has lowercase only
    expect(result.hasMinLength).toBe(false)
    expect(result.hasLowerCase).toBe(true)
    expect(result.hasUpperCase).toBe(false)
    expect(result.hasNumber).toBe(false)
    expect(result.hasSpecialChar).toBe(false)
  })

  it('returns correct score for strong password', () => {
    const result = validatePassword('StrongP@ss123')
    expect(result.score).toBe(5) // has all requirements
    expect(result.hasMinLength).toBe(true)
    expect(result.hasLowerCase).toBe(true)
    expect(result.hasUpperCase).toBe(true)
    expect(result.hasNumber).toBe(true)
    expect(result.hasSpecialChar).toBe(true)
  })
})

describe('validateDomain', () => {
  it('validates correct domains', () => {
    expect(validateDomain('example.com')).toBe(true)
    expect(validateDomain('sub.example.com')).toBe(true)
    expect(validateDomain('sub-domain.example.co.uk')).toBe(true)
  })

  it('rejects invalid domains', () => {
    expect(validateDomain('invalid')).toBe(false)
    expect(validateDomain('invalid@domain')).toBe(false)
    expect(validateDomain('invalid..')).toBe(false)
  })
})

describe('validateEmail', () => {
  it('validates correct email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('user.name+tag@example.co.uk')).toBe(true)
  })

  it('rejects invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('invalid@')).toBe(false)
    expect(validateEmail('@invalid.com')).toBe(false)
  })
})

describe('validateName', () => {
  it('validates correct names', () => {
    expect(validateName('John')).toBe(true)
    expect(validateName('John Doe')).toBe(true)
    expect(validateName('Mary-Jane')).toBe(true)
  })

  it('rejects invalid names', () => {
    expect(validateName('a')).toBe(false) // too short
    expect(validateName('J@hn')).toBe(false) // special characters
    expect(validateName('a'.repeat(101))).toBe(false) // too long
  })
})

describe('validateOrgName', () => {
  it('validates correct organization names', () => {
    expect(validateOrgName('Acme Corp')).toBe(true)
    expect(validateOrgName('Johnson & Johnson')).toBe(true)
    expect(validateOrgName('Tech-Co Inc.')).toBe(true)
  })

  it('rejects invalid organization names', () => {
    expect(validateOrgName('a')).toBe(false) // too short
    expect(validateOrgName('Corp@')).toBe(false) // invalid special characters
    expect(validateOrgName('a'.repeat(101))).toBe(false) // too long
  })
}) 