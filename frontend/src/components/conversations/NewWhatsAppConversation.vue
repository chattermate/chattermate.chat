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
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, { type ChannelAccount } from '@/services/channels'
import { peopleService } from '@/services/people'
import type { PersonListItem } from '@/types/people'
import { DEFAULT_LANGUAGE } from '@/utils/whatsappLanguages'
import BaseModal from '@/components/common/BaseModal.vue'
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
/** Guards against out-of-order responses — see searchPeople. */
let searchToken = 0

const searchPeople = async () => {
  const term = to.value.trim()
  if (!peopleAvailable.value || pickedPerson.value || term.length < 3) {
    suggestions.value = []
    return
  }
  // The debounce limits how OFTEN we ask, not what order the answers arrive in:
  // pause mid-number and two requests are in flight. A broader prefix scans more
  // rows, so it tends to resolve LAST and overwrite the narrower result — the
  // agent then picks from suggestions for a number they have already moved past.
  const token = ++searchToken
  try {
    const result = await peopleService.listPeople({ search: term, page_size: 5 })
    if (token !== searchToken) return
    suggestions.value = result.items.filter((p) => p.phone || p.name)
  } catch (error: any) {
    if (token !== searchToken) return
    // Only a 403 means People genuinely isn't available to this user (non-Pro
    // plan or missing permission) and is worth latching off. Latching on ANY
    // error let a single network blip kill autocomplete for the rest of the
    // modal's life — and a silently dead autocomplete invites exactly the
    // duplicate person that picking someone exists to prevent.
    if (error?.response?.status === 403) peopleAvailable.value = false
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
  // Falls back to the phone like the props path does: searchPeople admits
  // anyone with a phone OR a name, so a phone-only person reaches here and
  // would otherwise render "Sending to" followed by nothing.
  pickedPerson.value = {
    id: person.id,
    label: person.name || person.email || person.phone || 'this person',
  }
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

onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <BaseModal title="New WhatsApp conversation" width="560px" @close="emit('close')">
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
      <!-- A plain list of buttons, deliberately NOT role="listbox". The
           children are real buttons: Tab reaches each one and Enter picks it.
           Claiming listbox told screen readers to expect role="option"
           children and announced "listbox, 0 options" over working controls —
           worse than the honest markup, and the full combobox pattern
           (aria-expanded/controls/activedescendant plus arrow-key handling)
           is more than a field that degrades to a plain phone input needs. -->
      <ul v-if="suggestions.length" class="nwc-suggestions" aria-label="Matching people">
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

    <template #actions>
      <button class="modal-btn" @click="emit('close')">Cancel</button>
      <button
        class="modal-btn modal-btn-primary"
        :disabled="!canSend"
        :aria-busy="sending"
        @click="send"
      >
        <font-awesome-icon v-if="sending" icon="fa-solid fa-spinner" spin />
        {{ sending ? 'Sending…' : 'Send and open conversation' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>






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
  box-shadow: var(--shadow-md);
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




</style>
