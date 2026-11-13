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
/** The inbox's keyboard shortcuts, opened with "?". */
import BaseModal from '@/components/common/BaseModal.vue'
import { INBOX_SHORTCUTS } from '@/composables/useInboxShortcuts'

defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <BaseModal title="Keyboard shortcuts" width="380px" @close="$emit('close')">
    <dl class="shortcuts">
      <div v-for="shortcut in INBOX_SHORTCUTS" :key="shortcut.keys" class="shortcut">
        <dt><kbd>{{ shortcut.keys }}</kbd></dt>
        <dd>{{ shortcut.action }}</dd>
      </div>
    </dl>
    <p class="note">They work whenever you aren't typing in a box.</p>
  </BaseModal>
</template>

<style scoped>
.shortcuts {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shortcut dt {
  flex: 0 0 44px;
}

.shortcut dd {
  margin: 0;
  font-size: 14px;
  color: var(--text2);
}

kbd {
  display: inline-block;
  min-width: 24px;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid var(--o12);
  background: var(--o05);
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
  color: var(--text);
}

.note {
  margin: 16px 0 0;
  font-size: 12px;
  color: var(--muted);
}
</style>
