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
import { computed, ref, watch } from 'vue'
import { useAgentEdit } from '@/composables/useAgentEdit'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'

interface UserGroup {
  id: string;
  name: string;
}

const props = defineProps({
  instructions: {
    type: String,
    required: true
  },
  transferToHuman: {
    type: Boolean,
    required: true
  },
  askForRating: {
    type: Boolean,
    required: true
  },
  handoffCollectEmail: {
    type: Boolean,
    default: true
  },
  handoffCollectName: {
    type: Boolean,
    default: true
  },
  userGroups: {
    type: Array as () => UserGroup[],
    required: true
  },
  selectedGroupIds: {
    type: Array as () => string[],
    required: true
  },
  loadingGroups: {
    type: Boolean,
    required: true
  },
  isEditing: {
    type: Boolean,
    required: true
  },
  agent: {
    type: Object as () => any,
    required: true
  }
})

const emit = defineEmits([
  'save-agent'
])

// Initialize agent edit composable
const { generateInstructions, isLoading, error } = useAgentEdit(props.agent)

// Subscription and rating feature checking
const subscriptionStorage = useSubscriptionStorage()
const { hasEnterpriseModule } = useEnterpriseFeatures()
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())

// Check if rating feature is available
const hasRatingFeature = computed(() => {
  return subscriptionStorage.hasFeature('rating')
})

// Check if rating is locked
const isRatingLocked = computed(() => {
  // Only lock if enterprise module exists
  if (!hasEnterpriseModule) {
    return false
  }
  return !hasRatingFeature.value || !isSubscriptionActive.value
})

// Upgrade modal state
const showUpgradeModal = ref(false)

// Modal functions
const closeUpgradeModal = () => {
  showUpgradeModal.value = false
}

const handleUpgrade = () => {
  window.location.href = '/settings/subscription'
}

// Create local state for all editable fields
const localInstructions = ref(props.instructions)
const localTransferToHuman = ref(props.transferToHuman)
const localAskForRating = ref(props.askForRating)
const localHandoffCollectEmail = ref(props.handoffCollectEmail)
const localHandoffCollectName = ref(props.handoffCollectName)
const localSelectedGroupIds = ref<string[]>([...props.selectedGroupIds])

// Watch for changes in props to update local state
watch(() => props.instructions, (newValue) => {
  localInstructions.value = newValue
})

watch(() => props.transferToHuman, (newValue) => {
  localTransferToHuman.value = newValue
})

watch(() => props.askForRating, (newValue) => {
  localAskForRating.value = newValue
})

watch(() => props.handoffCollectEmail, (newValue) => {
  localHandoffCollectEmail.value = newValue
})

watch(() => props.handoffCollectName, (newValue) => {
  localHandoffCollectName.value = newValue
})

watch(() => props.selectedGroupIds, (newValue) => {
  localSelectedGroupIds.value = [...newValue]
}, { deep: true })

const transferReasons = [
  "Knowledge gaps",
  "Need human contact",
  "Customer frustration",
  "High priority issues",
  "Compliance matters"
]

const tooltipContent = computed(() => {
  return `Auto-transfer when:\n${transferReasons.map(reason => `• ${reason}`).join('\n')}`
})

const ratingTooltipContent = computed(() => {
  return `Enable to:\n• Request feedback after chat ends\n• Collect star ratings (1-5)\n• Gather optional comments\n• Track customer satisfaction`
})

// AI generation state
const showAIPrompt = ref(false)
const aiPrompt = ref('')

const handleGenerateWithAI = async () => {
  if (!aiPrompt.value.trim()) return
  
  try {
    const generatedInstructions = await generateInstructions(aiPrompt.value)
    if (generatedInstructions.length > 0) {
      // Join the generated instructions with newlines
      localInstructions.value = generatedInstructions.join('\n')
      showAIPrompt.value = false
      aiPrompt.value = ''
    }
  } catch (err) {
    console.error('Failed to generate instructions:', err)
  }
}

// Handle rating toggle with feature check
const handleRatingToggle = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).checked
  
  if (newValue && isRatingLocked.value && hasEnterpriseModule) {
    // Prevent the toggle and show upgrade modal only if enterprise module exists
    event.preventDefault()
    ;(event.target as HTMLInputElement).checked = false
    showUpgradeModal.value = true
    return
  }
  
  localAskForRating.value = newValue
}

