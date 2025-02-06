import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper, flushPromises } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import WidgetBuilder from '../../webclient/WidgetBuilder.vue'
import { marked } from 'marked'
import { useWidgetSocket } from '../../composables/useWidgetSocket'

// Define ConnectionStatus type if not available
type ConnectionStatus = 'connected' | 'connecting' | 'failed'

// Define types for marked mock
interface MarkedRenderer {
  link(href: string, title: string | null, text: string): string
}

interface MarkedFunction {
  (text: string): string
  setOptions(options: { [key: string]: any }): void
  use(options: { [key: string]: any }): void
  Renderer: { new(): MarkedRenderer }
}

// Mock the composables
vi.mock('../../composables/useWidgetStyles', () => ({
  useWidgetStyles: () => ({
    chatStyles: {},
    chatIconStyles: {},
    agentBubbleStyles: {},
    userBubbleStyles: {},
    messageNameStyles: {},
    headerBorderStyles: {},
    photoUrl: 'test-photo.jpg',
    shadowStyle: {}
  })
}))

vi.mock('../../composables/useWidgetSocket', () => ({
  useWidgetSocket: vi.fn(() => ({
    messages: ref([]),
    loading: ref(false),
    errorMessage: ref(''),
    showError: ref(false),
    loadingHistory: ref(false),
    hasStartedChat: ref(false),
    connectionStatus: ref('connected'),
    sendMessage: vi.fn(),
    loadChatHistory: vi.fn(),
    connect: vi.fn(),
    reconnect: vi.fn(),
    cleanup: vi.fn(),
    customer: ref({}),
    onTakeover: vi.fn()
  }))
}))

vi.mock('../../composables/useWidgetCustomization', () => ({
  useWidgetCustomization: () => ({
    customization: {},
    agentName: 'Test Agent',
    applyCustomization: vi.fn(),
    initializeFromData: vi.fn()
  })
}))

// Mock the marked library
vi.mock('marked', () => {
  const renderer = {
    link: vi.fn().mockReturnValue('')
  }
  
  const markedFn = vi.fn().mockReturnValue('') as unknown as MarkedFunction
  markedFn.setOptions = vi.fn()
  markedFn.use = vi.fn()
  markedFn.Renderer = class implements MarkedRenderer {
    link(href: string, title: string | null, text: string): string {
      return renderer.link(href, title, text)
    }
  }
  
  return {
    marked: markedFn
  }
})

