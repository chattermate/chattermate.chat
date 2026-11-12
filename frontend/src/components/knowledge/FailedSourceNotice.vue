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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFailedSource } from '@/composables/useFailedSource'
import { permissionChecks } from '@/utils/permissions'

const router = useRouter()
const { failure, refresh, dismiss } = useFailedSource()
// Every page mounts its own layout, so each one looks afresh: a crawl may have failed since.
onMounted(() => {
  if (permissionChecks.canManageKnowledge()) refresh()
})

const addSource = () => router.push({ name: 'knowledge' })
</script>

<template>
  <div v-if="failure" class="failed-source" role="status">
    <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="failed-icon" aria-hidden="true" />
    <p class="failed-text">
      <strong>We couldn't read {{ failure.source }}.</strong>
      {{ failure.reason }}
      Your agent hasn't learned anything about your business yet, so its answers will be generic.
    </p>
    <div class="failed-actions">
      <button type="button" class="failed-dismiss" @click="dismiss">Dismiss</button>
      <button type="button" class="failed-cta" @click="addSource">Paste text or upload a PDF</button>
    </div>
  </div>
</template>

<style scoped>
.failed-source {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 18px;
}

.failed-icon {
  color: var(--warning);
  flex-shrink: 0;
}

.failed-text {
  flex: 1;
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(--text);
  overflow-wrap: anywhere;
}

.failed-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.failed-dismiss {
  background: none;
  border: none;
  color: var(--muted2);
  font-size: 13.5px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.failed-dismiss:hover {
  color: var(--text3);
}

.failed-cta {
  padding: 9px 16px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

@media (max-width: 640px) {
  .failed-source {
    flex-direction: column;
    align-items: stretch;
  }

  .failed-actions {
    justify-content: flex-end;
  }
}
</style>
