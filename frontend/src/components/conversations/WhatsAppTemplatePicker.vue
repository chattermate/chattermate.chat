<!--
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
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, { type WhatsAppTemplate } from '@/services/channels'
import { DEFAULT_LANGUAGE } from '@/utils/whatsappLanguages'
import WhatsAppTemplateSelect, {
  type TemplateSelection,
} from '@/components/conversations/WhatsAppTemplateSelect.vue'

const props = defineProps<{
  accountId: string
  sessionId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'sent', template: WhatsAppTemplate): void
}>()

const dialog = ref<HTMLElement | null>(null)
const selection = ref<TemplateSelection | null>(null)
const sending = ref(false)

const canSend = computed(() => !!selection.value?.complete && !sending.value)

onMounted(() => {
  // Move focus into the dialog: it makes Escape work and stops keyboard users
  // starting outside an aria-modal dialog.
  dialog.value?.focus()
})

const send = async () => {
  if (!selection.value || !canSend.value) return
  const { template, components } = selection.value
  try {
    sending.value = true
    await channelsService.sendWhatsAppTemplate(props.accountId, {
      session_id: props.sessionId,
      template_name: template.name,
      language: template.language || DEFAULT_LANGUAGE,
      components,
    })
    toast.success('Template sent', { description: 'The customer can reply for the next 24 hours.' })
    emit('sent', template)
  } catch (error: any) {
    toast.error('Could not send template', {
      description: error?.response?.data?.detail || 'Please try again',
      closeButton: true,
    })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div
    ref="dialog"
    class="tpl-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="tpl-title"
    tabindex="-1"
    @click.self="emit('close')"
    @keydown.esc="emit('close')"
  >
    <div class="tpl-content">
      <div class="tpl-header">
        <h3 id="tpl-title">Send a template</h3>
        <button class="tpl-close" aria-label="Close" @click="emit('close')">×</button>
      </div>

      <p class="tpl-intro">
        This conversation is outside WhatsApp's 24-hour window. An approved template reopens it.
      </p>

      <WhatsAppTemplateSelect v-model:selection="selection" :account-id="accountId" />

      <div class="tpl-actions">
        <button class="tpl-btn" @click="emit('close')">Cancel</button>
        <button
          class="tpl-btn tpl-btn-primary"
          :disabled="!canSend"
          :aria-busy="sending"
          @click="send"
        >
          <i v-if="sending" class="fas fa-spinner fa-spin"></i>
          {{ sending ? 'Sending…' : 'Send template' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tpl-modal {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.tpl-modal:focus {
  outline: none;
}

.tpl-content {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(520px, 100%);
  max-height: min(680px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.tpl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.tpl-header h3 {
  margin: 0;
  font-family: var(--font-display);
}

.tpl-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--muted);
}

.tpl-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.tpl-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.tpl-btn {
  padding: 9px 16px;
  border-radius: var(--radius-btn, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.tpl-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.tpl-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
