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
import { ref, defineAsyncComponent } from 'vue'
import { AxiosError } from 'axios'
import { aiService } from '@/services/ai'
import { agentService } from '@/services/agent'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import type { Agent } from '@/types/agent'

// Lazy-load the provider setup form — only needed on OSS builds without ChatterMate AI
const AISetup = defineAsyncComponent(() => import('@/components/ai/AISetup.vue'))

const { hasEnterpriseModule } = useEnterpriseFeatures()

// Bundled preset avatars (frontend/src/assets/avatars/avatar-*.png)
const avatarModules = import.meta.glob('@/assets/avatars/avatar-*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const presetAvatars = Object.keys(avatarModules).sort().map((k) => avatarModules[k])

// When set, Create edits this agent (returning to the step) instead of
// creating a new one — avoids duplicate agents / plan-limit errors.
const props = defineProps<{
  existingAgent?: Agent | null
}>()

const emit = defineEmits<{
  (e: 'created', agent: Agent): void
  (e: 'skip'): void
}>()

const agentTypes = [
  { value: 'customer_support', label: 'Customer support' },
  { value: 'sales', label: 'Sales' },
  { value: 'tech_support', label: 'Tech support' },
  { value: 'general', label: 'General' },
] as const

// Sensible starter instructions per agent type — prefilled so setup is quick
const TYPE_DEFAULTS: Record<string, string> = {
  customer_support: 'Be concise, friendly, and empathetic. Answer questions using the knowledge base. Escalate billing or account issues to a human agent.',
  sales: 'Be enthusiastic and helpful. Highlight product benefits, answer pricing questions, and guide visitors toward booking a demo or starting a trial. Capture lead details when it feels natural.',
  tech_support: 'Be clear and patient. Help users troubleshoot step by step using the documentation. Ask for error messages or screenshots when needed, and escalate unresolved issues to a human.',
  general: 'Be helpful, concise, and friendly. Answer questions accurately using the knowledge base, and hand off to a human when a request needs personal attention.',
}
const DEFAULT_VALUES = Object.values(TYPE_DEFAULTS)

// Prefill from the existing agent when returning to this step
const existingInstructions = Array.isArray(props.existingAgent?.instructions)
  ? props.existingAgent!.instructions.join('\n')
  : ''

const agentName = ref(props.existingAgent?.display_name || props.existingAgent?.name || '')
const selectedType = ref<string>(props.existingAgent?.agent_type || 'customer_support')
const instructions = ref<string>(existingInstructions || TYPE_DEFAULTS[selectedType.value] || '')

const isSubmitting = ref(false)
const isGenerating = ref(false)
const error = ref('')

// Avatar: a chosen preset URL, or a custom uploaded file.
// For an existing agent, start with nothing selected so we keep its current
// photo unless the user actually picks a new one.
const selectedAvatar = ref<string | null>(props.existingAgent ? null : (presetAvatars[0] ?? null))
const customAvatarFile = ref<File | null>(null)
const customAvatarPreview = ref<string | null>(null)
const avatarFileInput = ref<HTMLInputElement | null>(null)
const avatarTouched = ref(false)

const selectPreset = (url: string) => {
  selectedAvatar.value = url
  avatarTouched.value = true
  customAvatarFile.value = null
  if (customAvatarPreview.value) {
    URL.revokeObjectURL(customAvatarPreview.value)
    customAvatarPreview.value = null
  }
}

const triggerAvatarUpload = () => avatarFileInput.value?.click()

const onAvatarFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  customAvatarFile.value = file
  avatarTouched.value = true
  if (customAvatarPreview.value) URL.revokeObjectURL(customAvatarPreview.value)
  customAvatarPreview.value = URL.createObjectURL(file)
  selectedAvatar.value = null
}

// Apply the chosen avatar to the freshly-created agent via the photo endpoint.
// Presets are bundled assets, so fetch them into a File first. Non-fatal.
const applyAvatar = async (agentId: string) => {
  try {
    let file: File | null = customAvatarFile.value
    if (!file && selectedAvatar.value) {
      const res = await fetch(selectedAvatar.value)
      const blob = await res.blob()
      file = new File([blob], 'avatar.png', { type: blob.type || 'image/png' })
    }
    if (file) return await agentService.uploadAgentPhoto(agentId, file)
  } catch (err) {
    console.error('Failed to set agent avatar:', err)
  }
  return null
}

// Switch type and refresh the prefilled instructions, but never clobber text
// the user has actually written/edited.
const selectType = (type: string) => {
  selectedType.value = type
  const current = instructions.value.trim()
  if (current === '' || DEFAULT_VALUES.includes(current)) {
    instructions.value = TYPE_DEFAULTS[type] ?? ''
  }
}

