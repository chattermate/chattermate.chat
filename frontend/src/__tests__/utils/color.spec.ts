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
import { contrastInk, hexToRgb } from '../../utils/color'

describe('contrastInk', () => {
  it('returns dark ink over light colors', () => {
    expect(contrastInk('#FFFFFF')).toBe('#12131A')
    expect(contrastInk('#C9F24E')).toBe('#12131A')
  })

  it('returns white ink over dark colors', () => {
    expect(contrastInk('#0B0C10')).toBe('#FFFFFF')
    expect(contrastInk('#4338CA')).toBe('#FFFFFF')
  })

  it('falls back to white for invalid input', () => {
    expect(contrastInk('')).toBe('#FFFFFF')
    expect(contrastInk('not-a-color')).toBe('#FFFFFF')
    expect(contrastInk('#12')).toBe('#FFFFFF')
  })
})

describe('hexToRgb', () => {
  it('expands 3-digit hex values', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#a1c')).toEqual({ r: 170, g: 17, b: 204 })
  })

  it('parses 6-digit hex values with or without the hash', () => {
    expect(hexToRgb('#4338CA')).toEqual({ r: 67, g: 56, b: 202 })
    expect(hexToRgb('4338CA')).toEqual({ r: 67, g: 56, b: 202 })
  })

  it('returns null for invalid input', () => {
    expect(hexToRgb('#12345')).toBeNull()
    expect(hexToRgb('zzzzzz')).toBeNull()
  })
})
