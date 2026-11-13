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
import { nextTick, ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import PanelHeader from '@/webclient/panel/PanelHeader.vue'
import AgentMark from '@/webclient/panel/AgentMark.vue'
import { PANEL_PRESENCE_TEXT } from '@/webclient/copy'
import { fakeController, mountWithController, type FakeController } from './panelFakeController'

let wrapper: VueWrapper | undefined

afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    delete window.__INITIAL_DATA__
})

const header = (overrides: Partial<FakeController> = {}) => {
    const ctrl = fakeController(overrides)
    wrapper = mountWithController(PanelHeader, ctrl)
    return { ctrl, wrapper }
}

const status = () => wrapper!.find('.cm-status').text()
const dot = (which: 'ai' | 'human') => wrapper!.find(`[data-dot="${which}"]`)

describe('the panel header', () => {
    it('names the agent and says it replies instantly (the AI is named once, in the footer)', () => {
        header()
        expect(wrapper!.find('.header-info h3').text()).toBe('Ada')
        expect(status()).toBe('Replies instantly')
    })

    it('says "Working on it…" while a reply is being worked on, and pulses the AI dot', async () => {
        const { ctrl } = header()
        expect(dot('ai').classes()).not.toContain('cm-pulse')
        ctrl.loading.value = true
        await wrapper!.vm.$nextTick()
        expect(status()).toBe('Working on it…')
        expect(dot('ai').classes()).toContain('cm-pulse')
    })

    it('keeps the honest away wording, and marks away by shape as well as words', () => {
        header({ presence: ref({ text: PANEL_PRESENCE_TEXT.away, online: false }) })
        expect(status()).toBe("Away · we'll reply when we're back")
        expect(wrapper!.find('.cm-status').classes()).toContain('is-away')
    })

    it('shows the person who took over, with their initials when they have no photo', () => {
        header({
            humanAgent: ref({ human_agent_name: 'Priya Rao' }),
            isHandedOverToHuman: ref(true),
            presence: ref({ text: PANEL_PRESENCE_TEXT.human, online: true }),
        })
        expect(wrapper!.find('.header-info h3').text()).toBe('Priya Rao')
        expect(wrapper!.find('.cm-person').text()).toBe('PR')
        expect(dot('human').classes()).toContain('is-joined')
    })

    it('shows the person\'s photo after a takeover', () => {
        header({
            humanAgent: ref({ human_agent_name: 'Priya' }),
            humanAgentPhotoUrl: ref('https://cdn.test/priya.png'),
            isHandedOverToHuman: ref(true),
        })
        expect(wrapper!.find('.cm-person img').attributes('src')).toBe('https://cdn.test/priya.png')
    })

    it('never shows a person before anyone has joined (no team presence)', () => {
        header()
        expect(wrapper!.find('.cm-person').exists()).toBe(false)
        expect(dot('human').classes()).not.toContain('is-joined')
    })

    it('does not say "Working on it…" once a person owns the conversation', () => {
        header({ loading: ref(true), isHandedOverToHuman: ref(true) })
        expect(status()).not.toBe('Working on it…')
    })

    it('minimizes the widget', async () => {
        const { ctrl } = header()
        await wrapper!.get('button[aria-label="Minimize chat"]').trigger('click')
        expect(ctrl.minimizeWidget).toHaveBeenCalledTimes(1)
    })

    it('offers a new chat only when the agent allows it, and says when it is asking', async () => {
        const { ctrl } = header()
        expect(wrapper!.find('button[aria-label="Start a new chat"]').exists()).toBe(false)
        ctrl.canStartNewChat.value = true
        await wrapper!.vm.$nextTick()
        const button = wrapper!.get('button[aria-label="Start a new chat"]')
        expect(button.attributes('aria-expanded')).toBe('false')
        await button.trigger('click')
        expect(ctrl.requestNewChat).toHaveBeenCalledTimes(1)
        ctrl.newChatArmed.value = true
        ctrl.startingNewChat.value = true
        await wrapper!.vm.$nextTick()
        expect(button.attributes('aria-expanded')).toBe('true')
        expect(button.attributes('disabled')).toBeDefined()
    })

    it('offers expand only when the loader can size the panel up, and says which way it goes', async () => {
        header()
        expect(wrapper!.find('button[aria-label="Expand chat"]').exists()).toBe(false)
        await wrapper!.setProps({ canExpand: true })
        await wrapper!.get('button[aria-label="Expand chat"]').trigger('click')
        expect(wrapper!.emitted('expand')).toHaveLength(1)
        await wrapper!.setProps({ expanded: true })
        expect(wrapper!.find('button[aria-label="Make chat smaller"]').exists()).toBe(true)
    })

    it('opens the visitor\'s conversations from the clock, and closes them again', async () => {
        const { ctrl } = header({ canStartNewChat: ref(true) })
        const clock = wrapper!.get('button[aria-label="Your conversations"]')
        expect(clock.attributes('aria-pressed')).toBe('false')
        await clock.trigger('click')
        expect(ctrl.openHistory).toHaveBeenCalled()
        ctrl.history.value = { ...ctrl.history.value, showing: true }
        await nextTick()
        await clock.trigger('click')
        expect(ctrl.closeHistory).toHaveBeenCalled()
    })

    it('has no history button without a conversation of the visitor\'s own', () => {
        header({ hasConversationToken: ref(false) })
        expect(wrapper!.find('button[aria-label="Your conversations"]').exists()).toBe(false)
    })

    it('has no history button on a plan without past chats (Free)', () => {
        window.__INITIAL_DATA__ = { planFeatures: { conversation_history: false } } as Window['__INITIAL_DATA__']
        header()
        expect(wrapper!.find('button[aria-label="Your conversations"]').exists()).toBe(false)
    })

    it('uses the agent photo instead of the mark', () => {
        header({ photoUrl: ref('https://cdn.test/ada.png') })
        expect(wrapper!.find('.cm-mark__photo').attributes('src')).toBe('https://cdn.test/ada.png')
        expect(wrapper!.find('[data-dot]').exists()).toBe(false)
    })

    it('keeps the orb only when it was chosen explicitly', async () => {
        const { ctrl } = header({ customization: ref<Record<string, any>>({ chat_style: 'AURORA' }) })
        expect(wrapper!.find('.cm-mark__orb').exists()).toBe(false)
        ctrl.customization.value = { customization_metadata: { avatar_style: 'orb' } }
        ctrl.photoUrl.value = 'https://cdn.test/ada.png'
        await wrapper!.vm.$nextTick()
        expect(wrapper!.find('.cm-mark__orb').exists()).toBe(true)
    })
})

describe('the agent mark', () => {
    it('is decorative, with a faint human dot until someone joins', async () => {
        const mark = mount(AgentMark)
        expect(mark.attributes('aria-hidden')).toBe('true')
        expect(mark.find('[data-dot="human"]').classes()).not.toContain('is-joined')
        await mark.setProps({ humanJoined: true, working: true })
        expect(mark.find('[data-dot="human"]').classes()).toContain('is-joined')
        expect(mark.find('[data-dot="ai"]').classes()).toContain('cm-pulse')
        mark.unmount()
    })

    it('falls back to the dots when a photo face has no photo', () => {
        const mark = mount(AgentMark, { props: { face: 'photo', photoUrl: '' } })
        expect(mark.findAll('[data-dot]')).toHaveLength(2)
        mark.unmount()
    })
})