const generateWithAI = async () => {
  if (isGenerating.value) return
  error.value = ''
  isGenerating.value = true
  try {
    const typeLabel = agentTypes.find(t => t.value === selectedType.value)?.label ?? 'support'
    const prompt = `A ${typeLabel} AI agent${agentName.value.trim() ? ` named "${agentName.value.trim()}"` : ''}. Write clear instructions describing how it should talk to customers and when to hand off to a human.`
    const generated = await agentService.generateInstructions(prompt, instructions.value.trim() ? [instructions.value.trim()] : undefined)
    if (generated.length) instructions.value = generated.join('\n')
  } catch (err: any) {
    error.value = err?.response?.data?.detail || 'Could not generate instructions. Please try again.'
  } finally {
    isGenerating.value = false
  }
}
// OSS-only: when ChatterMate AI isn't available we must collect a provider key first
const showAiGate = ref(false)

const ensureAIConfig = async (): Promise<boolean> => {
  try {
    await aiService.getOrganizationConfig()
    return true
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 404) {
      if (hasEnterpriseModule) {
        // Managed ChatterMate AI — zero setup, backend injects the key
        await aiService.setupAI({
          model_type: 'CHATTERMATE',
          model_name: 'chattermate',
          api_key: '',
        })
        return true
      }
      // OSS: route into the existing provider setup form as a gate
      showAiGate.value = true
      return false
    }
    throw err
  }
}

const instructionList = () =>
  instructions.value.trim()
    ? [instructions.value.trim()]
    : ['I am an AI assistant here to help with questions.']

const createAgent = async () => {
  let agent: Agent
  if (props.existingAgent) {
    // Returning to this step — update the existing agent, don't create another
    agent = await agentService.updateAgent(props.existingAgent.id, {
      display_name: agentName.value.trim(),
      instructions: instructionList(),
    })
    if (avatarTouched.value) {
      const customization = await applyAvatar(agent.id)
      if (customization) agent.customization = customization
    } else if (props.existingAgent.customization) {
      agent.customization = props.existingAgent.customization
    }
  } else {
    agent = await agentService.createAgent({
      name: agentName.value.trim(),
      display_name: agentName.value.trim(),
      agent_type: selectedType.value,
      instructions: instructionList(),
      is_active: true,
      use_workflow: false,
    })
    const customization = await applyAvatar(agent.id)
    if (customization) agent.customization = customization
  }
  emit('created', agent)
}

