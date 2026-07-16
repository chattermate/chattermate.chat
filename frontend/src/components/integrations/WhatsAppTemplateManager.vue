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
import { ref, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import channelsService, {
  type ChannelAccount,
  type WhatsAppTemplate,
} from '@/services/channels'
import { templatePreviewText } from '@/utils/whatsappTemplates'
import { languageLabel } from '@/utils/whatsappLanguages'

const props = defineProps<{
  accounts: ChannelAccount[]
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const dialog = ref<HTMLElement | null>(null)
const accountId = ref(props.accounts[0]?.id ?? '')
const templates = ref<WhatsAppTemplate[]>([])
const loading = ref(true)
const loadError = ref('')
const deletingName = ref('')
const confirmingName = ref('')

/**
 * Templates are written in Meta's Template Library, not here — it has ~150
 * pre-written, pre-localised ones built to pass its own review.
 *
 * The link is fetched rather than built: it is scoped to this number's Business
 * Account, and only the server can resolve which that is. It loads with the
 * list so the anchor is a real href by the time it is clicked — opening it
 * after an await instead would hand the browser a popup to block.
 */
const libraryUrl = ref('')

// Guards against a slow response for a previously selected number landing after
// a newer one and rendering its templates under the wrong account.
let loadToken = 0

const load = async () => {
  const token = ++loadToken
  confirmingName.value = ''
  loadError.value = ''
  libraryUrl.value = ''
  if (!accountId.value) {
    templates.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    const result = await channelsService.listWhatsAppTemplates(accountId.value)
    if (token !== loadToken) return
    templates.value = result
  } catch (error: any) {
    if (token !== loadToken) return
    loadError.value = error?.response?.data?.detail || 'Could not load templates'
    templates.value = []
  } finally {
    if (token === loadToken) loading.value = false
  }
}

/**
 * Fetched alongside the list but deliberately not awaited with it: this costs a
 * Graph call, and failing it must not take the list down with it. Without a URL
 * the link simply doesn't render.
 */
const loadLibraryUrl = async () => {
  const token = loadToken
  if (!accountId.value) return
  try {
    const url = await channelsService.getWhatsAppTemplateLibraryUrl(accountId.value)
    if (token === loadToken) libraryUrl.value = url
  } catch {
    // Left empty: the list is still useful, and there is nothing to act on.
  }
}

const refresh = () => {
  load()
  loadLibraryUrl()
}

onMounted(() => {
  dialog.value?.focus()
  refresh()
})

watch(accountId, refresh)

const remove = async (name: string) => {
  try {
    deletingName.value = name
    await channelsService.deleteWhatsAppTemplate(accountId.value, name)
    toast.success(`Deleted ${name}`)
    confirmingName.value = ''
    await load()
  } catch (error: any) {
    toast.error('Could not delete template', {
      description: error?.response?.data?.detail || 'Please try again',
      closeButton: true,
    })
  } finally {
    deletingName.value = ''
  }
}
</script>

<template>
  <div
    ref="dialog"
    class="wtm-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="wtm-title"
    tabindex="-1"
    @click.self="emit('close')"
    @keydown.esc="emit('close')"
  >
    <div class="wtm-content">
      <div class="wtm-header">
        <h3 id="wtm-title">WhatsApp templates</h3>
        <button class="wtm-close" aria-label="Close" @click="emit('close')">×</button>
      </div>

      <p class="wtm-intro">
        Templates reopen a conversation after the customer's 24-hour window closes. You write them
        in WhatsApp Manager; once Meta approves one, it appears here and your agents can send it.
      </p>

      <label v-if="accounts.length > 1" class="wtm-field">
        <span class="wtm-label">Number</span>
        <select v-model="accountId" class="wtm-input">
          <option v-for="account in accounts" :key="account.id" :value="account.id">
            {{ account.display_name || account.external_account_id }}
          </option>
        </select>
      </label>

      <div class="wtm-body">
        <div v-if="loading" class="wtm-skeleton" aria-live="polite" aria-busy="true">
          <div v-for="n in 3" :key="n" class="wtm-skeleton-row"></div>
        </div>

        <div v-else-if="loadError" class="wtm-empty">
          <i class="fas fa-circle-exclamation"></i>
          <p>{{ loadError }}</p>
        </div>

        <div v-else-if="templates.length === 0" class="wtm-empty">
          <p>No templates yet.</p>
        </div>

        <ul v-else class="wtm-list">
          <li v-for="template in templates" :key="template.name" class="wtm-row">
            <div class="wtm-row-main">
              <div class="wtm-row-head">
                <span class="wtm-name">{{ template.name }}</span>
                <span v-if="template.status" class="wtm-pill" :class="template.status.toLowerCase()">
                  {{ template.status }}
                </span>
              </div>
              <div class="wtm-row-meta">
                <span v-if="template.category">{{ template.category }}</span>
                <span v-if="template.language">· {{ languageLabel(template.language) }}</span>
              </div>
              <p class="wtm-row-body">{{ templatePreviewText(template) }}</p>
            </div>

            <div class="wtm-row-actions">
              <template v-if="confirmingName === template.name">
                <span class="wtm-confirm-text">Delete?</span>
                <button
                  class="wtm-btn wtm-btn-danger"
                  :disabled="deletingName === template.name"
                  @click="remove(template.name)"
                >
                  {{ deletingName === template.name ? 'Deleting…' : 'Yes' }}
                </button>
                <button class="wtm-btn" @click="confirmingName = ''">No</button>
              </template>
              <button
                v-else
                class="wtm-btn"
                :aria-label="`Delete ${template.name}`"
                @click="confirmingName = template.name"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Meta's Template Library is where these get written: ~150 pre-written,
           pre-localised templates, already shaped to pass its review. -->
      <div v-if="accountId" class="wtm-create-guide">
        <h4 class="wtm-guide-title">Add a template</h4>
        <ol class="wtm-steps">
          <li>Open WhatsApp Manager and go to <strong>Template library</strong>.</li>
          <li>Pick a ready-made template, or choose <strong>Create template</strong> to write one.</li>
          <li>
            Come back and <button type="button" class="wtm-link" @click="refresh">refresh</button>
            once Meta approves it.
          </li>
        </ol>
        <a
          v-if="libraryUrl"
          class="wtm-btn wtm-btn-primary wtm-guide-link"
          :href="libraryUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open WhatsApp Manager
          <i class="fas fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wtm-modal {
  position: fixed;
  inset: 0;
  background: var(--scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.wtm-modal:focus {
  outline: none;
}

.wtm-content {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 12px);
  width: min(620px, 100%);
  max-height: min(760px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow-y: auto;
}

.wtm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.wtm-header h3 {
  margin: 0;
  font-family: var(--font-display);
}

.wtm-close {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--muted);
}

.wtm-intro {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.wtm-body {
  flex: 1;
}

.wtm-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wtm-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
}

.wtm-row-main {
  min-width: 0;
}

.wtm-row-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wtm-name {
  font-weight: 600;
  font-size: 14px;
}

/* Neutral by default: Meta adds statuses over time (PENDING_DELETION, IN_APPEAL,
   FLAGGED, ...) and an unrecognised one must still read as a pill, not vanish. */
.wtm-pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c-neutral) 16%, transparent);
  color: var(--c-neutral);
  border: 1px solid color-mix(in srgb, var(--c-neutral) 35%, transparent);
}

