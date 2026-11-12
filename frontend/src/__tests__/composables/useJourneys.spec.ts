import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import type { HostPrompt } from '@/webclient/actions/hostActionsClient'

vi.mock('@/webclient/host-bridge', () => ({ postToHost: vi.fn() }))
vi.mock('@/webclient/frame-session', () => ({ reportedPageUrl: () => 'https://app.test/home' }))

import { useJourneys } from '@/composables/useJourneys'

function setup(initialPrompt: HostPrompt | null = null) {
  const listeners: Record<string, (payload?: unknown) => void> = {}
  const emitted: Array<[string, unknown]> = []
  let prompt = initialPrompt
  const runLocalAction = vi.fn().mockReturnValue(true)
  let api!: ReturnType<typeof useJourneys>
  mount(defineComponent({
    setup() {
      api = useJourneys({
        on: (event, listener) => { listeners[event] = listener },
        emit: (event, data) => { emitted.push([event, data]) },
        currentPrompt: () => prompt,
        showPrompt: (next) => { prompt = next },
        addNotice: vi.fn(),
        runLocalAction,
      })
      return () => h('div')
    },
  }))
  return { listeners, emitted, api, runLocalAction, prompt: () => prompt }
}

const hostMessage = (data: Record<string, unknown>) =>
  window.dispatchEvent(new MessageEvent('message', { data, source: window.parent }))

describe('useJourneys', () => {
  it('holds signals sent before the socket is up, and sends them once it is', () => {
    const { listeners, emitted } = setup()
    hostMessage({ type: 'HOST_JOURNEY_START', key: 'first_invoice' })
    hostMessage({ type: 'HOST_EVENT', event: 'invoice_sent' })
    expect(emitted).toEqual([])

    listeners.session_initialized()
    expect(emitted).toEqual([
      ['journey_sync', { url: 'https://app.test/home' }],
      ['journey_start', { key: 'first_invoice' }],
      ['journey_sync', { event: 'invoice_sent' }],
    ])
  })

  it("never wipes or replaces a message the page showed with ChatterMate.prompt()", () => {
    const pagePrompt: HostPrompt = { message: 'Need help with billing?', chips: [], open: false, source: 'host' }
    const { listeners, prompt } = setup(pagePrompt)
    listeners.journey_state({ view: null })
    expect(prompt()).toBe(pagePrompt)
    listeners.journey_state({ view: { journey_key: 'j', step_count: 2, finished: false, step_id: 's1', message: 'Step one' } })
    expect(prompt()).toBe(pagePrompt)
  })

  it('runs an action chip once, however often it is clicked', () => {
    const { api, runLocalAction } = setup()
    const chip = { label: 'Use GBP', kind: 'action' as const, value: 'set_currency',
                   action: { label: 'Set currency', confirm: 'never' as const, timeout_s: 5 } }
    api.runChip(chip, vi.fn())
    api.runChip(chip, vi.fn())
    expect(runLocalAction).toHaveBeenCalledTimes(1)
    expect(api.chipBusy.value).toBe(true)

    runLocalAction.mock.calls[0][1]('ok')
    expect(api.chipBusy.value).toBe(false)
  })
})
