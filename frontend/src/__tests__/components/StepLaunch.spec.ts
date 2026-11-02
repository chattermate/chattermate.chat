// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

// The live/blocked status is an enterprise component (tested there): stub
// the slot so this spec covers the open-source step only.
vi.mock('@/composables/useEnterpriseFeatures', async () => {
  const { defineComponent, h } = await import('vue')
  const Slot = defineComponent({
    props: { widgetId: { type: String, default: null } },
    setup: (props) => () => h('p', { class: 'install-slot' }, props.widgetId),
  })
  return {
    useEnterpriseFeatures: () => ({
      moduleImports: { widgetInstallStatus: 'install-status' },
      enterpriseComponent: () => Slot,
    }),
  }
})
vi.mock('vue-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
import { toast } from 'vue-sonner'

import StepLaunch from '@/components/aiagent/onboarding/steps/StepLaunch.vue'
import { WIDGET_INSTALL_GUIDE_URL } from '@/config/docs'

const mountStep = async (widgetId: string | null = 'w-1') => {
  const wrapper = mount(StepLaunch, {
    props: { widgetId, agentType: 'CUSTOMER_SUPPORT' },
    global: { stubs: { 'font-awesome-icon': true } },
  })
  await flushPromises()
  return wrapper
}

describe('StepLaunch', () => {
  it('offers a mailto with the real snippet and the install guide', async () => {
    const wrapper = await mountStep()

    const mailto = wrapper.find('a[href^="mailto:"]').attributes('href')!
    const body = new URLSearchParams(mailto.slice('mailto:?'.length)).get('body')!
    expect(body).toContain("window.chattermateId = 'w-1'")
    expect(body).toContain(WIDGET_INSTALL_GUIDE_URL)
    expect(mailto).not.toContain('+') // spaces encoded as %20 for mail clients
    expect(wrapper.find(`a[href="${WIDGET_INSTALL_GUIDE_URL}"]`).exists()).toBe(true)
  })

  it('hands the widget to the install status slot', async () => {
    const wrapper = await mountStep()
    expect(wrapper.find('.install-slot').text()).toBe('w-1')
  })

  it('offers a prompt for an AI website builder with the real snippet', async () => {
    const wrapper = await mountStep()
    expect(wrapper.find('.ai-prompt-btn').exists()).toBe(true)
    const prompt = wrapper.find('.prompt-text').text()
    expect(prompt).toContain("window.chattermateId = 'w-1'")
    expect(prompt).toContain(WIDGET_INSTALL_GUIDE_URL)
    // The preview stays closed until asked for
    expect(wrapper.find('details').attributes('open')).toBeUndefined()
  })

  it('offers no AI prompt without a widget', async () => {
    const wrapper = await mountStep(null)
    expect(wrapper.find('.ai-prompt-btn').attributes('disabled')).toBeDefined()
    expect(wrapper.find('details').exists()).toBe(false)
  })

  it('offers no mailto without a widget', async () => {
    const wrapper = await mountStep(null)
    expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
  })
})

describe('StepLaunch - copying and help', () => {
  const writeText = vi.fn()
  beforeEach(() => {
    vi.useFakeTimers()
    writeText.mockReset().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    vi.mocked(toast.error).mockReset()
  })
  afterEach(() => vi.useRealTimers())

  const copyButton = (w: any) => w.find('.copy-btn')

  it('copies the snippet and says so on the button, then goes back', async () => {
    const wrapper = await mountStep()
    await copyButton(wrapper).trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("window.chattermateId = 'w-1'"))
    expect(copyButton(wrapper).text()).toBe('Copied')
    await vi.advanceTimersByTimeAsync(2000)
    expect(copyButton(wrapper).text()).toBe('Copy')
  })

  it('a second copy keeps "Copied" showing for the full time again', async () => {
    const wrapper = await mountStep()
    await copyButton(wrapper).trigger('click')
    await vi.advanceTimersByTimeAsync(1500)
    await copyButton(wrapper).trigger('click')
    await vi.advanceTimersByTimeAsync(1500)
    expect(copyButton(wrapper).text()).toBe('Copied')
  })

  it('a copy the browser refuses is reported, and the button stays "Copy"', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountStep()
    await copyButton(wrapper).trigger('click')
    await flushPromises()
    expect(toast.error).toHaveBeenCalled()
    expect(copyButton(wrapper).text()).toBe('Copy')
  })

  it('without a widget there is nothing to copy or email', async () => {
    const wrapper = await mountStep(null)
    expect(copyButton(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
  })

  it('the install guide opens in a new tab and says so to screen readers', async () => {
    const wrapper = await mountStep()
    const guide = wrapper.find(`a[href="${WIDGET_INSTALL_GUIDE_URL}"]`)
    expect(guide.attributes('target')).toBe('_blank')
    expect(guide.attributes('rel')).toContain('noopener')
    expect(guide.text()).toContain('(opens in a new tab)')
  })

  it('leaving the step mid-"Copied" leaves no timer behind', async () => {
    const wrapper = await mountStep()
    await copyButton(wrapper).trigger('click')
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
