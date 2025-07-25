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
  }
})

const emit = defineEmits(['copy-widget-code'])

const copyWidgetCode = () => {
  emit('copy-widget-code')
}
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
          <p class="code-description">Add this code snippet to your website's HTML, just before the closing <code>&lt;/body&gt;</code> tag:</p>
          <div class="code-container">
            <code>&lt;script&gt;window.chattermateId='{{ widget.id }}';&lt;/script&gt;&lt;script src="{{ widgetUrl }}/webclient/chattermate.min.js"&gt;&lt;/script&gt;</code>
            <button class="copy-button" @click="copyWidgetCode" title="Copy to clipboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V8C4 6.89543 4.89543 6 6 6H8"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <div class="info-box">
            <div class="info-icon">ℹ️</div>
            <div class="info-content">
              <p>The widget will appear as a chat button in the bottom right corner of your website.</p>
            </div>
          </div>
        </div>
      </div>
      
 
    </section>
  </div>
</template>

<style scoped>
.widget-tab {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
}

.detail-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
}

.section-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: var(--space-lg);
  line-height: 1.5;
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
  padding: var(--space-lg);
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  margin-bottom: var(--space-xl);
}

.widget-code-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.code-description {
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: 1.5;
  margin-bottom: var(--space-sm);
}

.code-description code {
  background: var(--background-alt);
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.widget-code {
  font-family: monospace;
  font-size: 0.85em;
}

.code-container {
  background: var(--background-alt);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  width: 100%;
  border: 1px solid var(--border-color);
}

.code-container code {
  font-size: 13px;
  color: var(--text-color);
  white-space: normal;
  word-break: break-all;
  flex: 1;
  font-family: monospace;
  line-height: 1.5;
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
  transform: translateY(-1px);
}

.loading-indicator {
  font-size: var(--text-sm);
  color: var(--text-muted);
  padding: var(--space-lg);
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

.info-box {
  display: flex;
  background: var(--background-alt);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
  gap: var(--space-sm);
}

.info-content p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.5;
}

.widget-customization-info {
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
}

.helper-text {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.feature-list {
  margin: 0 0 var(--space-lg) var(--space-lg);
  padding: 0;
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: 1.8;
}

.customize-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.customize-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
</style> 