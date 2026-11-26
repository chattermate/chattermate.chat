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
import { nextTick, ref } from 'vue'

defineProps<{ name: string; disabled?: boolean }>()
const emit = defineEmits<{ (e: 'remove'): void }>()

// Removing deletes what was learned, so it is asked once more.
const confirming = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const keepButton = ref<HTMLButtonElement | null>(null)

const ask = async () => {
  confirming.value = true
  await nextTick()
  keepButton.value?.focus()
}

const keep = async () => {
  confirming.value = false
  await nextTick()
  trigger.value?.focus()
}

const confirm = () => {
  confirming.value = false
  emit('remove')
}
</script>

<template>
  <span v-if="confirming" class="confirm" role="group" :aria-label="`Remove ${name}?`" @keydown.esc="keep">
    <span class="question" aria-hidden="true">Remove?</span>
    <button type="button" class="choice danger" :disabled="disabled" @click="confirm">Remove</button>
    <button ref="keepButton" type="button" class="choice" @click="keep">Keep</button>
  </span>
  <button v-else ref="trigger" type="button" class="source-remove" :disabled="disabled" :aria-label="`Remove ${name}`" @click="ask">
    <font-awesome-icon icon="fa-solid fa-xmark" aria-hidden="true" />
  </button>
</template>

<style scoped src="./step-controls.css"></style>
<style scoped>
.confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.question {
  font-size: 12px;
  color: var(--muted);
}

.choice {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 8px;
}

.choice.danger {
  color: var(--error-color);
}
</style>
