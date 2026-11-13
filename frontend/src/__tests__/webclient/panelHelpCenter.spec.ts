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
import { ref } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import StartState from '@/webclient/panel/StartState.vue'
import HelpCenterRow from '@/webclient/panel/HelpCenterRow.vue'
import { helpCenterLink } from '@/webclient/help-center-link'
import { fakeController, mountWithController } from './panelFakeController'
import { mountWidget, resetSocket, settle } from './widgetHarness'

vi.mock('@/composables/useWidgetSocket', async () => (await import('./widgetHarness')).socketModule())

/** The start state's help center row (plan 1.6). */

let wrapper: VueWrapper<any> | undefined

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
})

const mountRow = (url: string | null, component: any = HelpCenterRow) => {
    wrapper = mountWithController(component, fakeController({ helpCenterUrl: ref(url) }))
    return wrapper
}

describe('the help center link', () => {
    it.each(['https://help.acme.example', 'http://localhost:8000/help/acme'])('keeps a plain web address (%s)', (url) => {
        expect(helpCenterLink(url)).toBe(new URL(url).href)
    })

    it.each([null, undefined, '', 42, 'javascript:alert(1)', 'data:text/html,x', 'not a url', '//help.acme.example'])(
        'drops anything else (%s)', (raw) => {
            expect(helpCenterLink(raw)).toBeNull()
        })
})

describe('the help center row', () => {
    it('opens the help center in a new tab without an opener', () => {
        const link = mountRow('https://help.acme.example/').find('a')
        expect(link.attributes('href')).toBe('https://help.acme.example/')
        expect(link.attributes('target')).toBe('_blank')
        expect(link.attributes('rel')).toBe('noopener noreferrer')
    })

    it('says it opens a new tab to screen readers', () => {
        expect(mountRow('https://help.acme.example/').find('a').text()).toContain('(opens in a new tab)')
        expect(wrapper!.find('a').text()).toContain('Browse the help center')
    })

    it('is not shown without a live help center', () => {
        expect(mountRow(null).find('a').exists()).toBe(false)
    })

    it('sits on the start state', () => {
        expect(mountRow('https://help.acme.example/', StartState).find('a[href="https://help.acme.example/"]').exists()).toBe(true)
    })
})

describe('the real widget', () => {
    const v2 = { customization_metadata: { widget_ui: { version: 2 } } }
    const helpLink = (w: any) => w.find('a[href^="https://help.acme.example"]')

    it('shows the row from the startup data', async () => {
        resetSocket()
        const mounted = await mountWidget({ customization: v2, initialData: { helpCenterUrl: 'https://help.acme.example' } })
        wrapper = mounted.wrapper
        await settle(wrapper, 6)
        expect(helpLink(wrapper).exists()).toBe(true)
    })

    it.each([null, 'javascript:alert(1)'])('has no row when the server sends %s', async (helpCenterUrl) => {
        resetSocket()
        const mounted = await mountWidget({ customization: v2, initialData: { helpCenterUrl } })
        wrapper = mounted.wrapper
        await settle(wrapper, 6)
        expect(wrapper!.find('a[href^="javascript"]').exists()).toBe(false)
        expect(wrapper!.text()).not.toContain('Browse the help center')
    })
})
