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

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

const push = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
const toast = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn(), info: vi.fn(), success: vi.fn() }))
vi.mock('vue-sonner', () => ({ toast }))
const lockedGates = vi.hoisted(() => new Set<string>())
vi.mock('@/composables/useFeatureLock', () => ({ useFeatureLock: () => ({ isLocked: (gate: string) => lockedGates.has(gate) }) }))
const assist = vi.hoisted(() => ({ improve: vi.fn(), summary: vi.fn(), knowledge: vi.fn() }))
vi.mock('@/services/inboxAssist', () => ({ inboxAssist: assist }))

import ComposerImprove from '@/components/inbox/ComposerImprove.vue'
import { faqEditorLink, useInboxAssist } from '@/composables/useInboxAssist'

const PLAIN = { question: 'Do you ship to Norway? Order 10587', answer: 'Yes, we ship to Norway in 5 to 7 working days.' }

function host() {
  let result!: ReturnType<typeof useInboxAssist>
  const wrapper = mount(defineComponent({ setup() { result = useInboxAssist(() => 's1'); return () => h('div') } }))
  return { result, wrapper }
}

beforeEach(() => {
  push.mockReset()
  lockedGates.clear()
  Object.values(assist).forEach((fn) => fn.mockReset())
  toast.mockReset(); toast.error.mockReset(); toast.info.mockReset()
})

describe('useInboxAssist › add the answer to knowledge', () => {
  it('opens the editor with the AI draft when the answer is worth keeping', async () => {
    assist.knowledge.mockResolvedValue({ ready: true, reason: '', question: 'Do you ship to Norway?', answer: 'Yes, in 5 to 7 working days.' })
    const { result } = host()
    await result.addToKnowledge(PLAIN)
    expect(push).toHaveBeenCalledWith(faqEditorLink({ question: 'Do you ship to Norway?', answer: 'Yes, in 5 to 7 working days.' }))
  })

  it("doesn't open it when the AI finds no complete answer, and says why", async () => {
    assist.knowledge.mockResolvedValue({ ready: false, reason: 'The teammate only promised to check.', question: '', answer: '' })
    const { result } = host()
    await result.addToKnowledge(PLAIN)
    expect(push).not.toHaveBeenCalled()
    expect(toast.info).toHaveBeenCalledWith('Not ready for the help center yet. The teammate only promised to check.')
  })

  it("opens the conversation's own words when the AI can't answer", async () => {
    assist.knowledge.mockRejectedValue({ response: { status: 502 } })
    const { result } = host()
    await result.addToKnowledge(PLAIN)
    expect(push).toHaveBeenCalledWith(faqEditorLink(PLAIN))
  })

  it('without AI on the plan, opens the plain draft without asking it', async () => {
    lockedGates.add('inbox-ai')
    const { result } = host()
    await result.addToKnowledge(PLAIN)
    expect(assist.knowledge).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith(faqEditorLink(PLAIN))
  })
})

describe('useInboxAssist › summary and upgrade', () => {
  it('keeps the refreshed summary, and forgets it on failure', async () => {
    assist.summary.mockResolvedValueOnce('- Refund approved')
    const { result } = host()
    await result.refreshSummary()
    expect(result.summary.value).toBe('- Refund approved')

    assist.summary.mockRejectedValueOnce({ response: { data: { detail: 'Set up an AI model in AI configuration first' } } })
    await result.refreshSummary()
    expect(toast.error).toHaveBeenCalledWith('Set up an AI model in AI configuration first')
  })

  it('offers the plans for a locked tool', () => {
    const { result } = host()
    result.showUpgrade('inbox-snooze')
    const [line, options] = toast.mock.calls[0]
    expect(line).toContain('Starter')
    options.action.onClick()
    expect(push).toHaveBeenCalledWith('/settings/subscription')
  })
})

describe('ComposerImprove', () => {
  const mountImprove = (improve: (text: string, style: string) => Promise<string>, locked = false) =>
    mount(ComposerImprove, { props: { text: 'hi maya refund on way', improve, locked }, attachTo: document.body })

  it('rewrites the draft in the chosen style, and Undo puts it back', async () => {
    const improve = vi.fn().mockResolvedValue('Hi Maya, your refund is on its way.')
    const wrapper = mountImprove(improve)
    await wrapper.find('button[aria-label="Improve with AI"]').trigger('click')
    const fix = Array.from(document.querySelectorAll('[role="menuitem"]')).find((el) => el.textContent?.includes('Fix spelling'))
    ;(fix as HTMLElement).click()
    await flushPromises()
    expect(improve).toHaveBeenCalledWith('hi maya refund on way', 'fix')
    expect(wrapper.emitted('rewrite')?.[0]).toEqual(['Hi Maya, your refund is on its way.'])

    await wrapper.setProps({ text: 'Hi Maya, your refund is on its way.' })
    await wrapper.find('.undo').trigger('click')
    expect(wrapper.emitted('rewrite')?.[1]).toEqual(['hi maya refund on way'])
    wrapper.unmount()
  })

  it('offers no Undo once the rewrite was edited', async () => {
    const wrapper = mountImprove(vi.fn().mockResolvedValue('Better.'))
    await wrapper.find('button[aria-label="Improve with AI"]').trigger('click')
    ;(document.querySelector('[role="menuitem"]') as HTMLElement).click()
    await flushPromises()
    await wrapper.setProps({ text: 'Better, edited.' })
    expect(wrapper.find('.undo').exists()).toBe(false)
    wrapper.unmount()
  })

  it('drops a rewrite of a draft that was edited while the AI worked', async () => {
    let finish!: (text: string) => void
    const wrapper = mountImprove(() => new Promise((resolve) => { finish = resolve }))
    await wrapper.find('button[aria-label="Improve with AI"]').trigger('click')
    ;(document.querySelector('[role="menuitem"]') as HTMLElement).click()
    await wrapper.setProps({ text: 'hi maya refund on way, sorry for the wait' })
    finish('Hi Maya, your refund is on its way.')
    await flushPromises()
    expect(wrapper.emitted('rewrite')).toBeUndefined()
    wrapper.unmount()
  })

  it('keeps the draft when the AI fails', async () => {
    const wrapper = mountImprove(vi.fn().mockRejectedValue(new Error('502')))
    await wrapper.find('button[aria-label="Improve with AI"]').trigger('click')
    ;(document.querySelector('[role="menuitem"]') as HTMLElement).click()
    await flushPromises()
    expect(wrapper.emitted('rewrite')).toBeUndefined()
    wrapper.unmount()
  })

  it('on a plan without it, explains instead of rewriting', async () => {
    const improve = vi.fn()
    const wrapper = mountImprove(improve, true)
    await wrapper.find('button[aria-label="Improve with AI"]').trigger('click')
    expect(wrapper.emitted('locked')).toHaveLength(1)
    expect(improve).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
