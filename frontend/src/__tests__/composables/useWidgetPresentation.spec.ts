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
import { computed, ref } from 'vue'
import { useWidgetPresentation } from '@/composables/useWidgetPresentation'
import type { AgentCustomization } from '@/types/agent'
import type { HumanAgent } from '@/types/widget'

const setup = (customization: Partial<AgentCustomization> = {}, { aurora = false } = {}) => {
    const state = {
        customization: ref(customization),
        humanAgent: ref<HumanAgent>({}),
        messages: ref<unknown[]>([]),
        showEmailGate: ref(false),
        newConversationOffered: ref(false),
        allowAttachments: ref(true),
        uploadedAttachments: ref<unknown[]>([]),
    }
    const presentation = useWidgetPresentation({
        customization: state.customization,
        agentName: ref('Ava'),
        humanAgent: state.humanAgent,
        isAuroraStyle: computed(() => aurora),
        isAskAnythingStyle: computed(() => aurora),
        messages: state.messages,
        loadingHistory: ref(false),
        showEmailGate: state.showEmailGate,
        shouldShowNewConversationOption: state.newConversationOffered,
        allowAttachments: state.allowAttachments,
        uploadedAttachments: state.uploadedAttachments,
    })
    return { ...presentation, ...state }
}

const withAvatar = (avatar_style?: string, photo_url?: string): Partial<AgentCustomization> =>
    ({ photo_url, customization_metadata: avatar_style ? { avatar_style } : {} } as Partial<AgentCustomization>)

describe('useWidgetPresentation', () => {
    describe('the avatar', () => {
        it('is the orb when the agent picked it, even with a photo', () => {
            expect(setup(withAvatar('orb', 'me.png')).useOrbAvatar.value).toBe(true)
        })

        it('is the photo when the agent picked it, even on Aurora', () => {
            expect(setup(withAvatar('photo'), { aurora: true }).useOrbAvatar.value).toBe(false)
        })

        it('falls back to the orb on Aurora without a photo', () => {
            expect(setup(withAvatar(), { aurora: true }).useOrbAvatar.value).toBe(true)
        })

        it('keeps the photo on Aurora when there is one', () => {
            expect(setup(withAvatar(undefined, 'me.png'), { aurora: true }).useOrbAvatar.value).toBe(false)
        })

        it('is never the orb on the classic styles unless picked', () => {
            expect(setup(withAvatar()).useOrbAvatar.value).toBe(false)
        })
    })

    describe('attachments', () => {
        it('are offered only once a person has taken over', () => {
            const view = setup()
            expect(view.canUploadMore.value).toBe(false)
            view.humanAgent.value = { human_agent_name: 'Sam' }
            expect(view.canUploadMore.value).toBe(true)
        })

        it('stop at the limit of files per message', () => {
            const view = setup()
            view.humanAgent.value = { human_agent_name: 'Sam' }
            view.uploadedAttachments.value = [{}, {}]
            expect(view.canUploadMore.value).toBe(true)
            view.uploadedAttachments.value = Array.from({ length: view.maxFiles }, () => ({}))
            expect(view.canUploadMore.value).toBe(false)
        })

        it('are never offered when the agent does not allow them', () => {
            const view = setup()
            view.humanAgent.value = { human_agent_name: 'Sam' }
            view.allowAttachments.value = false
            expect(view.canUploadMore.value).toBe(false)
        })
    })

    describe('quick actions', () => {
        const actions = { quick_actions: ['Track my order', '  ', 'Returns'] } as Partial<AgentCustomization>

        it('show the non-blank actions before the first message', () => {
            const view = setup(actions)
            expect(view.quickActions.value).toEqual(['Track my order', 'Returns'])
            expect(view.showQuickActions.value).toBe(true)
        })

        it('are hidden behind the email gate', () => {
            const view = setup(actions)
            view.showEmailGate.value = true
            expect(view.showQuickActions.value).toBe(false)
        })

        it('are hidden while the new-conversation option is offered', () => {
            const view = setup(actions)
            view.newConversationOffered.value = true
            expect(view.showQuickActions.value).toBe(false)
        })

        it('go once the conversation has started', () => {
            const view = setup(actions)
            view.messages.value = [{ message: 'hi' }]
            expect(view.showQuickActions.value).toBe(false)
        })
    })
})
