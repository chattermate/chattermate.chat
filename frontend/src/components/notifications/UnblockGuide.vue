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

<script setup lang="ts" name="UnblockGuide">
import BaseModal from '@/components/common/BaseModal.vue'
import type { BrowserKind } from '@/utils/browserKind'
import UnblockStepPicture from './UnblockStepPicture.vue'
import { UNBLOCK_GUIDES } from './unblockSteps'

/** Step by step, with pictures: unblocking notifications in this browser. */
const props = defineProps<{ browser: BrowserKind }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const guide = UNBLOCK_GUIDES[props.browser]
const reload = () => window.location.reload()
</script>

<template>
  <Teleport to="body">
    <BaseModal class="ug-modal" title="Turn notifications back on" width="460px" @close="emit('close')">
      <p class="ug-intro">In {{ guide.browser }}:</p>
      <ol class="ug-steps">
        <li v-for="(step, index) in guide.steps" :key="index" class="ug-step">
          <div class="ug-step-text">
            <span class="ug-num" aria-hidden="true">{{ index + 1 }}</span>
            <span>{{ step.text }}</span>
          </div>
          <UnblockStepPicture :picture="step.picture" />
        </li>
      </ol>

      <template #actions>
        <button type="button" class="ug-secondary" @click="emit('close')">Done</button>
        <button v-if="browser !== 'ios-app'" type="button" class="ug-primary" data-autofocus @click="reload">
          Reload page
        </button>
      </template>
    </BaseModal>
  </Teleport>
</template>

<style scoped>
/* Opened from the notification drawer too, which sits at the modal layer */
.ug-modal {
  z-index: 1100;
}

.ug-intro {
  margin: 0 0 12px;
  font-size: 13.5px;
  color: var(--text2);
}

.ug-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ug-step {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ug-step-text {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 1.4;
  color: var(--text);
}

.ug-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  font-size: 12px;
  font-weight: 600;
}

.ug-primary,
.ug-secondary {
  padding: 8px 14px;
  border-radius: var(--radius-btn);
  font-size: 13.5px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
}

.ug-primary {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
}

.ug-secondary {
  background: none;
  color: var(--text);
  border: 1px solid var(--border-color);
}
</style>
