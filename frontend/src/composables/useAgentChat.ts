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

import { ref } from 'vue'

import type { ChatMessage } from '@/types/agent'

export function useAgentChat(agentId: string) {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentInput = ref('')

  // Initialize chat with welcome message
  const initChat = () => {
    messages.value = [
      {
        role: 'bot',
        content: 'Hello! How can I help you today?',
      },
    ]

  }

  // Handle incoming chat responses
  const handleChatResponse = (data: unknown) => {
    isLoading.value = false
    const response = data as { message: string; type: string }
    messages.value.push({
      role: 'bot',
      content: response.message,
    })
  }

  // Handle errors
  const handleError = (data: unknown) => {
    isLoading.value = false
    const errorData = data as { error: string; type: string }
    error.value = errorData.error
  }

  // Send message
  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    try {
      isLoading.value = true
      error.value = null

      // Add user message to chat
      messages.value.push({
        role: 'user',
        content: message,
      })

      // Clear input
      currentInput.value = ''


    } catch (err) {
      error.value = 'Failed to send message'
      console.error('Chat error:', err)
    }
  }

  // Cleanup function
  const cleanup = () => {

  }

  return {
    messages,
    isLoading,
    error,
    currentInput,
    initChat,
    sendMessage,
    cleanup,
  }
}
