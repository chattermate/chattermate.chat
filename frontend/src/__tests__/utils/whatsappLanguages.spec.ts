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
  WHATSAPP_LANGUAGES,
  DEFAULT_LANGUAGE,
  languageLabel,
} from '../../utils/whatsappLanguages'

describe('WHATSAPP_LANGUAGES', () => {
  it('carries the full list Meta publishes', () => {
    // Meta listed 111 at transcription time. A merge that silently drops half
    // the list would otherwise pass every other assertion here.
    expect(WHATSAPP_LANGUAGES.length).toBe(111)
  })

  it('has no duplicate codes', () => {
    const codes = WHATSAPP_LANGUAGES.map((l) => l.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('has no duplicate labels', () => {
    const labels = WHATSAPP_LANGUAGES.map((l) => l.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('uses codes in the shapes Meta actually publishes', () => {
    // Deliberately loose on length: `fil`/`prs_AF` are 3-letter languages and
    // `es_CRI` a 3-letter region, so a strict xx / xx_YY rule rejects valid codes.
    for (const { code } of WHATSAPP_LANGUAGES) {
      expect(code, code).toMatch(/^[a-z]{2,3}(_[A-Z]{2,3})?$/)
    }
  })

  it('keeps the irregular codes Meta actually uses', () => {
    const codes = WHATSAPP_LANGUAGES.map((l) => l.code)
    // Each of these breaks a naive assumption about the code format.
    expect(codes).toEqual(
      expect.arrayContaining(['fil', 'nb', 'prs_AF', 'es_CRI', 'zh_HK', 'si_LK', 'ky_KG', 'rw_RW']),
    )
  })

  it('is sorted by label so the picker reads alphabetically', () => {
    const labels = WHATSAPP_LANGUAGES.map((l) => l.label)
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)))
  })

  it('has a non-empty label for every entry', () => {
    for (const { code, label } of WHATSAPP_LANGUAGES) {
      expect(label.trim(), code).not.toBe('')
    }
  })
})

describe('DEFAULT_LANGUAGE', () => {
  it('is selectable in the picker', () => {
    expect(WHATSAPP_LANGUAGES.some((l) => l.code === DEFAULT_LANGUAGE)).toBe(true)
  })
})

describe('languageLabel', () => {
  it('names a known code', () => {
    expect(languageLabel('en_US')).toBe('English (US)')
    expect(languageLabel('pt_BR')).toBe('Portuguese (BR)')
  })

  it('falls back to the raw code', () => {
    // A template created elsewhere may use a language Meta added after this
    // list was written — showing the code beats showing nothing.
    expect(languageLabel('xx_YY')).toBe('xx_YY')
  })
})