const handleSave = () => {
  emit('save-agent', {
    instructions: localInstructions.value,
    transferToHuman: localTransferToHuman.value,
    askForRating: localAskForRating.value,
    handoffCollectEmail: localHandoffCollectEmail.value,
    handoffCollectName: localHandoffCollectName.value,
    selectedGroupIds: localSelectedGroupIds.value
  })
}
</script>

<template>
  <div class="instructions-tab">
    <!-- Instructions Section -->
    <section class="detail-section instructions-section">
      <div class="instructions-header">
        <h4 class="section-title">Instructions</h4>
        <button 
          class="ai-generate-button" 
          @click="showAIPrompt = true"
          :disabled="isLoading"
          v-if="isEditing"
        >
          <span class="ai-icon">✨</span>
          Generate with AI
        </button>
      </div>
      
      <!-- AI Prompt Modal -->
      <div v-if="showAIPrompt" class="ai-prompt-modal">
        <div class="ai-prompt-content">
          <h5>Generate Instructions with AI</h5>
          <textarea 
            v-model="aiPrompt"
            placeholder="Describe what you want your agent to do. For example: 'Create a customer support agent that helps with product returns and exchanges'"
            rows="4"
            class="ai-prompt-textarea"
          ></textarea>
          <div v-if="error" class="error-message">{{ error }}</div>
          <div class="ai-prompt-actions">
            <button 
              class="cancel-ai-button" 
              @click="showAIPrompt = false"
              :disabled="isLoading"
            >
              Cancel
            </button>
            <button 
              class="generate-ai-button" 
              @click="handleGenerateWithAI"
              :disabled="isLoading || !aiPrompt.trim()"
            >
              {{ isLoading ? 'Generating...' : 'Generate' }}
            </button>
          </div>
        </div>
      </div>
      
      <textarea 
        class="instructions-textarea" 
        v-model="localInstructions"
        rows="6" 
        placeholder="Enter instructions for the agent..."
        :readonly="!isEditing"
      ></textarea>
    </section>

    <!-- Transfer and Rating Section -->
    <section class="detail-section">
      <div class="transfer-section">
        <!-- Transfer toggle -->
        <div class="transfer-toggle">
          <div class="toggle-header">
            <h4 class="section-title">Transfer to Human</h4>
            <label class="switch" v-tooltip="tooltipContent">
              <input type="checkbox" 
                v-model="localTransferToHuman"
                :disabled="!isEditing"
              >
              <span class="slider"></span>
            </label>
          </div>
          <p class="helper-text">Enable automatic transfer to human agents when needed</p>
        </div>

        <!-- Collect contact details at handoff -->
        <div v-if="localTransferToHuman" class="handoff-collect">
          <div class="toggle-header">
            <span class="subsection-title">Ask for email at handoff</span>
            <label class="switch">
              <input type="checkbox" v-model="localHandoffCollectEmail" :disabled="!isEditing">
              <span class="slider"></span>
            </label>
          </div>
          <div class="toggle-header">
            <span class="subsection-title">Ask for name at handoff (optional)</span>
            <label class="switch">
              <input type="checkbox" v-model="localHandoffCollectName" :disabled="!isEditing">
              <span class="slider"></span>
            </label>
          </div>
          <p class="helper-text">Collect contact details when a chat is handed to a human, so your team can follow up.</p>
        </div>

        <!-- Group selection -->
        <div v-if="localTransferToHuman" class="transfer-groups">
          <h4 class="subsection-title">Transfer Groups</h4>
          <p v-if="userGroups.length" class="helper-text">Select groups that can handle transferred chats</p>
          
          <div v-if="!loadingGroups">
            <div v-if="userGroups.length" class="groups-list">
              <label v-for="group in userGroups" :key="group.id" class="group-item">
                <input 
                  type="checkbox" 
                  :value="group.id"
                  v-model="localSelectedGroupIds"
                  :disabled="!isEditing"
                >
                <span>{{ group.name }}</span>
              </label>
            </div>
            <div v-else class="no-groups-message">
              <p>No groups available.</p>
              <router-link to="/human-agents" class="create-group-link">
                Create Group <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </div>
          
          <div v-else class="loading-groups">
            Loading groups...
          </div>
        </div>

        <!-- Ask for Rating -->
        <div class="rating-toggle">
          <div class="toggle-header">
            <h4 class="section-title">
              Ask for Rating
              <font-awesome-icon v-if="hasEnterpriseModule && isRatingLocked" icon="fa-solid fa-lock" class="lock-icon" />
            </h4>
            <label class="switch" :class="{ 'locked': isRatingLocked }" v-tooltip="ratingTooltipContent">
              <input type="checkbox" 
                :checked="localAskForRating"
                @change="handleRatingToggle"
                :disabled="!isEditing || (isRatingLocked && !localAskForRating)"
              >
              <span class="slider" :class="{ 'locked': isRatingLocked }"></span>
            </label>
          </div>
          <p class="helper-text">
            <span v-if="!isRatingLocked || !hasEnterpriseModule">Request customer feedback when chats end</span>
            <span v-else class="locked-text">
              <font-awesome-icon icon="fa-solid fa-crown" class="premium-icon" />
              Upgrade your plan to enable customer rating collection
            </span>
          </p>
          <p class="helper-text channel-note">
            <font-awesome-icon icon="fa-solid fa-circle-info" class="info-icon" />
            Ratings are collected on the built-in chat widget only — not on connected messaging channels (Telegram, WhatsApp, Messenger, Instagram, Slack, Email, SMS, LINE).
          </p>
        </div>
      </div>
    </section>

    <!-- Save Button -->
    <div v-if="isEditing" class="save-section">
      <button class="save-button" @click="handleSave">
        Save Changes
      </button>
    </div>

    <!-- Rating Feature Upgrade Modal (only shown when enterprise module exists) -->
    <div v-if="hasEnterpriseModule && showUpgradeModal" class="upgrade-modal-overlay">
      <div class="upgrade-modal">
        <div class="upgrade-modal-header">
          <div class="upgrade-icon">
            <font-awesome-icon icon="fa-solid fa-star" />
          </div>
          <h3>Unlock Customer Rating Feature</h3>
          <button class="close-button" @click="closeUpgradeModal">×</button>
        </div>
        <div class="upgrade-modal-content">
          <p class="upgrade-description">
            Enable customer feedback collection to track satisfaction, gather insights, 
            and improve your service quality with star ratings and comments.
          </p>
          <div class="upgrade-features">
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>5-star rating system</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Optional customer comments</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Satisfaction analytics</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Performance insights</span>
            </div>
          </div>
        </div>
        <div class="upgrade-modal-footer">
          <button class="upgrade-button" @click="handleUpgrade">
            <font-awesome-icon icon="fa-solid fa-crown" class="upgrade-icon" />
            Upgrade to Unlock Ratings
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="arrow-icon" />
          </button>
          <button class="cancel-upgrade-button" @click="closeUpgradeModal">Maybe Later</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.instructions-tab {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-lg);
}

