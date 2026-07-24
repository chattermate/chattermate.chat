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

import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'
import emitter from '@/utils/emitter'
import { getWsUrl } from '@/config/api'

// Utility function to set cookies
function setCookie(name: string, value: string, maxAge: number = 1800) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

class SocketService {
  private socket: Socket | null = null
  private _isConnected = ref(false)
  private _error = ref<string | null>(null)
  private eventEmitter = emitter

  get isConnected() {
    return this._isConnected
  }

  get error() {
    return this._error
  }

  connect(namespace: string = '/agent') {
    if (this.socket?.connected) return

    // Use the runtime-resolved WS URL (window.APP_CONFIG → VITE_WS_URL → localhost),
    // same as every other consumer. Reading import.meta.env directly baked the
    // published image to ws://localhost:8000 and broke self-hosted dashboards.
    const apiUrl = getWsUrl()
    this.socket = io(apiUrl + namespace, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      this._isConnected.value = true
      this._error.value = null
      console.log('Socket connected')
      // Emit reconnection event for components to reattach listeners
      this.eventEmitter.emit('socket:reconnected')
    })

    this.socket.on('cookie_set', (data) => {
      if (data.access_token) {
        setCookie('access_token', data.access_token)
        // Reconnect socket with new token
        this.socket?.disconnect()
        this.connect()
      }
    })

    this.socket.on('connection_success', (data) => {
      console.log('Connection success:', data)
    })

    this.socket.on('disconnect', () => {
      this._isConnected.value = false
      console.log('Socket disconnected')
    })

    this.socket.on('error', (error) => {
      this._error.value = error.error
      console.error('Socket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data: unknown) {
    if (!this.socket) {
      console.error('Socket not initialized')
      return
    }
    this.socket.emit(event, data)
  }

  emitPing(event: string) {
    if (!this.socket) {
      console.error('Socket not initialized')
      return
    }
    this.socket.emit(event)
  }

  on<T>(event: string, callback: (data: T) => void) {
    if (!this.socket) {
      console.error('Socket not initialized')
      return
    }
    this.socket.on(event, callback as (...args: any[]) => void)
  }

  off<T>(event: string, callback?: (data: T) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized')
      return
    }
    this.socket.off(event, callback as (...args: any[]) => void)
  }

  // Add methods for reconnection event handling
  onReconnect(callback: () => void) {
    this.eventEmitter.on('socket:reconnected', callback)
  }

  offReconnect(callback: () => void) {
    this.eventEmitter.off('socket:reconnected', callback)
  }
}

// Create a singleton instance
export const socketService = new SocketService()
