<!--
ChatterMate - Agent Widget Tab
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
-->

<script setup lang="ts">
import { computed } from 'vue'
import type { Agent } from '@/types/agent'

interface Widget {
  id: string;
  [key: string]: any;
}

const props = defineProps({
  widget: {
    type: Object as () => Widget | null,
    required: true
  },
  widgetUrl: {
    type: String,
    required: true
  },
  widgetLoading: {
    type: Boolean,
    required: true
  },
  agent: {
    type: Object as () => Agent,
    required: true
  }
})

const emit = defineEmits(['copy-widget-code', 'copy-iframe-code', 'copy-backend-code'])

// Check if token authentication is required
const requiresTokenAuth = computed(() => {
  return props.agent?.require_token_auth ?? false
})

const copyWidgetCode = () => {
  emit('copy-widget-code')
}

const copyIframeCode = () => {
  emit('copy-iframe-code')
}

const copyBackendCode = () => {
  emit('copy-backend-code')
}

// Check if this is an "Ask Anything" style agent
const isAskAnythingStyle = computed(() => {
  return props.agent?.customization?.chat_style === 'ASK_ANYTHING'
})

// Generate iframe URL
const iframeUrl = computed(() => {
  if (!props.widget?.id) return ''
  return `${props.widgetUrl}/api/v1/widgets/${props.widget.id}/data`
})

// Generate iframe embed code
const iframeEmbedCode = computed(() => {
  if (!props.widget?.id) return ''
  return `<iframe src="${iframeUrl.value}" width="100%" height="600" frameborder="0" title="AI Assistant" allow="clipboard-write"></iframe>`
})
</script>

<template>
  <div class="widget-tab">
    <section class="detail-section">
      <h3 class="section-title">Widget Integration</h3>
      <p class="section-description">
        Add your agent to any website by copying and pasting the code snippet below into your HTML.
      </p>

      <div class="widget-info">
        <h4 class="widget-section-title">Embed Code</h4>
        <div v-if="widgetLoading" class="loading-indicator">
          <div class="loading-spinner"></div>
          Loading widget info...
        </div>
        <div v-else-if="widget" class="widget-code-section">
          <!-- Token-based authentication (when require_token_auth is enabled) -->
          <template v-if="requiresTokenAuth">
            <div class="auth-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Token Authentication Required
            </div>

            <p class="code-description">
              This agent requires token authentication. Your backend must generate a token using the ChatterMate API before loading the widget.
            </p>

            <!-- Step 1: Get API Key -->
            <div class="setup-step">
              <div class="step-header">
                <span class="step-number">1</span>
                <h5 class="step-title">Get your API Key</h5>
              </div>
              <p class="step-description">
                Go to <strong>Settings &gt; Widget Apps</strong> to create a Widget App and get your API key.
                Keep this key secure - it should only be used server-side.
              </p>
            </div>

            <!-- Step 2: Backend Token Generation -->
            <div class="setup-step">
              <div class="step-header">
                <span class="step-number">2</span>
                <h5 class="step-title">Generate token (Server-side)</h5>
              </div>
              <p class="step-description">
                Create a backend endpoint that calls the ChatterMate API to generate a token:
              </p>
              <div class="code-block">
                <pre><code>// Your backend endpoint (e.g., /api/chat-token)
const response = await fetch('{{ widgetUrl }}/api/v1/generate-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'  // From Widget Apps
  },
  body: JSON.stringify({
    widget_id: '{{ widget.id }}',
    customer_email: 'user@example.com',  // Optional
    ttl_seconds: 3600  // Token validity (1 hour)
  })
});

const { data } = await response.json();
// Return data.token to your frontend</code></pre>
                <button class="copy-button" @click="copyBackendCode" title="Copy backend code">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Step 3: Frontend Integration -->
            <div class="setup-step">
              <div class="step-header">
                <span class="step-number">3</span>
                <h5 class="step-title">Add to your website (Client-side)</h5>
              </div>
              <p class="step-description">
                Add this code to your HTML, replacing <code>/api/chat-token</code> with your backend endpoint:
              </p>
              <div class="code-block">
                <pre><code>&lt;script&gt;
(function() {
  // Fetch token from your backend
  fetch('/api/chat-token')
    .then(r => r.json())
    .then(data => {
      // Set widget ID and token
      window.chattermateId = '{{ widget.id }}';
      window.chattermateToken = data.token;

      // Load the widget script
      const script = document.createElement('script');
      script.src = '{{ widgetUrl }}/webclient/chattermate.min.js';
      document.head.appendChild(script);
    })
    .catch(e => console.error('Failed to initialize chat:', e));
})();
&lt;/script&gt;</code></pre>
                <button class="copy-button" @click="copyWidgetCode" title="Copy to clipboard">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="info-box warning">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="info-content">
                <p><strong>Security Note:</strong> Never expose your API key in client-side code. The token generation must happen on your server.</p>
              </div>
            </div>
          </template>

          <!-- Simple integration (no token auth required) -->
          <template v-else>
            <p class="code-description">
              Add this code snippet to your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag:
            </p>
            <div class="code-block">
              <pre><code>&lt;script&gt;
  window.chattermateId = '{{ widget.id }}';
