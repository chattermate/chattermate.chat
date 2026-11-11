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

import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { type VueWrapper } from '@vue/test-utils'
import StartSuggestions from '@/webclient/panel/StartSuggestions.vue'
import { usePageSuggestions } from '@/composables/usePageSuggestions'
import { setHostPageUrl } from '@/webclient/frame-session'
import { actionLabel, actionMatch, everyPageLabels, keywordIcon, toQuickAction } from '@/webclient/quick-actions'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'

let wrapper: VueWrapper<any> | undefined
let ctrl: FakeController
afterEach(() => { wrapper?.unmount(); wrapper = undefined })

describe('quick actions', () => {
    it('keeps plain strings for every page and rules for some', () => {
        expect(everyPageLabels(['Track my order', { label: 'Sizes?', match: '/products/*' }, { label: 'Hours?' }, ' ', 7]))
            .toEqual(['Track my order', 'Hours?'])
        expect(toQuickAction(' Hi ', '')).toBe('Hi')
        expect(toQuickAction('Sizes?', 'products/*')).toEqual({ label: 'Sizes?', match: '/products/*' })
        expect(toQuickAction('Sizes?', '', { label: 'Sizes?', icon: 'product' })).toEqual({ label: 'Sizes?', icon: 'product' })
        expect(actionLabel({ label: 'A', match: '/x' })).toBe('A')
        expect(actionMatch('A')).toBe('')
    })

    it('picks an icon from the words, as the server does', () => {
        expect(keywordIcon('Track my order')).toBe('order')
        expect(keywordIcon('Can I get a refund?')).toBe('returns')
        expect(keywordIcon('Hello')).toBe('question')
    })
})

describe('usePageSuggestions', () => {
    const setUp = () => {
        const listeners: Record<string, (data: any) => void> = {}
        const emit = vi.fn()
        const active = ref(false)
        const scope = effectScope()
        const { pageSuggestions } = scope.run(() => usePageSuggestions({ on: (e, fn) => { listeners[e] = fn }, emit, active }))!
        return { pageSuggestions, emit, active, hear: (e: string, d: unknown) => listeners[e](d), stop: () => scope.stop() }
    }

    it('asks for the page while active, again when the page changes, and keeps only that page\'s answer', async () => {
        setHostPageUrl('https://shop.example/products/tee', 'Tee')
        const s = setUp()
        expect(s.emit).not.toHaveBeenCalled()
        s.active.value = true
        await nextTick()
        expect(s.emit).toHaveBeenLastCalledWith('page_suggestions', { url: 'https://shop.example/products/tee', title: 'Tee' })
        s.hear('suggestions', { url: 'https://shop.example/other', heading: 'page', items: [{ label: 'Old' }] })
        expect(s.pageSuggestions.value.loaded).toBe(false)
        s.hear('suggestions', { url: 'https://shop.example/products/tee', heading: 'page', pill: 'Tee',
            items: [{ label: 'Is this in stock?', icon: 'product' }, { label: 'x', icon: 'rocket' }, { label: '' }] })
        expect(s.pageSuggestions.value).toEqual({ loaded: true, heading: 'page', pill: 'Tee', items: [
            { label: 'Is this in stock?', icon: 'product' }, { label: 'x', icon: 'question' },
        ] })
        setHostPageUrl('https://shop.example/cart', 'Cart')
        await nextTick()
        expect(s.emit).toHaveBeenLastCalledWith('page_suggestions', { url: 'https://shop.example/cart', title: 'Cart' })
        expect(s.pageSuggestions.value.loaded).toBe(false)
        s.stop()
    })
})

describe('the start state\'s suggestions', () => {
    it('shows the agent\'s quick actions with keyword icons until the page answers', async () => {
        ctrl = fakeController({ quickActions: ref(['Track my order']) as any })
        wrapper = mountWithController(StartSuggestions, ctrl)
        expect(wrapper.find('.cm-suggestions__heading').exists()).toBe(false)
        expect(wrapper.text()).toContain('Track my order')

        ctrl.pageSuggestions.value = { loaded: true, heading: 'page', pill: 'Organic Tee', items: [{ label: 'Is this in stock?', icon: 'product' }] }
        await nextTick()
        expect(wrapper.get('.cm-suggestions__heading').text()).toBe('Suggested for this pageOrganic Tee')
        expect(wrapper.findAll('.cm-suggestion').map(b => b.text())).toEqual(['Is this in stock?'])
        await wrapper.get('.cm-suggestion').trigger('click')
        expect(ctrl.sendQuickAction).toHaveBeenCalledWith('Is this in stock?')
    })

    it('says "Popular questions" without a pill when nothing is about this page', async () => {
        ctrl = fakeController()
        ctrl.pageSuggestions.value = { loaded: true, heading: 'popular', pill: null, items: [{ label: 'Hours?', icon: 'question' }] }
        wrapper = mountWithController(StartSuggestions, ctrl)
        expect(wrapper.get('.cm-suggestions__heading').text()).toBe('Popular questions')
    })
})
