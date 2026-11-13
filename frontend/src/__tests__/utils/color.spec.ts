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
import { contrastInk, contrastRatio, hexToRgb, readableOn } from '../../utils/color'

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

describe('readableOn', () => {
  it('leaves a colour that already reads alone', () => {
    expect(readableOn('#FFFFFF', '#4338CA', '#12131A', 4.5)).toBe('#4338CA')
  })

  it('moves a faint colour toward the ink only as far as it needs', () => {
    const lime = readableOn('#FFFFFF', '#C9F24E', '#12131A', 4.5)
    expect(contrastRatio(lime, '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
    expect(lime).not.toBe('#12131A')
  })

  it('returns the colour untouched when anything is not a hex', () => {
    expect(readableOn('transparent', '#C9F24E', '#12131A', 4.5)).toBe('#C9F24E')
    expect(readableOn('#FFFFFF', 'red', '#12131A', 4.5)).toBe('red')
    expect(readableOn('#FFFFFF', '#C9F24E', '', 4.5)).toBe('#C9F24E')
  })
})
