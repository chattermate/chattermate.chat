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
import { onMounted, ref } from 'vue'
import { userService } from '@/services/user'
import { agentService } from '@/services/agent'
import { useOnboardingState, type OnboardingStepIndex } from '@/composables/useOnboardingState'
import type { Agent } from '@/types/agent'
import StepCreate from './steps/StepCreate.vue'
import StepTeach from './steps/StepTeach.vue'
import StepTest from './steps/StepTest.vue'
import StepLaunch from './steps/StepLaunch.vue'

const emit = defineEmits<{
  // user finished the wizard or skipped — parent refreshes agents and renders the list
  (e: 'complete'): void
}>()

const onboarding = useOnboardingState()

const orgId = userService.getCurrentUser()?.organization_id || ''
const steps = ['Create', 'Teach', 'Test', 'Launch']

const currentStep = ref<OnboardingStepIndex>(0)
const agentId = ref<string | null>(null)
const agentName = ref<string>('')
const agentType = ref<string>('customer_support')
const widgetId = ref<string | null>(null)
// The agent created in this run — so returning to Create edits it instead of
// creating a duplicate.
const createdAgent = ref<Agent | null>(null)

onMounted(async () => {
  // Resume an in-progress run if one is stored for this org
  const record = onboarding.get(orgId)
  agentId.value = record.agentId
  agentName.value = record.agentName || ''
  widgetId.value = record.widgetId
  // Can't resume past Create without an agent
  currentStep.value = record.agentId ? record.currentStep : 0
  // Restore the agent so Create can prefill + update on a resumed run
  if (record.agentId) {
    try {
      createdAgent.value = await agentService.getAgentById(record.agentId)
      agentType.value = createdAgent.value?.agent_type || agentType.value
    } catch (err) {
      // The stored agent no longer exists (e.g. deleted) — start the run fresh
      // instead of leaving later steps pointing at a dead agent id.
      console.error('Failed to load onboarding agent, restarting:', err)
      createdAgent.value = null
      agentId.value = null
      currentStep.value = 0
      onboarding.patch(orgId, { agentId: null, widgetId: null, currentStep: 0, completedSteps: [] })
    }
  }
})

const goTo = (step: OnboardingStepIndex) => {
  currentStep.value = step
  onboarding.goTo(orgId, step)
}

const handleCreated = (agent: Agent) => {
  createdAgent.value = agent
  agentId.value = agent.id
  agentName.value = agent.display_name || agent.name
  agentType.value = agent.agent_type
  onboarding.patch(orgId, {
    agentId: agent.id,
    agentName: agentName.value,
    currentStep: 1,
    completedSteps: [0],
  })
  currentStep.value = 1
}

const handleWidgetCreated = (id: string) => {
  widgetId.value = id
  onboarding.patch(orgId, { widgetId: id })
}

const completeAndAdvance = (step: OnboardingStepIndex, next: OnboardingStepIndex) => {
  onboarding.completeStep(orgId, step, next)
  currentStep.value = next
}

const handleSkip = () => {
  onboarding.skip(orgId)
  emit('complete')
}

const handleFinish = () => {
  onboarding.completeStep(orgId, 3)
  emit('complete')
}
</script>

<template>
  <div class="onboarding">
    <header class="onb-header">
      <h1 class="onb-title">Let's get your first agent live</h1>
      <p class="onb-sub">Four quick steps. No code, no model setup — we'll handle the AI.</p>
    </header>

    <!-- Stepper -->
    <ol class="stepper" aria-label="Setup progress">
      <li
        v-for="(label, i) in steps"
        :key="label"
        class="stepper-item"
        :class="{
          active: currentStep === i,
          done: currentStep > i,
        }"
      >
        <span class="stepper-dot">
          <template v-if="currentStep > i">✓</template>
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="stepper-label">{{ label }}</span>
        <span v-if="i < steps.length - 1" class="stepper-line" aria-hidden="true"></span>
      </li>
    </ol>

    <!-- Active step -->
    <div class="onb-card">
      <StepCreate
        v-if="currentStep === 0"
        :key="createdAgent ? createdAgent.id : 'new'"
        :existing-agent="createdAgent"
        @created="handleCreated"
        @skip="handleSkip"
      />
      <StepTeach
        v-else-if="currentStep === 1 && agentId"
        :agent-id="agentId"
        :organization-id="orgId"
        @next="completeAndAdvance(1, 2)"
        @back="goTo(0)"
      />
      <StepTest
        v-else-if="currentStep === 2 && agentId"
        :agent-id="agentId"
        :agent-name="agentName"
        :widget-id="widgetId"
        @widget-created="handleWidgetCreated"
        @next="completeAndAdvance(2, 3)"
        @back="goTo(1)"
      />
      <StepLaunch
        v-else-if="currentStep === 3"
        :widget-id="widgetId"
        :agent-type="agentType"
        @finish="handleFinish"
        @back="goTo(2)"
      />
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  max-width: 920px;
  margin: 0 auto;
  padding: 8px 0 40px;
}

.onb-header {
  text-align: center;
  margin-bottom: 30px;
}

.onb-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  letter-spacing: -0.03em;
  margin: 0 0 8px;
  color: var(--text);
}

.onb-sub {
  font-size: 16px;
  color: var(--muted);
  margin: 0;
}

.stepper {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 34px;
  padding: 0;
}

.stepper-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.stepper-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1.5px solid var(--o14);
  background: var(--surface);
  color: var(--muted2);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
  transition: var(--transition-fast);
}

.stepper-item.active .stepper-dot {
  background: var(--accent-solid);
  border-color: var(--accent-ink);
  color: var(--on-accent-solid);
}

.stepper-item.done .stepper-dot {
  background: var(--accent-bg-12);
  border-color: var(--accent-border);
  color: var(--accent-ink);
}

.stepper-label {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
}

.stepper-item.active .stepper-label {
  color: var(--text);
}

.stepper-line {
  flex: 1;
  height: 1px;
  background: var(--o12);
  margin: 0 4px;
}

.onb-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: var(--radius-card);
  padding: 34px;
}

@media (max-width: 640px) {
  .stepper-label {
    display: none;
  }
}
</style>
