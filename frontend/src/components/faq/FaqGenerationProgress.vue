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
import type { FaqGenerationJob, FaqJobStage } from '@/types/faq'
import FaqOrb from './FaqOrb.vue'

const props = defineProps<{ job: FaqGenerationJob }>()

const STAGE_ORDER: FaqJobStage[] = ['analyzing_sources', 'extracting', 'drafting', 'grouping']
const STAGE_LABELS = [
  'Analyzing your sources',
  'Extracting questions from your content',
  'Drafting grounded answers',
  'Grouping by topic',
]

const steps = computed(() => {
  const stage = props.job.stage
  // Before the first stage report, the first step is active; when the job
  // finishes, everything is done.
  const activeIndex = stage === 'completed' ? STAGE_ORDER.length : Math.max(0, STAGE_ORDER.indexOf(stage))
  return STAGE_LABELS.map((label, index) => ({
    label,
    state: index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'todo',
  }))
})
</script>

<template>
  <div class="progress-card">
    <div class="progress-card__head">
      <FaqOrb :size="48" />
      <div>
        <div class="progress-card__title">Reading your knowledge base…</div>
        <div class="progress-card__note">
          This usually takes under a minute. You can leave this page — we'll keep working.
        </div>
      </div>
    </div>
    <div class="progress-track">
      <div class="progress-track__sweep"></div>
    </div>
    <div class="steps">
      <div v-for="step in steps" :key="step.label" class="step" :class="step.state">
        <span class="step__icon">
          <svg v-if="step.state === 'done'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--on-accent-solid)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10" /></svg>
          <span v-else-if="step.state === 'active'" class="step__spinner"></span>
          <span v-else class="step__dot"></span>
        </span>
        <span class="step__label">{{ step.label }}</span>
        <span v-if="step.state === 'active'" class="step__pulse">
          <span></span><span></span><span></span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 16px;
  padding: 40px 32px;
}

.progress-card__head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}

.progress-card__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
  color: var(--text);
}

.progress-card__note {
  font-size: 13.5px;
  color: var(--muted);
  margin-top: 3px;
}

.progress-track {
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--o08);
  overflow: hidden;
  margin-bottom: 26px;
  position: relative;
}

.progress-track__sweep {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 38%;
  border-radius: var(--radius-pill);
  background: var(--grad-generate);
  animation: faq-progress 1.5s ease-in-out infinite;
}

@keyframes faq-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(320%); }
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.step {
  display: flex;
  align-items: center;
  gap: 13px;
}

.step__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step.done .step__icon {
  background: var(--accent-solid);
}

.step__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--c-purple);
  border-top-color: transparent;
  animation: faq-spin 0.8s linear infinite;
}

@keyframes faq-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.step__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--faint);
}

.step__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
}

.step.todo .step__label {
  color: var(--muted2);
}

.step__pulse {
  display: inline-flex;
  gap: 3px;
  margin-left: 2px;
}

.step__pulse span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--c-purple);
  animation: faq-pulse 1s ease-in-out infinite;
}

.step__pulse span:nth-child(2) { animation-delay: 0.2s; }
.step__pulse span:nth-child(3) { animation-delay: 0.4s; }

@keyframes faq-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
</style>
