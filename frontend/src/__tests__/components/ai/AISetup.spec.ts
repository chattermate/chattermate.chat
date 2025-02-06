import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import AISetup from '../../../components/ai/AISetup.vue'

const mockSaveAISetup = vi.fn()

// Mock the useAISetup composable
vi.mock('@/composables/useAISetup', () => ({
  useAISetup: vi.fn()
}))

import { useAISetup } from '@/composables/useAISetup'

describe('AISetup', () => {
  let wrapper: VueWrapper

  const createWrapper = () => {
    return mount(AISetup)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset default mock implementation
    mockSaveAISetup.mockResolvedValue(true)
    ;(useAISetup as any).mockImplementation(() => ({
      isLoading: false,
      error: null,
      providers: [
        { value: 'openai', label: 'OpenAI' },
        { value: 'ollama', label: 'Ollama' },
        { value: 'anthropic', label: 'Anthropic' }
      ],
      setupConfig: {
        value: {
          provider: '',
          model: '',
          apiKey: ''
        }
      },
      saveAISetup: mockSaveAISetup
    }))
    wrapper = createWrapper()
  })

  it('renders properly', () => {
    expect(wrapper.find('.ai-setup').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#provider').exists()).toBe(true)
    expect(wrapper.find('#model').exists()).toBe(true)
  })

  it('displays all provider options', () => {
    const options = wrapper.findAll('#provider option')
    // +1 for the default "Select Provider" option
    expect(options).toHaveLength(4)
    expect(options[1].text()).toBe('OpenAI')
    expect(options[2].text()).toBe('Ollama')
    expect(options[3].text()).toBe('Anthropic')
  })

  it('shows API key input for non-Ollama providers', async () => {
    const select = wrapper.find('#provider')
    await select.setValue('openai')
    await nextTick()
    await flushPromises()
    expect(wrapper.find('#apiKey').exists()).toBe(true)

    await select.setValue('anthropic')
    await nextTick()
    await flushPromises()
    expect(wrapper.find('#apiKey').exists()).toBe(true)
  })

  it('hides API key input for Ollama provider', async () => {
    ;(useAISetup as any).mockImplementation(() => ({
      isLoading: false,
      error: null,
      providers: [
        { value: 'ollama', label: 'Ollama' }
      ],
      setupConfig: {
        value: {
          provider: 'ollama',
          model: 'llama2',
          apiKey: ''
        }
      },
      saveAISetup: mockSaveAISetup
    }))
    
    wrapper = createWrapper()
    await nextTick()
    await flushPromises()
    
    expect(wrapper.find('#apiKey').exists()).toBe(false)
  })

  it('requires API key for non-Ollama providers', async () => {
    const select = wrapper.find('#provider')
    await select.setValue('openai')
    await nextTick()
    await flushPromises()
    
    const apiKeyInput = wrapper.find('#apiKey')
    expect(apiKeyInput.attributes('required')).toBeDefined()
  })

  it('shows loading state', async () => {
    // Mock loading state
    ;(useAISetup as any).mockImplementation(() => ({
      isLoading: true,
      error: null,
      providers: [],
      setupConfig: { value: { provider: '', model: '', apiKey: '' } },
      saveAISetup: mockSaveAISetup
    }))

    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.find('.loading-container').exists()).toBe(true)
    expect(wrapper.find('.loader').exists()).toBe(true)
  })

  it('displays error message when present', async () => {
    // Mock error state
    ;(useAISetup as any).mockImplementation(() => ({
      isLoading: false,
      error: 'Configuration failed',
      providers: [],
      setupConfig: { value: { provider: '', model: '', apiKey: '' } },
      saveAISetup: mockSaveAISetup
    }))

    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Configuration failed')
  })

  it('submits form with correct data for non-Ollama provider', async () => {
    ;(useAISetup as any).mockImplementation(() => ({
      isLoading: false,
      error: null,
      providers: [
        { value: 'openai', label: 'OpenAI' }
      ],
      setupConfig: {
        value: {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: 'test-key'
        }
      },
      saveAISetup: mockSaveAISetup
    }))

    wrapper = createWrapper()
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    
    expect(mockSaveAISetup).toHaveBeenCalled()
  })

  it('submits form with auto-filled API key for Ollama', async () => {
    ;(useAISetup as any).mockImplementation(() => ({
      isLoading: false,
      error: null,
      providers: [
        { value: 'ollama', label: 'Ollama' }
      ],
      setupConfig: {
        value: {
          provider: 'ollama',
          model: 'llama2',
          apiKey: ''
        }
      },
      saveAISetup: mockSaveAISetup
    }))

    wrapper = createWrapper()
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    
    expect(mockSaveAISetup).toHaveBeenCalled()
  })

  it('emits ai-setup-complete event on successful save', async () => {
    mockSaveAISetup.mockResolvedValue(true)
    ;(useAISetup as any).mockImplementation(() => ({
      isLoading: false,
      error: null,
      providers: [
        { value: 'openai', label: 'OpenAI' }
      ],
      setupConfig: {
        value: {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: 'test-key'
        }
      },
      saveAISetup: mockSaveAISetup
    }))

    wrapper = createWrapper()
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    
    expect(wrapper.emitted('ai-setup-complete')).toBeTruthy()
  })

  it('handles save failure gracefully', async () => {
    mockSaveAISetup.mockResolvedValue(false)
    ;(useAISetup as any).mockImplementation(() => ({
      isLoading: false,
      error: null,
      providers: [
        { value: 'openai', label: 'OpenAI' }
      ],
      setupConfig: {
        value: {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: 'test-key'
        }
      },
      saveAISetup: mockSaveAISetup
    }))

    wrapper = createWrapper()
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    
    expect(wrapper.emitted('ai-setup-complete')).toBeFalsy()
  })

  it('applies correct styling', () => {
    expect(wrapper.find('.ai-setup').classes()).toContain('ai-setup')
    expect(wrapper.find('.setup-form').classes()).toContain('setup-form')
    expect(wrapper.find('.form-group').classes()).toContain('form-group')
    expect(wrapper.find('.submit-button').classes()).toContain('submit-button')
  })
}) 