const handleContinue = async () => {
  if (!agentName.value.trim()) {
    error.value = 'Please give your agent a name.'
    return
  }
  error.value = ''
  isSubmitting.value = true
  try {
    const ready = await ensureAIConfig()
    if (!ready) return // OSS gate is now showing; createAgent runs after it completes
    await createAgent()
  } catch (err: any) {
    error.value = err?.response?.data?.detail || 'Failed to create your agent. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Fired after the OSS provider form saves a config
const onAiConfigured = async () => {
  showAiGate.value = false
  isSubmitting.value = true
  try {
    await createAgent()
  } catch (err: any) {
    error.value = err?.response?.data?.detail || 'Failed to create your agent. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="step">
    <!-- OSS provider-key gate -->
    <div v-if="showAiGate" class="ai-gate">
      <p class="ai-gate-note">Connect an AI provider to power your agent, then we'll create it.</p>
      <AISetup @ai-setup-complete="onAiConfigured" />
    </div>

    <template v-else>
      <header class="step-head">
        <h2 class="step-title">Create your agent</h2>
        <p class="step-sub">Give it a name and a personality. You can refine everything later.</p>
      </header>

      <div class="field">
        <label class="field-label" for="onb-agent-name">Agent name</label>
        <input
          id="onb-agent-name"
          v-model="agentName"
          class="text-input"
          type="text"
          placeholder="e.g. Customer Support Agent"
          :disabled="isSubmitting"
          @keydown.enter.prevent="handleContinue"
        />
      </div>

      <div class="field">
        <label class="field-label">Type</label>
        <div class="type-picker">
          <button
            v-for="type in agentTypes"
            :key="type.value"
            type="button"
            class="type-chip"
            :class="{ selected: selectedType === type.value }"
            :disabled="isSubmitting || !!existingAgent"
            @click="selectType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Profile picture</label>
        <div class="avatar-grid">
          <button
            v-for="(url, i) in presetAvatars"
            :key="i"
            type="button"
            class="avatar-thumb"
            :class="{ selected: selectedAvatar === url }"
            :disabled="isSubmitting"
            @click="selectPreset(url)"
            :aria-label="`Avatar ${i + 1}`"
          >
            <img :src="url" alt="" />
          </button>
          <button
            type="button"
            class="avatar-thumb upload"
            :class="{ selected: !!customAvatarPreview }"
            :disabled="isSubmitting"
            @click="triggerAvatarUpload"
            title="Upload your own"
            aria-label="Upload your own picture"
          >
            <img v-if="customAvatarPreview" :src="customAvatarPreview" alt="" />
            <span v-else class="upload-plus">+</span>
          </button>
          <input ref="avatarFileInput" type="file" accept="image/*" hidden @change="onAvatarFile" />
        </div>
      </div>

      <div class="field">
        <div class="field-label-row">
          <label class="field-label" for="onb-instructions">Personality &amp; instructions</label>
          <button
            type="button"
            class="ai-generate-btn"
            :disabled="isSubmitting || isGenerating"
            @click="generateWithAI"
          >
            <span class="ai-icon">✨</span>
            {{ isGenerating ? 'Generating…' : 'Generate with AI' }}
          </button>
        </div>
        <textarea
          id="onb-instructions"
          v-model="instructions"
          class="text-input textarea"
          rows="3"
          placeholder="Be concise and friendly. Escalate billing questions to a human."
          :disabled="isSubmitting"
        ></textarea>
      </div>

      <div class="ai-note">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8" /></svg>
        <span>
          Powered by ChatterMate AI — ready instantly. Want your own model? Set it later in
          <strong>AI Configuration → Advanced</strong>.
        </span>
      </div>

      <p v-if="error" class="step-error" role="alert">{{ error }}</p>

      <div class="step-actions">
        <button type="button" class="btn-text" :disabled="isSubmitting" @click="emit('skip')">Skip for now</button>
        <button type="button" class="btn-accent" :disabled="isSubmitting" @click="handleContinue">
          {{ isSubmitting ? 'Creating…' : 'Continue' }}
          <span v-if="!isSubmitting" class="arrow">→</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.step {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.step-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 22px;
  margin: 0;
  color: var(--text);
}

.step-sub {
  font-size: 14.5px;
  color: var(--muted);
  margin: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.field-label {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text3);
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ai-generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--accent-bg-08);
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-pill);
  color: var(--accent-ink);
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.ai-generate-btn:hover:not(:disabled) {
  background: var(--accent-bg-12);
}

.ai-generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-icon {
  font-size: 12px;
}

.text-input {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: var(--radius-input);
  color: var(--text);
  font-size: 15px;
  font-family: var(--font-sans);
  outline: none;
  transition: var(--transition-fast);
}

.text-input:focus {
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

.textarea {
  line-height: 1.5;
  resize: vertical;
}

.type-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.avatar-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.avatar-thumb {
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  background: var(--o05);
  border: 2px solid var(--o12);
  cursor: pointer;
  flex-shrink: 0;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-thumb:hover:not(:disabled) {
  border-color: var(--o25);
}

.avatar-thumb.selected {
  border-color: var(--accent-ink);
  box-shadow: 0 0 0 3px var(--accent-bg-12);
}

.avatar-thumb:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.avatar-thumb.upload {
  border-style: dashed;
  background: var(--bg);
}

.upload-plus {
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  color: var(--muted);
}

.type-chip {
  padding: 11px 18px;
  background: var(--o05);
  border: 1px solid var(--o12);
  border-radius: var(--radius-pill);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}

.type-chip.selected {
  background: var(--accent-bg-08);
  border-color: var(--accent-border);
  color: var(--accent-ink);
}

.type-chip:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-note {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  background: var(--purple-bg);
  border: 1px solid var(--purple-border);
  border-radius: 11px;
  font-size: 13px;
  color: var(--c-purple-fg, var(--text3));
}

.ai-note svg {
  flex-shrink: 0;
}

.ai-note strong {
  font-weight: 600;
}

.step-error {
  margin: 0;
  font-size: 13.5px;
  color: var(--error-color);
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.btn-text {
  background: none;
  border: none;
  color: var(--muted2);
  font-size: 14.5px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-text:hover:not(:disabled) {
  color: var(--text3);
}

.btn-accent {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-btn);
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-accent:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn-accent:disabled,
.btn-text:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.arrow {
  font-size: 17px;
}

.ai-gate-note {
  font-size: 14px;
  color: var(--muted);
  margin: 0 0 16px;
  text-align: center;
}
</style>
