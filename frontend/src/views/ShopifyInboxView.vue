<template>
  <s-app-nav>
    <s-link href="/shopify/agent-management" rel="home">Home</s-link>
    <s-link href="/shopify/inbox">Inbox</s-link>
    <s-link href="/shopify/pricing">Pricing</s-link>
  </s-app-nav>

  <!-- <s-page> -->
    <!-- Loading State -->
    <s-section v-if="isInitializing">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Initializing...</p>
      </div>
    </s-section>

    <!-- Main Content -->
    <s-section v-else>
      <InboxTab
        :conversations="conversations"
        :loading="loadingConversations"
        :status="conversationStatus"
        :selected-id="selectedConversationId"
        :selected-conversation="selectedConversation"
        @update:status="handleStatusChange"
        @select-conversation="selectConversation"
      />
    </s-section>
  <!-- </s-page> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { chatService } from '@/services/chat'
import type { Conversation, ChatDetail } from '@/types/chat'
import { toast } from 'vue-sonner'
import InboxTab from '@/components/shopify/InboxTab.vue'
import { useShopifySession } from '@/composables/useShopifySession'

const route = useRoute()

// Use Shopify session composable
const { getToken } = useShopifySession()

// State
const isInitializing = ref(true)
const conversations = ref<Conversation[]>([])
const selectedConversationId = ref<string | null>(null)
const selectedConversation = ref<ChatDetail | null>(null)
const loadingConversations = ref(false)
const conversationStatus = ref<'open' | 'closed'>('open')

// Methods
const loadConversations = async () => {
  loadingConversations.value = true
  try {
    const params: any = {
      status: conversationStatus.value === 'open' ? 'open,transferred' : conversationStatus.value,
      limit: 50
    }

    conversations.value = await chatService.getRecentChats(params)
  } catch (error) {
    console.error('Error loading conversations:', error)
    toast.error('Failed to load conversations')
  } finally {
    loadingConversations.value = false
  }
}

const selectConversation = async (sessionId: string) => {
  selectedConversationId.value = sessionId
  try {
    selectedConversation.value = await chatService.getChatDetail(sessionId)
  } catch (error) {
    console.error('Error loading conversation detail:', error)
    toast.error('Failed to load conversation')
  }
}

const handleStatusChange = (status: 'open' | 'closed') => {
  conversationStatus.value = status
  loadConversations()
}

// Initialize
onMounted(async () => {
  try {
    console.log('🚀 ShopifyInbox mounted')

    // Get session token from App Bridge
    const sessionToken = await getToken()

    if (!sessionToken) {
      console.log('⚠️ No session token available')
      toast.error('Failed to authenticate with Shopify')
      return
    }

    console.log('✅ Session token obtained')

    // Load conversations
    await loadConversations()

    console.log('✅ Inbox loaded successfully')
  } catch (error: any) {
    console.error('❌ Initialization failed:', error)
    toast.error('Failed to initialize inbox')
  } finally {
    isInitializing.value = false
  }
})
</script>

<style scoped>
/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl, 48px);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color, #e1e3e5);
  border-top: 4px solid var(--primary-color, #f34611);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-lg, 24px);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: var(--text-base, 16px);
  color: var(--text-muted, #6d7175);
  margin: 0;
}
</style>
