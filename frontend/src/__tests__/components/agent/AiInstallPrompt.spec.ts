// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
import { toast } from 'vue-sonner'

import AiInstallPromptButton from '@/components/agent/AiInstallPromptButton.vue'
import AiInstallPromptPreview from '@/components/agent/AiInstallPromptPreview.vue'

const PROMPT = 'Add the ChatterMate chat widget to every page of my website.'
const stubs = { 'font-awesome-icon': true }

describe('AiInstallPromptButton', () => {
  const writeText = vi.fn()
  beforeEach(() => {
    vi.useFakeTimers()
    writeText.mockReset().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    vi.mocked(toast.error).mockReset()
  })
  afterEach(() => vi.useRealTimers())

  const mountButton = (prompt = PROMPT) => mount(AiInstallPromptButton, { props: { prompt }, global: { stubs } })

  it('copies the prompt and says so, then goes back', async () => {
    const wrapper = mountButton()
    expect(wrapper.text()).toBe('Copy prompt for my AI builder')
    await wrapper.trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(PROMPT)
    expect(wrapper.text()).toBe('Prompt copied')
    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.text()).toBe('Copy prompt for my AI builder')
  })

  it('a copy the browser refuses is reported and the label stays', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountButton()
    await wrapper.trigger('click')
    await flushPromises()
    expect(toast.error).toHaveBeenCalled()
    expect(wrapper.text()).toBe('Copy prompt for my AI builder')
  })

  it('a browser without a clipboard is reported too', async () => {
    Object.assign(navigator, { clipboard: undefined })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountButton()
    await wrapper.trigger('click')
    await flushPromises()
    expect(toast.error).toHaveBeenCalled()
  })

  it('comes in a compact size for beside small controls', () => {
    expect(mountButton().classes()).not.toContain('compact')
    const compact = mount(AiInstallPromptButton, { props: { prompt: PROMPT, size: 'compact' }, global: { stubs } })
    expect(compact.classes()).toContain('compact')
  })

  it('with no prompt there is nothing to copy', () => {
    const wrapper = mountButton('')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('leaving mid-"Prompt copied" leaves no timer behind', async () => {
    const wrapper = mountButton()
    await wrapper.trigger('click')
    await flushPromises()
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('AiInstallPromptPreview', () => {
  it('shows exactly what is copied, closed until asked for', () => {
    const wrapper = mount(AiInstallPromptPreview, { props: { prompt: PROMPT }, global: { stubs } })
    const details = wrapper.find('details')
    expect(details.attributes('open')).toBeUndefined()
    expect(wrapper.find('summary').text()).toBe('What gets copied')
    expect(wrapper.find('pre').text()).toBe(PROMPT)
  })

  it('shows nothing when there is no prompt', () => {
    const wrapper = mount(AiInstallPromptPreview, { props: { prompt: '' }, global: { stubs } })
    expect(wrapper.find('details').exists()).toBe(false)
  })
})
