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
const props = defineProps<{
  modelValue: string | undefined
  swatches: readonly string[]
  // Names the group for screen readers, e.g. "Brand color".
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isPicked = (swatch: string) => props.modelValue?.toUpperCase() === swatch.toUpperCase()
</script>

<template>
  <div class="swatch-row" role="radiogroup" :aria-label="label">
    <button
      v-for="swatch in swatches"
      :key="swatch"
      type="button"
      role="radio"
      class="swatch"
      :class="{ active: isPicked(swatch) }"
      :aria-checked="isPicked(swatch)"
      :aria-label="swatch"
      :title="swatch"
      :style="{ background: swatch, boxShadow: isPicked(swatch) ? `0 0 0 2px ${swatch}` : 'none' }"
      @click="emit('update:modelValue', swatch)"
    ></button>
    <label class="swatch-custom" title="Custom color">
      <input
        type="color"
        :value="modelValue"
        :aria-label="`${label}, custom`"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <span class="swatch-custom-icon" aria-hidden="true">+</span>
    </label>
    <span class="swatch-hex">{{ modelValue }}</span>
  </div>
</template>

<style scoped>
.swatch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.swatch {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: box-shadow var(--transition-fast);
}

.swatch.active {
  border-color: var(--surface);
}

.swatch:focus-visible {
  outline: 2px solid var(--accent-ink);
  outline-offset: 3px;
}

.swatch-custom {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px dashed var(--o12);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.swatch-custom input[type="color"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

.swatch-custom-icon {
  color: var(--muted);
  font-size: 18px;
  line-height: 1;
  pointer-events: none;
}

.swatch-hex {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--muted);
  margin-left: 4px;
}
</style>