.detail-section {
  margin-bottom: var(--space-xl);
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: var(--space-lg);
  width: 100%;
}

.instructions-section {
  margin-bottom: var(--space-xl);
}

.instructions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.section-title {
  margin-bottom: 0;
  color: var(--text-color);
  font-size: 1.1rem;
  font-weight: 600;
}

.ai-generate-button {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--grad-generate);
  color: var(--on-dark);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ai-generate-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--c-purple) 35%, transparent);
}

.ai-generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-icon {
  font-size: 1rem;
}

.ai-prompt-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: color-mix(in srgb, var(--text) 50%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ai-prompt-content {
  background: var(--surface);
  border: 1px solid var(--o10);
  padding: var(--space-xl);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
}

.ai-prompt-content h5 {
  margin-bottom: var(--space-md);
  color: var(--text-color);
  font-size: 1.1rem;
  font-weight: 600;
}

.ai-prompt-textarea {
  width: 100%;
  min-height: 100px;
  padding: var(--space-md);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 1rem;
  color: var(--text-color);
  resize: vertical;
  margin-bottom: var(--space-md);
  box-sizing: border-box;
}

.ai-prompt-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-soft);
}

.error-message {
  color: var(--error-color);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  padding: var(--space-sm);
  background: var(--error-light);
  border-radius: var(--radius-sm);
}

.ai-prompt-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.cancel-ai-button {
  padding: var(--space-sm) var(--space-md);
  background: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-ai-button:hover:not(:disabled) {
  background: var(--background-soft);
}

.generate-ai-button {
  padding: 10px 16px;
  background: var(--grad-generate);
  color: var(--on-dark);
  border: none;
  border-radius: var(--radius-chip);
  cursor: pointer;
  font-size: 13.5px;
  font-weight: var(--font-weight-semibold);
  transition: filter 0.2s ease, transform 0.2s ease;
}

.generate-ai-button:hover:not(:disabled) {
  filter: brightness(1.06);
}

.generate-ai-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.subsection-title {
  margin-bottom: var(--space-md);
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 500;
}

.instructions-textarea {
  width: 100%;
  min-height: 150px;
  padding: var(--space-md);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  color: var(--text-color);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.instructions-textarea:read-only {
  background: var(--background-alt);
  cursor: default;
}

.instructions-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-soft);
}

