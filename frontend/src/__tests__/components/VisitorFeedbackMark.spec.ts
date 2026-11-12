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
import { mount } from '@vue/test-utils'
import VisitorFeedbackMark from '@/components/conversations/VisitorFeedbackMark.vue'

const stubs = { global: { stubs: { 'font-awesome-icon': true } } }

/** The team sees the visitor's thumb on an AI reply in the conversation. */
describe('VisitorFeedbackMark', () => {
  it.each([
    ['up', 'Visitor found this helpful', 'fa-solid fa-thumbs-up'],
    ['down', 'Visitor found this not helpful', 'fa-solid fa-thumbs-down'],
  ] as const)('says a thumb %s in words and shows its icon', (value, label, icon) => {
    const mark = mount(VisitorFeedbackMark, { props: { value }, ...stubs })
    expect(mark.attributes('aria-label')).toBe(label)
    expect(mark.attributes('title')).toBe(label)
    expect(mark.classes()).toContain(`is-${value}`)
    expect(mark.find('font-awesome-icon-stub').attributes('icon')).toBe(icon)
  })
})