.wtm-pill.approved {
  background: color-mix(in srgb, var(--c-positive) 16%, transparent);
  color: var(--c-positive);
  border-color: color-mix(in srgb, var(--c-positive) 35%, transparent);
}

.wtm-pill.pending {
  background: color-mix(in srgb, var(--c-warn) 16%, transparent);
  color: var(--c-warn);
  border-color: color-mix(in srgb, var(--c-warn) 35%, transparent);
}

/* Rejected, paused and disabled all mean "cannot send" */
.wtm-pill.rejected,
.wtm-pill.paused,
.wtm-pill.disabled {
  background: color-mix(in srgb, var(--c-danger) 16%, transparent);
  color: var(--c-danger);
  border-color: color-mix(in srgb, var(--c-danger) 35%, transparent);
}

.wtm-row-meta {
  font-size: 12px;
  color: var(--muted);
  margin-top: 4px;
}

.wtm-row-body {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  word-break: break-word;
}

.wtm-row-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.wtm-confirm-text {
  font-size: 13px;
  color: var(--muted);
}

.wtm-field {
  display: block;
  margin-bottom: 12px;
}

.wtm-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.wtm-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}

.wtm-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Mirrors .wtm-row, the row it stands in for: a real row is legible because of
   its border, not its fill (--background-soft is #0E0F14 against a #0B0C10
   modal — a contrast ratio of 1.02). Without the border this was rendering
   perfectly and showing nothing, so the modal just looked blank until the
   fetch returned. */
.wtm-skeleton-row {
  height: 64px;
  border-radius: var(--radius-btn, 8px);
  border: 1px solid var(--border-color);
  background: var(--o08);
  animation: wtm-pulse 1.4s ease-in-out infinite;
}

/* Only down to 0.6: at 0.5 the trough fell back below the threshold where the
   row reads as being there at all. */
@keyframes wtm-pulse {
  50% {
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wtm-skeleton-row {
    animation: none;
  }
}

.wtm-empty {
  text-align: center;
  padding: 24px 8px;
  color: var(--muted);
  font-size: 14px;
}

.wtm-empty p {
  margin: 0 0 12px;
}

.wtm-create-guide {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.wtm-guide-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.wtm-steps {
  margin: 0 0 12px;
  padding-left: 20px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
}

/* A button, because it acts on this page — styled as the inline link it reads as */
.wtm-link {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--c-info);
  cursor: pointer;
  text-decoration: underline;
}

.wtm-guide-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.wtm-btn {
  padding: 8px 14px;
  border-radius: var(--radius-btn, 8px);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--background-soft);
  color: inherit;
}

.wtm-btn-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.wtm-btn-danger {
  background: var(--c-danger);
  color: var(--on-accent-solid);
  border-color: transparent;
}

.wtm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