.transfer-section {
  padding-top: var(--space-md);
}

.transfer-toggle {
  margin-bottom: var(--space-xl);
}

.toggle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.helper-text {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.channel-note {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  font-size: var(--text-xs);
  margin-top: calc(-1 * var(--space-xs));
  opacity: 0.85;
}

.channel-note .info-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--toggle-track-off);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--toggle-knob);
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px color-mix(in srgb, var(--text) 10%, transparent);
}

input:checked + .slider {
  background-color: var(--toggle-on-accent);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.transfer-groups {
  padding: var(--space-lg);
  background: var(--background-alt);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
  border: 1px solid var(--border-color);
  width: 100%;
  box-sizing: border-box;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.group-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s;
}

.group-item:hover {
  background-color: var(--background-soft);
}

.group-item input {
  margin: 0;
}

.no-groups-message {
  text-align: center;
  padding: var(--space-xl);
  background: var(--background-color);
  border-radius: var(--radius-md);
  color: var(--text-muted);
}

.create-group-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.create-group-link:hover {
  opacity: 0.8;
}

.create-group-link i {
  font-size: 0.8em;
}

.loading-groups {
  text-align: center;
  padding: var(--space-xl);
  background: var(--background-color);
  border-radius: var(--radius-md);
  color: var(--text-muted);
}

.rating-toggle {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-sm);
  color: var(--text-color);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: var(--space-md);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 1rem;
  color: var(--text-color);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:read-only {
  background: var(--background-alt);
  cursor: default;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-soft);
}

.save-section {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-lg) 0 0;
  margin-top: var(--space-md);
  border-top: 1px solid var(--o08);
  background: transparent;
}

.save-button {
  padding: var(--space-md) var(--space-xl);
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-button:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--text) 15%, transparent);
}

/* Rating Feature Lock Styles */
.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.lock-icon {
  font-size: 0.875rem;
  color: var(--warning-color);
  opacity: 0.8;
}

.switch.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.slider.locked {
  cursor: not-allowed;
  background-color: var(--toggle-track-off) !important;
}

.slider.locked:before {
  background-color: var(--toggle-knob) !important;
}

.locked-text {
  color: var(--warning-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.premium-icon {
  color: var(--warning-color);
  font-size: 0.875rem;
}

/* Upgrade Modal Styles */
.upgrade-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: color-mix(in srgb, var(--text) 85%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.upgrade-modal {
  background: var(--surface);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.upgrade-modal-header {
  padding: var(--space-xl);
  text-align: center;
  position: relative;
  background: var(--grad-generate);
  color: var(--on-dark);
}

.upgrade-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-md);
  background: color-mix(in srgb, var(--on-dark) 20%, transparent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upgrade-icon svg {
  width: 24px;
  height: 24px;
}

.upgrade-modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text);
}

.upgrade-modal-header .close-button {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  background: color-mix(in srgb, var(--on-dark) 20%, transparent);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: var(--text);
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.upgrade-modal-header .close-button:hover {
  background: color-mix(in srgb, var(--on-dark) 30%, transparent);
  transform: scale(1.1);
}

.upgrade-modal-content {
  padding: var(--space-xl);
}

.upgrade-description {
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-xl);
  text-align: center;
}

.upgrade-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  background: var(--background-soft);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
}

.feature-icon {
  width: 18px;
  height: 18px;
  color: var(--success-color);
  flex-shrink: 0;
}

.feature-item span {
  font-weight: 500;
  color: var(--text-color);
}

.upgrade-modal-footer {
  padding: var(--space-lg) var(--space-xl);
  background: var(--background-soft);
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.upgrade-button {
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-md) var(--space-xl);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--text) 15%, transparent);
}

.upgrade-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--text) 20%, transparent);
  filter: brightness(1.1);
}

.upgrade-button .upgrade-icon {
  font-size: 1rem;
  color: var(--warning-color);
  width: auto;
  height: auto;
  margin: 0;
  background: none;
  border-radius: 0;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.upgrade-button:hover .arrow-icon {
  transform: translateX(2px);
}

.cancel-upgrade-button {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: var(--space-md) var(--space-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-upgrade-button:hover {
  background: var(--background-muted);
  color: var(--text-color);
  border-color: var(--text-muted);
}
</style> 