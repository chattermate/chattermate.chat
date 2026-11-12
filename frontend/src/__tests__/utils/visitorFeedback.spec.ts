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
import { visitorFeedbackIn, withVisitorFeedback } from '@/utils/visitorFeedback'

describe('the visitor\'s thumb on a reply', () => {
  it('is read only as up or down', () => {
    expect(visitorFeedbackIn({ visitor_feedback: 'up' })).toBe('up')
    expect(visitorFeedbackIn({ visitor_feedback: 'down' })).toBe('down')
    expect(visitorFeedbackIn({ visitor_feedback: 'meh' })).toBeNull()
    expect(visitorFeedbackIn(null)).toBeNull()
    expect(visitorFeedbackIn('up')).toBeNull()
  })

  it('is set, changed and taken back without touching the other attributes', () => {
    const original = { sources: ['a'] }
    const rated = withVisitorFeedback(original, 'up')
    expect(rated).toEqual({ sources: ['a'], visitor_feedback: 'up' })
    expect(original).toEqual({ sources: ['a'] })
    expect(withVisitorFeedback(rated, 'down')).toEqual({ sources: ['a'], visitor_feedback: 'down' })
    expect(withVisitorFeedback(rated, null)).toEqual({ sources: ['a'] })
    expect(withVisitorFeedback(undefined, 'up')).toEqual({ visitor_feedback: 'up' })
    expect(withVisitorFeedback(rated, 'nonsense')).toEqual({ sources: ['a'] })
  })
})
