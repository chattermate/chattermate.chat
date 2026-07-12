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
import { computed, ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FaqProLockOverlay from '@/components/faq/FaqProLockOverlay.vue'
import FaqWorkspace from '@/components/faq/FaqWorkspace.vue'
import { userService } from '@/services/user'

const organizationId = computed(() => userService.getCurrentUser()?.organization_id ?? '')

const planAllowed = ref<boolean | null>(null)
const workspaceRef = ref<InstanceType<typeof FaqWorkspace> | null>(null)

const liveUrl = computed(() => workspaceRef.value?.settings?.live_url || null)
</script>

<template>
  <DashboardLayout>
    <div class="faq-view">
      <div class="page-header">
        <div>
          <h1 class="page-header__title">FAQ &amp; Help Center</h1>
          <p class="page-header__subtitle">
            Turn your knowledge base into a public help center. Generate FAQs automatically, review
            them, then publish.
          </p>
        </div>
        <a v-if="liveUrl" class="page-header__link" :href="liveUrl" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" /></svg>
          View public FAQ
        </a>
      </div>

      <FaqProLockOverlay :plan-allowed="planAllowed">
        <FaqWorkspace
          v-if="organizationId"
          ref="workspaceRef"
          :organization-id="organizationId"
          @plan-allowed="planAllowed = $event"
        />
      </FaqProLockOverlay>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.faq-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.page-header__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 8px;
}

.page-header__subtitle {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
  max-width: 560px;
  line-height: 1.55;
}

.page-header__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 17px;
  background: var(--o05);
  border: 1px solid var(--o14);
  border-radius: 11px;
  color: var(--text2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.page-header__link:hover {
  background: var(--o08);
}
</style>