describe('WidgetBuilder', () => {
  let wrapper: VueWrapper

  const createWrapper = () => {
    return mount(WidgetBuilder, {
      props: {
        widgetId: 'test-widget-id'
      },
      global: {
        mocks: {
          __INITIAL_DATA__: {
            widgetId: 'test-widget-id',
            agentName: 'Test Agent',
            customization: {},
            customerId: null,
            customer: {}
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.__INITIAL_DATA__
    window.__INITIAL_DATA__ = {
      widgetId: 'test-widget-id',
      agentName: 'Test Agent',
      customization: {},
      customerId: null,
      customer: {}
    }

    // Mock the marked function for each test
    const markedMock = vi.fn((text) => text)
    vi.mocked(marked).mockImplementation(markedMock)

    // Reset default mock implementation
    vi.mocked(useWidgetSocket).mockImplementation(() => ({
      messages: ref([]),
      loading: ref(false),
      errorMessage: ref(''),
      showError: ref(false),
      loadingHistory: ref(false),
      hasStartedChat: ref(false),
      connectionStatus: ref<ConnectionStatus>('connected'),
      sendMessage: vi.fn(),
      loadChatHistory: vi.fn(),
      connect: vi.fn(),
      reconnect: vi.fn(),
      cleanup: vi.fn(),
      customer: ref({}),
      onTakeover: vi.fn()
    }))
  })

  it('renders properly', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.chat-container').exists()).toBe(true)
    expect(wrapper.find('.chat-panel').exists()).toBe(true)
    expect(wrapper.find('.chat-header').exists()).toBe(true)
  })

  it('displays agent information correctly', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.header-info h3').text()).toBe('Test Agent')
    expect(wrapper.find('.status-text').text()).toBe('Online')
  })

  it('shows email input when chat has not started', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.email-input').exists()).toBe(true)
    expect(wrapper.find('.email-input input').attributes('placeholder')).toBe('Enter your email address to begin')
  })

  it('validates email input', async () => {
    wrapper = createWrapper()
    const emailInput = wrapper.find('.email-input input')
    
    // Invalid email
    await emailInput.setValue('invalid-email')
    expect(emailInput.classes()).toContain('invalid')
    
    // Valid email
    await emailInput.setValue('test@example.com')
    expect(emailInput.classes()).not.toContain('invalid')
  })

  it('disables message input when email is invalid', async () => {
    wrapper = createWrapper()
    const messageInput = wrapper.find('.message-input input')
    const emailInput = wrapper.find('.email-input input')
    
    await emailInput.setValue('invalid-email')
    expect(messageInput.attributes('disabled')).toBeDefined()
    
    await emailInput.setValue('test@example.com')
    expect(messageInput.attributes('disabled')).toBeUndefined()
  })

  it('handles connection status changes', () => {
    vi.mocked(useWidgetSocket).mockImplementation(() => ({
      messages: ref([]),
      loading: ref(false),
      errorMessage: ref(''),
      showError: ref(false),
      loadingHistory: ref(false),
      hasStartedChat: ref(false),
      connectionStatus: ref<ConnectionStatus>('connecting'),
      sendMessage: vi.fn(),
      loadChatHistory: vi.fn(),
      connect: vi.fn(),
      reconnect: vi.fn(),
      cleanup: vi.fn(),
      customer: ref({}),
      onTakeover: vi.fn()
    }))
    
    wrapper = createWrapper()
    expect(wrapper.find('.connection-status').exists()).toBe(true)
    expect(wrapper.find('.connecting-message').exists()).toBe(true)
  })

  it('shows error message when present', () => {
    vi.mocked(useWidgetSocket).mockImplementation(() => ({
      messages: ref([]),
      loading: ref(false),
      errorMessage: ref('Test error'),
      showError: ref(true),
      loadingHistory: ref(false),
      hasStartedChat: ref(false),
      connectionStatus: ref<ConnectionStatus>('connected'),
      sendMessage: vi.fn(),
      loadChatHistory: vi.fn(),
      connect: vi.fn(),
      reconnect: vi.fn(),
      cleanup: vi.fn(),
      customer: ref({}),
      onTakeover: vi.fn()
    }))
    
    wrapper = createWrapper()
    expect(wrapper.find('.error-alert').exists()).toBe(true)
    expect(wrapper.find('.error-alert').text()).toBe('Test error')
  })

  it('sends message on form submission', async () => {
    const mockSendMessage = vi.fn()
    const mockConnect = vi.fn().mockResolvedValue(true)
    const mockLoadHistory = vi.fn().mockResolvedValue([])
    
    // Mock fetch for checkAuthorization
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({
        agent: {
          customization: {},
          display_name: 'Test Agent'
        },
        customer: {}
      })
    })

    vi.mocked(useWidgetSocket).mockImplementation(() => ({
      messages: ref([]),
      loading: ref(false),
      errorMessage: ref(''),
      showError: ref(false),
      loadingHistory: ref(false),
      hasStartedChat: ref(false),
      hasConversationToken: ref(false),
      connectionStatus: ref<ConnectionStatus>('connected'),
      sendMessage: mockSendMessage,
      loadChatHistory: mockLoadHistory,
      connect: mockConnect,
      reconnect: vi.fn(),
      cleanup: vi.fn(),
      customer: ref({}),
      onTakeover: vi.fn()
    }))
    
    wrapper = createWrapper()
    
    // Find the email input within the chat-input div
    const emailInput = wrapper.find('.chat-input .email-input input')
    await emailInput.setValue('test@example.com')
    await nextTick()
    
    // Find the message input within the chat-input div
    const messageInput = wrapper.find('.chat-input .message-input input')
    await messageInput.setValue('Test message')
    await nextTick()
    
    // Click the send button
    const sendButton = wrapper.find('.send-button')
    await sendButton.trigger('click')
    await flushPromises()
    
    expect(mockConnect).toHaveBeenCalled()
    expect(mockLoadHistory).toHaveBeenCalled()
    expect(mockSendMessage).toHaveBeenCalledWith('Test message', 'test@example.com')
  })

  it('shows loading indicator when messages are loading', () => {
    vi.mocked(useWidgetSocket).mockImplementation(() => ({
      messages: ref([]),
      loading: ref(true),
      errorMessage: ref(''),
      showError: ref(false),
      loadingHistory: ref(false),
      hasStartedChat: ref(false),
      connectionStatus: ref<ConnectionStatus>('connected'),
      sendMessage: vi.fn(),
      loadChatHistory: vi.fn(),
      connect: vi.fn(),
      reconnect: vi.fn(),
      cleanup: vi.fn(),
      customer: ref({}),
      onTakeover: vi.fn()
    }))
    
    wrapper = createWrapper()
    expect(wrapper.find('.typing-indicator').exists()).toBe(true)
  })

  it('displays messages correctly', () => {
    vi.mocked(useWidgetSocket).mockImplementation(() => ({
      messages: ref([
        { message_type: 'user', message: 'User message' },
        { message_type: 'bot', message: 'Bot message' },
        { message_type: 'system', message: 'System message' }
      ]),
      loading: ref(false),
      errorMessage: ref(''),
      showError: ref(false),
      loadingHistory: ref(false),
      hasStartedChat: ref(true),
      connectionStatus: ref<ConnectionStatus>('connected'),
      sendMessage: vi.fn(),
      loadChatHistory: vi.fn(),
      connect: vi.fn(),
      reconnect: vi.fn(),
      cleanup: vi.fn(),
      customer: ref({}),
      onTakeover: vi.fn()
    }))
    
    wrapper = createWrapper()
    const messages = wrapper.findAll('.message')
    expect(messages).toHaveLength(3)
    expect(messages[0].classes()).toContain('user-message')
    expect(messages[1].classes()).toContain('agent-message')
    expect(messages[2].classes()).toContain('system-message')
  })

  it('handles reconnection', async () => {
    const mockReconnect = vi.fn().mockResolvedValue(true)
    vi.mocked(useWidgetSocket).mockImplementation(() => ({
      messages: ref([]),
      loading: ref(false),
      errorMessage: ref(''),
      showError: ref(false),
      loadingHistory: ref(false),
      hasStartedChat: ref(false),
      connectionStatus: ref<ConnectionStatus>('failed'),
      sendMessage: vi.fn(),
      loadChatHistory: vi.fn(),
      connect: vi.fn(),
      reconnect: mockReconnect,
      cleanup: vi.fn(),
      customer: ref({}),
      onTakeover: vi.fn()
    }))
    
    wrapper = createWrapper()
    await wrapper.find('.reconnect-button').trigger('click')
    expect(mockReconnect).toHaveBeenCalled()
  })

  it('cleans up on unmount', () => {
    const mockCleanup = vi.fn()
    vi.mocked(useWidgetSocket).mockImplementation(() => ({
      messages: ref([]),
      loading: ref(false),
      errorMessage: ref(''),
      showError: ref(false),
      loadingHistory: ref(false),
      hasStartedChat: ref(false),
      connectionStatus: ref<ConnectionStatus>('connected'),
      sendMessage: vi.fn(),
      loadChatHistory: vi.fn(),
      connect: vi.fn(),
      reconnect: vi.fn(),
      cleanup: mockCleanup,
      customer: ref({}),
      onTakeover: vi.fn()
    }))
    
    wrapper = createWrapper()
    wrapper.unmount()
    expect(mockCleanup).toHaveBeenCalled()
  })
}) 