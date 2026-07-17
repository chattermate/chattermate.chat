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

<!--
  Facebook Login for Business can grant several Pages at once, so the customer
  chooses which one this channel answers. WhatsApp Embedded Signup never needs
  this — it creates the single number itself.
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { MessengerSignupPage } from '@/services/channels'

defineProps<{
  pages: MessengerSignupPage[]
  connecting: boolean
}>()

const emit = defineEmits<{
  (e: 'select', pageId: string): void
}>()

// Which row is being connected, so only it shows a spinner (and the rest lock).
const pendingId = ref('')

const choose = (pageId: string) => {
  pendingId.value = pageId
  emit('select', pageId)
}
</script>

<template>
  <div class="picker">
    <p class="picker-intro">Choose the Facebook Page to connect:</p>
    <ul class="picker-list">
      <li v-for="page in pages" :key="page.id">
        <button
          type="button"
          class="picker-row"
          :disabled="connecting"
          @click="choose(page.id)"
        >
          <span class="picker-name">{{ page.name }}</span>
          <font-awesome-icon
            v-if="connecting && pendingId === page.id"
            icon="fa-solid fa-spinner"
            spin
          />
          <font-awesome-icon v-else icon="fa-solid fa-chevron-right" class="picker-chevron" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.picker-intro {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.picker-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-btn, 8px);
  background: var(--background-soft);
  color: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.picker-row:hover:not(:disabled) {
  border-color: var(--accent-solid);
}

.picker-row:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.picker-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-chevron {
  color: var(--muted);
  flex-shrink: 0;
}
</style>
