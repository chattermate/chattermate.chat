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
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { HelpCenterSettings, HelpCenterSettingsUpdate } from '@/types/faq'
import type { SaveState } from '@/composables/useHelpCenterSettings'
import HelpCenterLogoField from './HelpCenterLogoField.vue'
import HelpCenterPreview from './HelpCenterPreview.vue'

const props = defineProps<{
  settings: HelpCenterSettings
  saveState: SaveState
}>()

const emit = defineEmits<{
  update: [payload: HelpCenterSettingsUpdate]
  'save-now': [payload: HelpCenterSettingsUpdate]
  'upload-logo': [file: File]
  'remove-logo': []
}>()

const BRAND_SWATCHES = ['#4338CA', '#0E8C8C', '#CF5B38', '#6D5BD0', '#1F8A5B', '#2A6FDB']

// Custom brand color: native picker + hex field, both saving immediately.
const isPreset = computed(() =>
  BRAND_SWATCHES.some((c) => c.toLowerCase() === (props.settings.brand_color || '').toLowerCase()),
)

const hexDraft = ref(props.settings.brand_color)
watch(() => props.settings.brand_color, (v) => { hexDraft.value = v })

function saveColor(value: string) {
  if (value.toLowerCase() !== (props.settings.brand_color || '').toLowerCase()) {
    emit('save-now', { brand_color: value })
  }
}

function onPicker(event: Event) {
  saveColor((event.target as HTMLInputElement).value.toUpperCase())
}

function commitHex() {
  const raw = hexDraft.value.trim()
  const body = raw.replace(/^#/, '')
  // Accept 3, 6 or 8 hex digits (matches the backend validator).
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(body)) {
    toast.error('Enter a hex color like #4338CA')
    hexDraft.value = props.settings.brand_color
    return
  }
  const hex = `#${body.toUpperCase()}`
  hexDraft.value = hex
  saveColor(hex)
}

const saveStateLabel = computed(() => {
  if (props.saveState === 'saving') return 'Saving…'
  if (props.saveState === 'saved') return 'Saved'
  if (props.saveState === 'error') return "Couldn't save — edit again to retry"
  return ''
})

/** Text fields: mutate in place for instant feedback, emit for debounced save. */
function onText(field: 'cta_text' | 'cta_url', event: Event) {
  const value = (event.target as HTMLInputElement).value
  props.settings[field] = value
  emit('update', { [field]: value })
}

// Header link rows are mutated in place — the settings engine deep-watches
// header_links and debounce-saves.
function addLink() {
  props.settings.header_links.push({ label: 'New link', url: '' })
}

function removeLink(index: number) {
  props.settings.header_links.splice(index, 1)
}
</script>

<template>
  <section class="appearance">
    <div class="section-head">
      <h2 class="section-head__title">Help center appearance</h2>
      <span class="section-head__sub">logo, color &amp; header links</span>
      <span v-if="saveStateLabel" class="section-head__save" :class="`is-${saveState}`">{{ saveStateLabel }}</span>
    </div>

    <div class="appearance__card">
      <!-- controls -->
      <div class="controls">
        <div>
          <label class="mono-label">LOGO</label>
          <HelpCenterLogoField
            :logo-url="settings.logo_url"
            @upload="$emit('upload-logo', $event)"
            @remove="$emit('remove-logo')"
          />
        </div>

        <div>
          <label class="mono-label">BRAND COLOR</label>
          <div class="swatches">
            <button
              v-for="color in BRAND_SWATCHES"
              :key="color"
              class="swatch"
              :class="{ 'swatch--selected': settings.brand_color.toLowerCase() === color.toLowerCase() }"
              :style="{ background: color, boxShadow: settings.brand_color.toLowerCase() === color.toLowerCase() ? `0 0 0 2px ${color}` : 'none' }"
              type="button"
              :title="color"
              @click="$emit('save-now', { brand_color: color })"
            ></button>

            <!-- Custom color: swatch opens the OS picker; shows current color when off-preset. -->
            <label
              class="swatch swatch--custom"
              :class="{ 'swatch--selected': !isPreset }"
              :style="!isPreset ? { background: settings.brand_color, boxShadow: `0 0 0 2px ${settings.brand_color}` } : {}"
              title="Custom color"
            >
              <input type="color" class="swatch__picker" :value="settings.brand_color" @change="onPicker" />
              <svg v-if="isPreset" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            </label>
          </div>

          <div class="hex-field">
            <span class="hex-field__hash">#</span>
            <input
              :value="hexDraft.replace(/^#/, '')"
              maxlength="8"
              spellcheck="false"
              placeholder="4338CA"
              aria-label="Brand color hex code"
              @input="hexDraft = ($event.target as HTMLInputElement).value"
              @keydown.enter="commitHex"
              @blur="commitHex"
            />
          </div>

          <p class="hint">Recolors buttons, links, search and highlights across your help center.</p>
        </div>

        <div>
          <label class="mono-label">HEADER LINKS</label>
          <p class="hint hint--tight">Links shown in your help center header — point them back to your website.</p>
          <div class="link-rows">
            <div v-for="(link, index) in settings.header_links" :key="index" class="link-row">
              <input v-model="link.label" class="text-input text-input--label" type="text" placeholder="Label" />
              <div class="url-input">
                <span class="url-input__prefix">https://</span>
                <input v-model="link.url" type="text" placeholder="yoursite.com" />
              </div>
              <button class="remove-btn" type="button" title="Remove" @click="removeLink(index)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <button class="add-link" type="button" @click="addLink">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add link
          </button>

          <div class="divider"></div>

          <div class="row-head">
            <label class="mono-label mono-label--inline">PRIMARY BUTTON</label>
            <label class="switch switch--sm">
              <input type="checkbox" :checked="settings.cta_enabled" @change="$emit('save-now', { cta_enabled: ($event.target as HTMLInputElement).checked })" />
              <span class="switch__track"><span class="switch__knob"></span></span>
            </label>
          </div>
          <div class="link-row" :class="{ 'link-row--off': !settings.cta_enabled }">
            <input class="text-input text-input--label" type="text" placeholder="Label" :disabled="!settings.cta_enabled" :value="settings.cta_text || ''" @input="onText('cta_text', $event)" />
            <div class="url-input">
              <span class="url-input__prefix">https://</span>
              <input type="text" placeholder="app.yoursite.com" :disabled="!settings.cta_enabled" :value="settings.cta_url || ''" @input="onText('cta_url', $event)" />
            </div>
          </div>
        </div>
      </div>

      <!-- live preview -->
      <div class="preview-col">
        <label class="mono-label">LIVE PREVIEW</label>
        <HelpCenterPreview :settings="settings" />
        <p class="preview-note">
          Changes apply instantly to your published help center at
          <span class="preview-note__url">{{ settings.live_url }}</span>.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.section-head__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 19px;
  letter-spacing: -0.01em;
  color: var(--text);
  margin: 0;
}

