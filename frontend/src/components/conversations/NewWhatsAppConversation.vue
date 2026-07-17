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
/**
 * Start a WhatsApp conversation with a phone number.
 *
 * One shared modal behind both entry points — the Conversations "New
 * conversation" button and the People drawer's "Message on WhatsApp" — so
 * template choice and variable filling can never diverge between them.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, { type ChannelAccount } from '@/services/channels'
import { peopleService } from '@/services/people'
import type { PersonListItem } from '@/types/people'
import { DEFAULT_LANGUAGE } from '@/utils/whatsappLanguages'
import WhatsAppTemplateSelect, {
  type TemplateSelection,
} from '@/components/conversations/WhatsAppTemplateSelect.vue'

const props = defineProps<{
  accounts: ChannelAccount[]
  /** Pre-selected person (the People-drawer entry point). */
  person?: { id: string; name?: string | null; phone?: string | null } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'started', sessionId: string): void
}>()

// Outbound = business-initiated: Meta only reliably delivers Utility and
// Authentication templates to someone who hasn't messaged us; Marketing also
// carries per-user caps. The server enforces the same rule.
const OUTBOUND_CATEGORIES = ['UTILITY', 'AUTHENTICATION']

const dialog = ref<HTMLElement | null>(null)
const accountId = ref(props.accounts[0]?.id ?? '')
const to = ref(props.person?.phone ?? '')
const name = ref('')
const selection = ref<TemplateSelection | null>(null)
const sending = ref(false)

/** The person this number belongs to, when known — prevents a duplicate row. */
const pickedPerson = ref<{ id: string; label: string } | null>(
  props.person ? { id: props.person.id, label: props.person.name || props.person.phone || '' } : null,
)
// The phone the pick was based on. Editing away from it unlinks — but a
// person picked WITHOUT a stored phone stays linked to whatever is typed:
// that's the drawer's "message this person at a number you enter" case.
let pickedPhone: string | null = props.person?.phone ?? null

/**
 * Autocomplete against People. Degrades silently to a plain phone input where
 * People isn't available (non-Pro plan or missing permission): the feature is
 * a convenience, not a requirement, and a 403 must not break outbound.
 */
const suggestions = ref<PersonListItem[]>([])
const peopleAvailable = ref(true)
let searchTimer: ReturnType<typeof setTimeout> | undefined

const searchPeople = async () => {
  const term = to.value.trim()
  if (!peopleAvailable.value || pickedPerson.value || term.length < 3) {
    suggestions.value = []
    return
  }
  try {
    const result = await peopleService.listPeople({ search: term, page_size: 5 })
    suggestions.value = result.items.filter((p) => p.phone || p.name)
  } catch {
    peopleAvailable.value = false
    suggestions.value = []
  }
}

watch(to, () => {
  // Typing away from the picked person's own number un-picks them.
  if (pickedPerson.value && pickedPhone && to.value !== pickedPhone) {
    pickedPerson.value = null
    pickedPhone = null
  }
  clearTimeout(searchTimer)
  searchTimer = setTimeout(searchPeople, 300)
})

const pick = (person: PersonListItem) => {
  pickedPerson.value = { id: person.id, label: person.name || person.email || '' }
  pickedPhone = person.phone ?? null
  if (person.phone) to.value = person.phone
  suggestions.value = []
}

const unpick = () => {
  pickedPerson.value = null
  pickedPhone = null
}

// Client-side mirror of the server's normalize_phone: '+' then 8-15 digits,
// decoration forgiven. The server remains the authority.
const phoneLooksValid = computed(() =>
  /^\+[1-9]\d{7,14}$/.test(to.value.replace(/[\s\-().]/g, '')),
)

const canSend = computed(
  () => phoneLooksValid.value && !!selection.value?.complete && !sending.value,
)

const send = async () => {
  if (!canSend.value || !selection.value) return
  const { template, components } = selection.value
  try {
    sending.value = true
    const result = await channelsService.startWhatsAppConversation(accountId.value, {
      to: to.value,
      template_name: template.name,
      language: template.language || DEFAULT_LANGUAGE,
      components,
      customer_id: pickedPerson.value?.id,
      customer_name: name.value.trim() || undefined,
    })
    toast.success('Message sent', {
      description: 'The conversation is in your inbox; the AI answers when they reply.',
    })
    emit('started', result.session_id)
  } catch (error: any) {
    toast.error('Could not start the conversation', {
      description: error?.response?.data?.detail || 'Please try again',
      closeButton: true,
    })
  } finally {
    sending.value = false
  }
}

