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
import api from '@/services/api'
import { useWidgetSocket } from '@/composables/useWidgetSocket'

/**
 * Drives a live test conversation against an agent from the dashboard by
 * reusing the public widget socket path. The dashboard has no internal
 * test-chat endpoint, so we mint an anonymous conversation token for the
 * agent's widget and connect to the `/widget` namespace like the real client.
 *
 * Requires the widget's agent to allow anonymous chat (require_token_auth=false,
 * the default). If token minting fails (401), `connectionError` is surfaced.
 */
export function useOnboardingTestChat() {
  const {
    messages,
    loading,
    connectionStatus,
    sendMessage: socketSendMessage,
    connect,
    setToken,
    cleanup: socketCleanup,
  } = useWidgetSocket()

  // useWidgetSocket persists the conversation token to localStorage 'ctid';
  // clear the synthetic onboarding token on teardown so it can't leak into a
  // real widget session on the same origin.
  const cleanup = () => {
    socketCleanup()
    try { localStorage.removeItem('ctid') } catch { /* ignore */ }
  }

  const connecting = ref(false)
  const connectionError = ref<string | null>(null)
  // Synthetic email forces the token endpoint to mint a conversation token
  // for a plain AI agent (see backend widget.py should_create_customer).
  const customerEmail = `onboarding+${Date.now()}@noemail.com`

  /**
   * Fetch an anonymous conversation token for the widget and connect.
   * Returns true on success.
   */
  const start = async (widgetId: string): Promise<boolean> => {
    connecting.value = true
    connectionError.value = null
    try {
      const { data } = await api.get(`/widgets/${widgetId}`, {
        params: { email: customerEmail },
      })
      const token: string | undefined = data?.token
      if (!token) {
        connectionError.value = 'Could not start a test session for this agent.'
        return false
      }
      setToken(token)
      const connected = await connect()
      if (!connected) {
        connectionError.value = 'Could not connect to the agent. Please try again.'
        return false
      }
      return true
    } catch (err: any) {
      if (err?.response?.status === 401) {
        connectionError.value =
          'This agent requires authenticated chat. Test it from the live widget instead.'
      } else {
        connectionError.value =
          err?.response?.data?.detail || 'Could not start a test session.'
      }
      return false
    } finally {
      connecting.value = false
    }
  }

  const send = (text: string) => {
    if (!text.trim()) return
    socketSendMessage(text, customerEmail, [])
  }

  return {
    messages,
    loading,
    connecting,
    connectionStatus,
    connectionError,
    start,
    send,
    cleanup,
  }
}
