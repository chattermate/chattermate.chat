<template>
  <div class="setup-wrapper">
    <div class="setup-content">
      <!-- Success Header -->
      <div class="success-header">
        <div class="success-icon">✓</div>
        <div class="success-text">
          <s-heading>Integration Complete!</s-heading>
          <s-text tone="subdued">Your Shopify store is successfully connected to ChatterMate.</s-text>
        </div>
      </div>
      
      <!-- Agents Connected Banner -->
      <s-banner v-if="agentsConnected" tone="success">
        <s-text>
          ✨ <strong>{{ agentsConnected }}</strong> AI agent{{ agentsConnected !== 1 ? 's' : '' }} 
          {{ agentsConnected !== 1 ? 'are' : 'is' }} now connected and ready to assist your customers!
        </s-text>
      </s-banner>

      <!-- Widget Configuration Section -->
      <s-section heading="Widget Configuration">
        <s-stack gap="base">
          <s-text>Your Widget ID for Shopify:</s-text>

          <s-box
            v-if="widgetId"
            padding="base"
            background="surface-secondary"
            border="base"
            borderRadius="base"
            class="widget-id-box"
          >
            <s-text variant="code" class="widget-id-text">
              {{ widgetId }}
            </s-text>
          </s-box>

          <s-box
            v-else
            padding="base"
            background="surface-warning"
            border="base"
            borderRadius="base"
          >
            <s-text>
              ⚠️ Widget ID not found. Please connect an agent first.
            </s-text>
          </s-box>

          <s-banner v-if="widgetId" tone="info">
            <s-text>
              💡 Use this Widget ID in your Shopify theme settings to display the chat widget on your store.
            </s-text>
          </s-banner>
        </s-stack>
      </s-section>
          
      <!-- Setup Instructions -->
      <s-section heading="How to Add Widget ID">
        <s-stack gap="base">
          <s-ordered-list>
            <s-list-item>Click "Setup Widget in Shopify" button below</s-list-item>
            <s-list-item>In Shopify theme editor, go to "Apps" section</s-list-item>
            <s-list-item>Find "ChatterMate Chat" app</s-list-item>
            <s-list-item>Paste your Widget ID in the configuration field</s-list-item>
            <s-list-item>Save and publish your theme</s-list-item>
          </s-ordered-list>
          
          <div class="setup-button">
            <s-button variant="primary" @click="emit('open-theme-editor')">
              Setup Widget in Shopify
            </s-button>
        </div>
        </s-stack>
      </s-section>

      <!-- Features Section -->
      <s-section heading="Your AI agents can now">
        <s-unordered-list>
          <s-list-item>🛍️ Search and display products from your store</s-list-item>
          <s-list-item>📦 Check order status and tracking</s-list-item>
          <s-list-item>💡 Recommend products to customers</s-list-item>
          <s-list-item>❓ Answer product questions instantly</s-list-item>
        </s-unordered-list>
      </s-section>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  agentsConnected: number
  widgetId: string | undefined
}>()

const emit = defineEmits<{
  (e: 'open-theme-editor'): void
}>()
</script>

<style scoped>
.setup-wrapper {
  max-width: 800px;
}

.setup-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.success-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 0;
}

.success-icon {
  width: 48px;
  height: 48px;
  background-color: #36B37E;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.success-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.widget-id-box {
  max-width: 100%;
}

.widget-id-text {
  word-break: break-all;
  user-select: all;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.setup-button {
  margin-top: 8px;
}
</style>

