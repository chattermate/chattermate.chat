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
 * A textarea for prompt text an AI reads, rather than a label a human reads.
 * Monospace because the content is index globs and field names, and it ships
 * a worked example behind a disclosure — a placeholder vanishes on the first
 * keystroke, which is exactly when the operator still needs the shape.
 */
import { computed, ref } from 'vue'
import { MAX_GUIDANCE_CHARS } from '@/utils/mcp'

const props = withDefaults(
  defineProps<{
    // Nullable: the API returns null for a connector nobody has documented,
    // and callers bind that straight through.
    modelValue: string | null | undefined
    label: string
    hint: string
    placeholder?: string
    example?: string
    rows?: number
    maxlength?: number
  }>(),
  { placeholder: '', example: '', rows: 6, maxlength: MAX_GUIDANCE_CHARS },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const showExample = ref(false)
const text = computed(() => props.modelValue ?? '')
const isNearLimit = computed(() => text.value.length > props.maxlength * 0.9)
</script>

<template>
  <div class="guidance">
    <span class="guidance-label">{{ label }}</span>
    <p class="guidance-hint">{{ hint }}</p>
    <textarea
      class="guidance-input"
      :value="text"
      :aria-label="label"
      :rows="rows"
      :maxlength="maxlength"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <div class="guidance-foot">
      <button v-if="example" type="button" class="example-toggle" @click="showExample = !showExample">
        <font-awesome-icon :icon="['fas', showExample ? 'chevron-up' : 'chevron-down']" />
        {{ showExample ? 'Hide example' : 'See an example' }}
      </button>
      <span v-else></span>
      <span class="guidance-count mono" :class="{ near: isNearLimit }">
        {{ text.length }} / {{ maxlength }}
      </span>
    </div>
    <div v-if="example && showExample" class="guidance-example">
      <pre class="example-text mono">{{ example }}</pre>
      <!-- Offered only while the field is empty, so it can never overwrite
           something the operator actually wrote. -->
      <button
        v-if="!text.length"
        type="button"
        class="example-use"
        @click="emit('update:modelValue', example)"
      >
        Use as a starting point
      </button>
    </div>
  </div>
</template>

<style scoped>
.guidance {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.guidance-label {
  font-size: 11px;
  color: var(--faint);
}
.guidance-hint {
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}
.guidance-input {
  padding: 9px 11px;
  min-height: 130px;
  background: var(--bg2);
  border: 1px solid var(--o10);
  border-radius: 9px;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.55;
  outline: none;
  resize: vertical;
}
.guidance-input:focus {
  border-color: var(--accent-ink);
}
.guidance-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.example-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 11.5px;
  cursor: pointer;
}
.example-toggle:hover {
  color: var(--text);
}
.guidance-count {
  font-size: 10.5px;
  color: var(--muted2);
}
.guidance-count.near {
  color: var(--c-warn);
}
.guidance-example {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 11px 13px;
  background: var(--surface);
  border: 1px solid var(--o07);
  border-radius: 9px;
}
.example-text {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--text3);
  white-space: pre-wrap;
  overflow-x: auto;
  max-width: 100%;
}
.example-use {
  padding: 5px 11px;
  background: var(--o05);
  border: 1px solid var(--o10);
  border-radius: 8px;
  color: var(--muted);
  font-size: 11.5px;
  cursor: pointer;
}
.example-use:hover {
  color: var(--text);
}
.mono {
  font-family: var(--font-mono);
}
</style>