onMounted(() => dialog.value?.focus())
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <div
    ref="dialog"
    class="nwc-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="nwc-title"
    tabindex="-1"
    @click.self="emit('close')"
    @keydown.esc="emit('close')"
  >
    <div class="nwc-content">
      <div class="nwc-header">
        <h3 id="nwc-title">New WhatsApp conversation</h3>
        <button class="nwc-close" aria-label="Close" @click="emit('close')">×</button>
      </div>

      <!-- Meta's opt-in policy is the operator's obligation; state it, don't police it -->
      <p class="nwc-intro">
        Only message people who agreed to hear from you on WhatsApp — Meta blocks businesses
        whose messages get reported.
      </p>

      <label v-if="accounts.length > 1" class="nwc-field">
        <span class="nwc-label">From number</span>
        <select v-model="accountId" class="nwc-input">
          <option v-for="account in accounts" :key="account.id" :value="account.id">
            {{ account.display_name || account.external_account_id }}
          </option>
        </select>
      </label>

      <div class="nwc-field">
        <span class="nwc-label">To</span>
        <input
          v-model="to"
          class="nwc-input"
          placeholder="+91 63666 02824"
          autocomplete="off"
          :aria-label="peopleAvailable ? 'Phone number or search People' : 'Phone number'"
        />
        <span v-if="pickedPerson" class="nwc-picked">
          Sending to <strong>{{ pickedPerson.label }}</strong>
          <button type="button" class="nwc-unpick" aria-label="Not this person" @click="unpick">×</button>
        </span>
        <span v-else-if="to && !phoneLooksValid" class="nwc-hint">
          International format with country code, e.g. +91…
        </span>
        <ul v-if="suggestions.length" class="nwc-suggestions" role="listbox">
          <li v-for="person in suggestions" :key="person.id">
            <button type="button" class="nwc-suggestion" @click="pick(person)">
              <span class="nwc-suggestion-name">{{ person.name || person.email }}</span>
              <span v-if="person.phone" class="nwc-suggestion-phone">{{ person.phone }}</span>
            </button>
          </li>
        </ul>
      </div>

      <label v-if="!pickedPerson" class="nwc-field">
        <span class="nwc-label">Name (optional)</span>
        <input v-model="name" class="nwc-input" placeholder="Priya" autocomplete="off" />
        <span class="nwc-hint">Used only if this number isn't a person in People yet.</span>
      </label>

      <div class="nwc-field">
        <span class="nwc-label">Template</span>
        <!-- Key: switching the sending number reloads that account's templates -->
        <WhatsAppTemplateSelect
          :key="accountId"
          v-model:selection="selection"
          :account-id="accountId"
          :categories="OUTBOUND_CATEGORIES"
          empty-hint="Outbound conversations need an approved Utility or Authentication template. Create one from the WhatsApp card in Settings → Integrations."
        />
      </div>

      <div class="nwc-actions">
        <button class="nwc-btn" @click="emit('close')">Cancel</button>
        <button
          class="nwc-btn nwc-btn-primary"
          :disabled="!canSend"
          :aria-busy="sending"
          @click="send"
        >
          <i v-if="sending" class="fas fa-spinner fa-spin"></i>
          {{ sending ? 'Sending…' : 'Send and open conversation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nwc-modal {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.nwc-modal:focus {
  outline: none;
}

.nwc-content {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(560px, 100%);
  max-height: min(720px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: auto;
}

.nwc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.nwc-header h3 {
  margin: 0;
  font-family: var(--font-display);
}

.nwc-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--muted);
}

.nwc-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.nwc-field {
  display: block;
  margin-bottom: 14px;
  position: relative;
}

.nwc-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.nwc-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}

.nwc-hint,
.nwc-picked {
  display: block;
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}

.nwc-suggestions {
  list-style: none;
  margin: 4px 0 0;
  padding: 4px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-color);
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.nwc-suggestion {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  background: none;
  color: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
}

.nwc-suggestion:hover {
  background: var(--o08);
}

.nwc-unpick {
  border: none;
  background: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  padding: 0 2px;
}

.nwc-suggestion-phone {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.nwc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.nwc-btn {
  padding: 9px 16px;
  border-radius: var(--radius-btn, 8px);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.nwc-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.nwc-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