.section-head__sub,
.section-head__save {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted2);
}

.section-head__save {
  margin-left: auto;
}

.section-head__save.is-saved {
  color: var(--c-teal);
}

.section-head__save.is-error {
  color: var(--c-coral);
}

.appearance__card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: 22px;
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 26px;
  align-items: start;
}

@media (max-width: 900px) {
  .appearance__card {
    grid-template-columns: 1fr;
  }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.mono-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted2);
  margin-bottom: 10px;
}

.swatches {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.swatch {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  padding: 0;
  border: 2px solid transparent;
}

.swatch--selected {
  border-color: var(--text);
}

.swatch--custom {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: var(--o05);
  border: 2px dashed var(--o25);
  color: var(--muted);
}

.swatch--custom.swatch--selected {
  border-style: solid;
  color: #fff;
}

/* The native color input fills the swatch but stays invisible — the label is
   the visible control and clicking anywhere opens the OS picker. */
.swatch__picker {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: none;
  padding: 0;
  cursor: pointer;
}

.hex-field {
  display: inline-flex;
  align-items: center;
  margin-top: 12px;
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: 9px;
  padding: 0 11px;
  font-family: var(--font-mono);
}

.hex-field__hash {
  color: var(--faint);
  font-size: 13px;
}

.hex-field input {
  width: 84px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 13px;
  text-transform: uppercase;
  padding: 9px 2px 9px 4px;
}

.hint {
  font-size: 12.5px;
  color: var(--muted);
  margin: 11px 0 0;
  line-height: 1.5;
}

.hint--tight {
  margin: 0 0 12px;
}

.link-rows {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 12px;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-input {
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: 9px;
  padding: 9px 11px;
  font-size: 13px;
  font-family: var(--font-sans);
  color: var(--text);
  outline: none;
}

.text-input--label {
  width: 112px;
  flex-shrink: 0;
}

.url-input {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  background: var(--bg);
  border: 1px solid var(--o10);
  border-radius: 9px;
  padding: 0 11px;
  font-family: var(--font-mono);
}

.url-input__prefix {
  color: var(--faint);
  font-size: 12.5px;
}

.url-input input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 12.5px;
  padding: 9px 3px;
  font-family: var(--font-mono);
}

.remove-btn {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: var(--coral-bg);
  color: var(--c-coral);
  border-color: var(--coral-border);
}

.add-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  background: var(--o05);
  border: 1px dashed var(--o16);
  border-radius: 9px;
  color: var(--text2);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.add-link:hover {
  background: var(--o08);
  border-color: var(--o25);
}

.divider {
  height: 1px;
  background: var(--o07);
  margin: 18px 0;
}

.row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.mono-label--inline {
  margin-bottom: 0;
}

.link-row--off {
  opacity: 0.5;
}

.link-row--off .text-input,
.link-row--off .url-input {
  cursor: not-allowed;
}

/* Toggle switch (scoped copy of the shared switch styling). */
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch__track {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: var(--radius-pill);
  background: var(--o12);
  transition: background 0.18s ease;
}

.switch__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s ease;
}

.switch input:checked + .switch__track {
  background: var(--c-teal);
}

.switch input:checked + .switch__track .switch__knob {
  transform: translateX(16px);
}

.switch--sm .switch__track {
  width: 34px;
  height: 20px;
}

.switch--sm .switch__knob {
  width: 14px;
  height: 14px;
}

.switch--sm input:checked + .switch__track .switch__knob {
  transform: translateX(14px);
}

.preview-col {
  min-width: 0;
}

.preview-note {
  font-size: 12px;
  color: var(--muted2);
  margin: 11px 0 0;
  line-height: 1.5;
}

.preview-note__url {
  font-family: var(--font-mono);
  color: var(--text3);
}
</style>
