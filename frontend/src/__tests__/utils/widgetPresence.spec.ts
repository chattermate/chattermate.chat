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
import { presenceLine } from '@/utils/widgetPresence'
import { PANEL_PRESENCE_TEXT } from '@/webclient/copy'

describe('presenceLine', () => {
  it('promises instant replies only while the AI is answering', () => {
    const line = presenceLine({ mode: 'ai', available: true })
    expect(line).toEqual({ text: 'Online · replies instantly', online: true })
  })

  it('ignores business hours for an AI agent — it answers at 3am too', () => {
    expect(presenceLine({ mode: 'ai', available: false }).online).toBe(true)
  })

  it('sets a softer expectation when a person has to reply', () => {
    const line = presenceLine({ mode: 'human', available: true })
    expect(line.text).toBe('Online · usually replies in a few minutes')
    expect(line.online).toBe(true)
  })

  it('says away outside business hours instead of claiming to be online', () => {
    const line = presenceLine({ mode: 'human', available: false })
    expect(line.text).toContain('Away')
    expect(line.online).toBe(false)
  })

  it('switches to the human wording once someone takes the chat over', () => {
    // The agent still has AI enabled, but a person owns this conversation now.
    expect(presenceLine({ mode: 'ai', available: true }, true).text).toBe(
      'Online · usually replies in a few minutes'
    )
    expect(presenceLine({ mode: 'ai', available: false }, true).online).toBe(false)
  })

  it('keeps the old wording when the payload predates presence', () => {
    // An older cached widget page sends nothing — do not declare the team away
    // on no evidence.
    expect(presenceLine(undefined).text).toBe('Online · replies instantly')
    expect(presenceLine({}).text).toBe('Online · replies instantly')
  })

  it('speaks the redesigned panel\'s words when given them, with the same honesty', () => {
    expect(presenceLine({ mode: 'ai' }, false, PANEL_PRESENCE_TEXT))
      .toEqual({ text: 'AI agent · replies instantly', online: true })
    expect(presenceLine({ mode: 'human', available: true }, false, PANEL_PRESENCE_TEXT).text)
      .toBe('Online · usually replies in a few minutes')
    expect(presenceLine({ mode: 'human', available: false }, false, PANEL_PRESENCE_TEXT))
      .toEqual({ text: "Away · we'll reply when we're back", online: false })
    expect(presenceLine({ mode: 'ai' }, true, PANEL_PRESENCE_TEXT).text)
      .toBe('Online · usually replies in a few minutes')
  })
})
