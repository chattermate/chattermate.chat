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

import { createApp } from 'vue'
import WidgetBuilder from './WidgetBuilder.vue'
import './widget.css'

// Ensure the environment is defined
// @ts-ignore
if (!window.process) {
  // @ts-ignore
  window.process = { env: { NODE_ENV: 'production' } }
}

// Extract widget ID and token from window or URL
// @ts-ignore
const initialData = window.__INITIAL_DATA__
const url = new URL(window.location.href)
const isPreviewMode = url.searchParams.get('preview') === 'true'

// Helper to handle URL params that might be the string "undefined"
const getURLParam = (name: string): string | undefined => {
  const value = url.searchParams.get(name)
  // Return undefined if value is null, empty, or the literal string "undefined"
  if (!value || value === 'undefined' || value.trim() === '') {
    return undefined
  }
  return value
}

// Get widget ID - prefer URL param in preview mode
const widgetId = isPreviewMode
  ? getURLParam('widget_id') || (initialData?.widgetId) || undefined
  : (initialData?.widgetId) || undefined

// Get token - prefer initial data, fallback to URL param in preview mode
// @ts-ignore
const token = isPreviewMode
  ? (initialData?.initialToken) || getURLParam('token') || undefined
  : (initialData?.initialToken) || undefined

/**
 * SECURITY: Token Handling
 * 
 * The widget supports two authentication modes based on agent's require_token_auth setting:
 * 
 * 1. require_token_auth=true: Token MUST be provided from portal backend via /api/v1/generate-token
 * 2. require_token_auth=false: Backend auto-generates tokens for anonymous users
 * 
 * Token is a JWT that cryptographically binds:
 * - widget_id (the specific widget instance)
 * - customer_id (the authenticated user)
 * - expiration time (TTL)
 * 
 * Token signature is verified on the backend before any WebSocket connection.
 */

const app = createApp(WidgetBuilder, {
  widgetId: widgetId,
  token: token || undefined,
  initialAuthError: null // Let backend determine if auth is required
})
app.mount('#app')
