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
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, { type WhatsAppTemplate } from '@/services/channels'
import { DEFAULT_LANGUAGE } from '@/utils/whatsappLanguages'
import BaseModal from '@/components/common/BaseModal.vue'
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

const selection = ref<TemplateSelection | null>(null)
const sending = ref(false)

const canSend = computed(() => !!selection.value?.complete && !sending.value)

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
  <BaseModal title="Send a template" @close="emit('close')">
    <p class="tpl-intro">
      This conversation is outside WhatsApp's 24-hour window. An approved template reopens it.
    </p>

    <WhatsAppTemplateSelect v-model:selection="selection" :account-id="accountId" />

    <template #actions>
      <button class="modal-btn" @click="emit('close')">Cancel</button>
      <button
        class="modal-btn modal-btn-primary"
        :disabled="!canSend"
        :aria-busy="sending"
        @click="send"
      >
        <font-awesome-icon v-if="sending" icon="fa-solid fa-spinner" spin />
        {{ sending ? 'Sending…' : 'Send template' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.tpl-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
</style>
