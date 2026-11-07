import { describe, it, expect } from 'vitest'
import { computed, nextTick, ref } from 'vue'
import { usePromptPlace } from '@/composables/usePromptPlace'

type Msg = { message: string }

/** The chat as the widget draws it: messages, with the prompt in its place. */
const rendered = (messages: Msg[], place: ReturnType<typeof usePromptPlace<Msg>>, text = 'PROMPT') => {
  const lines: string[] = []
  for (const m of messages) {
    if (place.isBefore(m)) lines.push(text)
    lines.push(m.message)
  }
  if (place.isLast()) lines.push(text)
  return lines
}

const setup = (initial: string[] = []) => {
  const messages = ref<Msg[]>(initial.map((message) => ({ message })))
  const hostPrompt = ref<{ message: string } | null>(null)
  const loading = ref(false)
  const shown = computed(() => (loading.value ? null : hostPrompt.value))
  const place = usePromptPlace(messages, shown)
  return { messages, hostPrompt, loading, place, chat: () => rendered(messages.value, place) }
}

describe('usePromptPlace', () => {
  it('shows nothing without a prompt', () => {
    const { chat } = setup(['a'])
    expect(chat()).toEqual(['a'])
  })

  it('sits after the messages when it appears', async () => {
    const { hostPrompt, chat } = setup(['a', 'b'])
    hostPrompt.value = { message: 'step' }
    await nextTick()
    expect(chat()).toEqual(['a', 'b', 'PROMPT'])
  })

  it('stays above a message that arrives after it', async () => {
    const { messages, hostPrompt, chat } = setup(['a'])
    hostPrompt.value = { message: 'step' }
    await nextTick()
    messages.value.push({ message: 'newer' })
    await nextTick()
    messages.value.push({ message: 'newest' })
    await nextTick()
    expect(chat()).toEqual(['a', 'PROMPT', 'newer', 'newest'])
  })

  it('stays above a nudge on an otherwise empty chat', async () => {
    const { messages, hostPrompt, chat } = setup()
    hostPrompt.value = { message: 'step' }
    await nextTick()
    messages.value.push({ message: 'nudge' })
    await nextTick()
    expect(chat()).toEqual(['PROMPT', 'nudge'])
  })

  it('waits for a running reply when the step moves on during it', async () => {
    const { messages, hostPrompt, loading, chat } = setup(['question'])
    loading.value = true
    hostPrompt.value = { message: 'next step' }
    await nextTick()
    expect(chat()).toEqual(['question'])

    // The socket stops the dots first, then adds the reply, in one tick.
    loading.value = false
    messages.value.push({ message: 'reply' })
    await nextTick()
    expect(chat()).toEqual(['question', 'reply', 'PROMPT'])
  })

  it('stays last when loaded history arrives after it', async () => {
    const { messages, hostPrompt, chat } = setup()
    hostPrompt.value = { message: 'step' }
    await nextTick()
    messages.value = [{ message: 'old 1' }, { message: 'old 2' }]
    await nextTick()
    expect(chat()).toEqual(['old 1', 'old 2', 'PROMPT'])
  })

  it('keeps its place when history is added in front', async () => {
    const { messages, hostPrompt, chat } = setup(['a'])
    hostPrompt.value = { message: 'step' }
    await nextTick()
    messages.value.push({ message: 'b' })
    await nextTick()
    messages.value = [{ message: 'old' }, ...messages.value]
    await nextTick()
    expect(chat()).toEqual(['old', 'a', 'PROMPT', 'b'])
  })

  it('goes back to the end when the chat is cleared', async () => {
    const { messages, hostPrompt, chat } = setup(['a'])
    hostPrompt.value = { message: 'step' }
    await nextTick()
    messages.value.push({ message: 'b' })
    await nextTick()
    messages.value = []
    await nextTick()
    expect(chat()).toEqual(['PROMPT'])
  })

  it('takes a new place when the step changes', async () => {
    const { messages, hostPrompt, chat } = setup(['a'])
    hostPrompt.value = { message: 'one' }
    await nextTick()
    messages.value.push({ message: 'b' })
    await nextTick()
    hostPrompt.value = { message: 'two' }
    await nextTick()
    expect(chat()).toEqual(['a', 'b', 'PROMPT'])
  })

  it('does not follow a message added while no prompt is showing', async () => {
    const { messages, hostPrompt, chat } = setup(['a'])
    messages.value.push({ message: 'b' })
    await nextTick()
    hostPrompt.value = { message: 'step' }
    await nextTick()
    expect(chat()).toEqual(['a', 'b', 'PROMPT'])
  })

  it('joins the chat where it was shown, not at the end', async () => {
    const { messages, hostPrompt, place } = setup(['a'])
    hostPrompt.value = { message: 'step' }
    await nextTick()
    messages.value.push({ message: 'nudge' })
    await nextTick()
    expect(place.index()).toBe(1)
  })

  it('joins the chat at the end when nothing came after it', async () => {
    const { hostPrompt, place } = setup(['a', 'b'])
    hostPrompt.value = { message: 'step' }
    await nextTick()
    expect(place.index()).toBe(2)
  })
})
