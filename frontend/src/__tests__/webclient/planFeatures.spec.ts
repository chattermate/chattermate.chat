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

import { afterEach, describe, expect, it } from 'vitest'
import { planAllows } from '@/webclient/plan-features'

const boot = (planFeatures: unknown) => {
    window.__INITIAL_DATA__ = { planFeatures } as Window['__INITIAL_DATA__']
}

describe('what the plan lets the widget show', () => {
    afterEach(() => { delete window.__INITIAL_DATA__ })

    it('allows what the server says the plan has', () => {
        boot({ conversation_history: true, shop_in_chat: true })
        expect(planAllows('conversation_history')).toBe(true)
        expect(planAllows('shop_in_chat')).toBe(true)
    })

    it('hides what the server says the plan leaves out', () => {
        boot({ conversation_history: false, shop_in_chat: false })
        expect(planAllows('conversation_history')).toBe(false)
        expect(planAllows('shop_in_chat')).toBe(false)
    })

    it('allows everything when no flags were sent (preview, older backend)', () => {
        boot(undefined)
        expect(planAllows('conversation_history')).toBe(true)
        delete window.__INITIAL_DATA__
        expect(planAllows('shop_in_chat')).toBe(true)
    })
})
