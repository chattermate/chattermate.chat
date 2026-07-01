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

import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ChatMessage from '../../../components/aiagent/ChatMessage.vue'
import robotIcon from '@/assets/robot.png'
import userIcon from '@/assets/user.png'

describe('ChatMessage', () => {
  let wrapper: VueWrapper

  const createWrapper = (props = {}) => {
    return mount(ChatMessage, {
      props: {
        role: 'user',
        content: 'Test message',
        ...props
      }
    })
  }

  it('renders user message properly', () => {
    wrapper = createWrapper({
      role: 'user',
      content: 'Hello, world!'
    })

    expect(wrapper.find('.message').exists()).toBe(true)
    expect(wrapper.find('.message').classes()).toContain('user')
    expect(wrapper.find('.bubble').text()).toBe('Hello, world!')
    expect(wrapper.find('.user-icon').exists()).toBe(true)
  })

  it('renders bot message properly', () => {
    wrapper = createWrapper({
      role: 'bot',
      content: 'I am a bot',
      agent: 'Test Bot'
    })

    expect(wrapper.find('.message').exists()).toBe(true)
    expect(wrapper.find('.robot-icon').exists()).toBe(true)
    expect(wrapper.find('.bubble').text()).toBe('I am a bot')
    expect(wrapper.find('.robot-icon').attributes('alt')).toBe('Test Bot')
  })

  it('renders error message properly', () => {
    wrapper = createWrapper({
      role: 'error',
      content: 'An error occurred'
    })

    expect(wrapper.find('.message').exists()).toBe(true)
    expect(wrapper.find('.message').classes()).toContain('error')
    expect(wrapper.find('.bubble').text()).toBe('An error occurred')
    expect(wrapper.find('.avatar').text()).toBe('⚠️')
  })

  it('shows loading state for bot messages', () => {
    wrapper = createWrapper({
      role: 'bot',
      content: '',
      isLoading: true
    })

    expect(wrapper.find('.typing-indicator').exists()).toBe(true)
    expect(wrapper.findAll('.typing-indicator span')).toHaveLength(3)
  })

  it('uses custom avatar for bot when provided', () => {
    const customAvatar = 'custom-bot.png'
    wrapper = createWrapper({
      role: 'bot',
      content: 'Custom avatar message',
      avatar: customAvatar
    })

    const avatarImg = wrapper.find('.robot-icon')
    expect(avatarImg.exists()).toBe(true)
    expect(avatarImg.attributes('src')).toBe(customAvatar)
  })

  it('uses default robot icon when no avatar is provided for bot', () => {
    wrapper = createWrapper({
      role: 'bot',
      content: 'Default avatar message'
    })

    const avatarImg = wrapper.find('.robot-icon')
    expect(avatarImg.exists()).toBe(true)
    expect(avatarImg.attributes('src')).toBe(robotIcon)
  })

  it('applies correct styling classes', () => {
    wrapper = createWrapper({
      role: 'user',
      content: 'Style test message'
    })

    expect(wrapper.find('.message').classes()).toContain('user')
    expect(wrapper.find('.avatar').exists()).toBe(true)
    expect(wrapper.find('.bubble').exists()).toBe(true)
  })

  it('handles empty content properly', () => {
    wrapper = createWrapper({
      role: 'user',
      content: ''
    })

    expect(wrapper.find('.bubble').text()).toBe('')
  })

  it('uses correct alt text for bot avatar', () => {
    wrapper = createWrapper({
      role: 'bot',
      content: 'Bot message',
      agent: 'Custom Agent'
    })

    expect(wrapper.find('.robot-icon').attributes('alt')).toBe('Custom Agent')
  })

  it('uses default alt text for bot avatar when no agent name is provided', () => {
    wrapper = createWrapper({
      role: 'bot',
      content: 'Bot message'
    })

    expect(wrapper.find('.robot-icon').attributes('alt')).toBe('AI Assistant')
  })
}) 