&lt;/script&gt;
&lt;script src="{{ widgetUrl }}/webclient/chattermate.min.js"&gt;&lt;/script&gt;</code></pre>
              <button class="copy-button" @click="copyWidgetCode" title="Copy to clipboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
            <div class="info-box">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="info-content">
                <p>The widget will appear as a chat button in the bottom right corner of your website. No authentication setup required.</p>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Iframe Integration Section for Ask Anything Style -->
      <div v-if="isAskAnythingStyle && !requiresTokenAuth" class="widget-info">
        <h4 class="widget-section-title">Iframe Integration</h4>
        <div v-if="widgetLoading" class="loading-indicator">
          <div class="loading-spinner"></div>
          Loading iframe info...
        </div>
        <div v-else-if="widget" class="widget-code-section">
          <p class="code-description">
            For "Ask Anything" style agents, you can embed the chat interface directly into your page:
          </p>

          <!-- Iframe Preview -->
          <div class="iframe-preview-section">
            <h5 class="preview-title">Preview</h5>
            <div class="iframe-preview-container">
              <iframe
                :src="iframeUrl"
                class="iframe-preview"
                frameborder="0"
                title="AI Assistant Preview"
                allow="clipboard-write"
              ></iframe>
            </div>
          </div>

          <!-- Iframe Code -->
          <div class="code-block">
            <pre><code>{{ iframeEmbedCode }}</code></pre>
            <button class="copy-button" @click="copyIframeCode" title="Copy iframe code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <div class="info-box">
            <div class="info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="info-content">
              <p><strong>Tip:</strong> Perfect for embedding directly into help pages, contact forms, or dedicated support sections.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.widget-tab {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
}

.detail-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
}

.section-description {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.widget-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-md);
}

.widget-info {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  margin-bottom: var(--space-xl);
}

.widget-code-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Auth badge for token authentication */
.auth-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  width: fit-content;
  margin-bottom: var(--space-md);
}

.code-description {
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: 0;
}

.code-description code {
  background: var(--background-alt);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 0.9em;
  color: var(--primary-color);
}

/* Setup steps */
.setup-step {
  background: var(--background-alt);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  border: 1px solid var(--border-color);
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: var(--text-sm);
  font-weight: 600;
  flex-shrink: 0;
}

.step-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.step-description {
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: 0 0 var(--space-md) 0;
  padding-left: calc(28px + var(--space-md));
}

.step-description strong {
  color: var(--text-color);
}

/* Code block styling */
.code-block {
  position: relative;
  background: #1e1e1e;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.code-block pre {
  margin: 0;
  padding: var(--space-lg);
  overflow-x: auto;
}

.code-block code {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre;
  display: block;
}

.code-block .copy-button {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #888;
}

.code-block .copy-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.copy-button {
  background: var(--background-soft);
  border: 1px solid var(--border-color);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: var(--background-mute);
  color: var(--text-color);
}

.loading-indicator {
  font-size: var(--text-sm);
  color: var(--text-muted);
  padding: var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  background: var(--background-alt);
  border-radius: var(--radius-md);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Info box */
.info-box {
  display: flex;
  background: var(--background-alt);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
  gap: var(--space-md);
  align-items: flex-start;
}

.info-box.warning {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.info-box .info-icon {
  flex-shrink: 0;
  color: var(--primary-color);
}

.info-box.warning .info-icon {
  color: #f59e0b;
}

.info-content p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.6;
}

.info-content strong {
  color: var(--text-color);
}

/* Iframe integration styles */
.iframe-preview-section {
  margin-bottom: var(--space-lg);
}

.preview-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: var(--space-md);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.iframe-preview-container {
  background: var(--background-alt);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.iframe-preview {
  width: 100%;
  height: 450px;
  border-radius: var(--radius-md);
  background: white;
  display: block;
}

@media (max-width: 768px) {
  .widget-tab {
    padding: 0 var(--space-md);
  }

  .widget-info {
    padding: var(--space-lg);
  }

  .step-description {
    padding-left: 0;
    margin-top: var(--space-sm);
  }

  .code-block pre {
    padding: var(--space-md);
  }

  .code-block code {
    font-size: 12px;
  }

  .iframe-preview {
    height: 350px;
  }
}
</style> 