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
import { getInitials } from '@/utils/text'

describe('getInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getInitials('John Doe')).toBe('JD')
    expect(getInitials('Maya Chen Rodriguez')).toBe('MC')
    expect(getInitials('Cher')).toBe('C')
  })

  // Hyphens are part of the name, not a word boundary — splitting on them
  // would drop the surname ("Jean-Luc Picard" → "JL" instead of "JP")
  it('keeps hyphenated and apostrophised names intact', () => {
    expect(getInitials('Jean-Luc Picard')).toBe('JP')
    expect(getInitials("Anne-Marie O'Brien")).toBe('AO')
  })

  it('derives initials from an email local part', () => {
    expect(getInitials('john.doe@example.com')).toBe('JD')
    expect(getInitials('arun_r@example.com')).toBe('AR')
    expect(getInitials('support@example.com')).toBe('S')
  })

  it('falls back when there is nothing to work with', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials(null)).toBe('?')
    expect(getInitials(undefined)).toBe('?')
    expect(getInitials('   ')).toBe('?')
    expect(getInitials('', '')).toBe('')
  })
})
