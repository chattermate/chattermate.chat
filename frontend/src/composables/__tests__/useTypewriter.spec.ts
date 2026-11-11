import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useTypewriter } from '../useTypewriter'

type Msg = { message: string; stream?: boolean }

function setup(initial: Msg[] = []) {
  const messages = ref<Msg[]>(initial) as Ref<any[]>
  let api!: ReturnType<typeof useTypewriter>
  const wrapper = mount(defineComponent({
    setup() {
      api = useTypewriter(messages)
      return () => h('div')
    },
  }))
  const text = (i: number) => api.displayText(i, messages.value[i].message)
  return { messages, api, wrapper, text }
}

const finishTyping = async () => {
  await nextTick()
  await vi.runAllTimersAsync()
}

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('types a live reply and shows history in full', async () => {
    const { messages, api, text } = setup([{ message: 'Earlier answer' }])
    messages.value.push({ message: 'Hello there', stream: true })
    await nextTick()
    expect(text(0)).toBe('Earlier answer')
    expect(api.isStreaming(1)).toBe(true)
    expect(text(1)).toBe('')
    await finishTyping()
    expect(text(1)).toBe('Hello there')
    expect(api.isStreaming(1)).toBe(false)
  })

  it('does not type a reply again when history is loaded above it', async () => {
    const { messages, api, text } = setup()
    messages.value.push({ message: 'First reply', stream: true }, { message: 'Second reply', stream: true })
    await finishTyping()
    messages.value = [{ message: 'Old one' }, { message: 'Old two' }, ...messages.value]
    await nextTick()
    expect([0, 1, 2, 3].map(i => api.isStreaming(i))).toEqual([false, false, false, false])
    expect([0, 1, 2, 3].map(text)).toEqual(['Old one', 'Old two', 'First reply', 'Second reply'])
  })

  it('does not type a reply again when a step message is placed before it', async () => {
    const { messages, api, text } = setup()
    messages.value.push({ message: 'Done', stream: true })
    await finishTyping()
    messages.value.splice(0, 0, { message: 'Next it needs to learn' })
    await nextTick()
    expect(api.isStreaming(1)).toBe(false)
    expect(text(0)).toBe('Next it needs to learn')
    expect(text(1)).toBe('Done')
  })

  it('keeps typing a reply that moves while it is still being typed', async () => {
    const { messages, api, text } = setup()
    messages.value.push({ message: 'Half way', stream: true })
    await nextTick()
    await vi.advanceTimersByTimeAsync(40)
    const partial = text(0)
    expect(partial.length).toBeGreaterThan(0)
    expect(partial.length).toBeLessThan('Half way'.length)
    messages.value.unshift({ message: 'History' })
    await nextTick()
    expect(text(1).startsWith(partial)).toBe(true)
    await finishTyping()
    expect(text(1)).toBe('Half way')
    expect(text(0)).toBe('History')
  })

  it('starts over cleanly for a new conversation', async () => {
    const { messages, api, text } = setup()
    messages.value.push({ message: 'Old chat', stream: true })
    await nextTick()
    messages.value = []
    await nextTick()
    messages.value.push({ message: 'New chat', stream: true })
    await finishTyping()
    expect(text(0)).toBe('New chat')
    expect(api.isStreaming(0)).toBe(false)
  })

  it('says when a reply is still revealing, and shows everything at once on stop', async () => {
    const { messages, api, text } = setup()
    expect(api.isRevealing.value).toBe(false)
    messages.value.push({ message: 'A long reply', stream: true }, { message: 'And another', stream: true })
    await nextTick()
    await vi.advanceTimersByTimeAsync(30)
    expect(api.isRevealing.value).toBe(true)

    api.skipReveal()
    await nextTick()

    expect(api.isRevealing.value).toBe(false)
    expect(text(0)).toBe('A long reply')
    expect(text(1)).toBe('And another')
    // Nothing keeps typing after the stop.
    await finishTyping()
    expect(text(1)).toBe('And another')
  })

  it('reveals a reply that arrives after a stop as usual', async () => {
    const { messages, api, text } = setup()
    messages.value.push({ message: 'First', stream: true })
    await nextTick()
    api.skipReveal()
    messages.value.push({ message: 'Second', stream: true })
    await nextTick()
    expect(api.isStreaming(1)).toBe(true)
    await finishTyping()
    expect(text(1)).toBe('Second')
  })
})
