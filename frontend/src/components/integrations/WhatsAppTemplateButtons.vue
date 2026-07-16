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
import { computed } from 'vue'
import {
  BUTTON_TYPES,
  LIMITS,
  buttonNeedsValue,
  groupButtons,
  newButton,
  type DraftButton,
  type DraftButtonType,
} from '@/utils/whatsappTemplateDraft'

const buttons = defineModel<DraftButton[]>({ required: true })

const atLimit = computed(() => buttons.value.length >= LIMITS.totalButtons)

const valueLabel = (type: DraftButtonType) =>
  BUTTON_TYPES.find((option) => option.value === type)?.valueLabel ?? ''

const valuePlaceholder = (type: DraftButtonType) =>
  type === 'URL' ? 'https://example.com/orders' : '+15550001111'

const add = () => {
  if (atLimit.value) return
  buttons.value = groupButtons([...buttons.value, newButton()])
}

/**
 * Regroup as soon as a type changes. Meta needs same-type buttons consecutive,
 * so grouping only at submit would leave this list showing an order the
 * customer never sees — in a template that is then approved that way.
 */
const onTypeChange = () => {
  buttons.value = groupButtons(buttons.value)
}

const remove = (index: number) => {
  buttons.value = buttons.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="wtb-root">
    <ul v-if="buttons.length" class="wtb-list">
      <li v-for="(button, index) in buttons" :key="index" class="wtb-row">
        <div class="wtb-fields">
          <select
            v-model="button.type"
            class="wtm-input wtb-type"
            aria-label="Button type"
            @change="onTypeChange"
          >
            <option v-for="option in BUTTON_TYPES" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <input
            v-model="button.text"
            class="wtm-input"
            :maxlength="LIMITS.buttonText"
            placeholder="Button label"
            :aria-label="`Button ${index + 1} label`"
          />

          <input
            v-if="buttonNeedsValue(button.type)"
            v-model="button.value"
            class="wtm-input"
            :placeholder="valuePlaceholder(button.type)"
            :aria-label="`Button ${index + 1} ${valueLabel(button.type)}`"
          />
        </div>

        <button
          type="button"
          class="wtb-remove"
          :aria-label="`Remove button ${index + 1}`"
          @click="remove(index)"
        >
          ×
        </button>
      </li>
    </ul>

    <button type="button" class="wtm-btn wtb-add" :disabled="atLimit" @click="add">
      + Add button
    </button>
    <span class="wtm-hint">
      {{
        atLimit
          ? `That's the maximum of ${LIMITS.totalButtons} buttons.`
          : 'Optional. WhatsApp shows the first two and hides the rest behind “See all options”.'
      }}
    </span>
  </div>
</template>

<style scoped>
.wtb-root {
  display: block;
}

.wtb-list {
  list-style: none;
  margin: 0 0 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wtb-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.wtb-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.wtb-fields > * {
  flex: 1 1 140px;
  min-width: 0;
}

.wtb-type {
  flex: 0 0 auto;
}

.wtb-remove {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 18px;
  line-height: 1;
  padding: 8px 4px;
  cursor: pointer;
}

.wtb-remove:hover {
  color: var(--c-danger);
}

.wtb-add {
  margin-bottom: 4px;
}

/* Mirrors the form's field styling — scoped styles can't cross the boundary */
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

.wtm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wtm-hint {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  color: var(--muted);
}
</style>
