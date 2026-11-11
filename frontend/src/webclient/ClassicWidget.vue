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


<script lang="ts">
// The classic widget view (v1). State and behaviour come from the widget controller
// its root provides; this view renders it and owns its DOM: the message list's
// scrolling, the hidden file input and the legacy native input listeners.
// A plain setup() rather than <script setup>: the template reads the controller
// through the instance proxy instead of unref'ing ~130 injected bindings one by one.
import { defineComponent, inject, onMounted, onUnmounted, ref } from 'vue'
import { isValidEmail, type WidgetMessage } from '../types/widget'
import { renderMarkdown } from './markdown'
import AskAiPanel from './AskAiPanel.vue'
import NewChatConfirm from './NewChatConfirm.vue'
import BrandMark from '../components/common/BrandMark.vue'
import ActionConfirmCard from './ActionConfirmCard.vue'
import ActionReceiptLine from './ActionReceiptLine.vue'
import JourneyPlan from './JourneyPlan.vue'
import SuggestedReplies from './SuggestedReplies.vue'
import ProductCartButton from './ProductCartButton.vue'
import { canAddToCart } from './shopify-cart'
import { openProduct, stripUrlsForProducts } from './products'
import { citationLabel, citationTooltip } from './citations'
import { SECRET_WARNING } from '../utils/secretGuard'
import { AI_DISCLAIMER_TEXT } from '../utils/aiDisclaimer'
import { NEW_CHAT_LABEL } from './new-chat'
import { WIDGET_CTX } from './panel/controller'
import { useChatScroll } from '../composables/useChatScroll'
import { useLegacyInputListeners } from '../composables/useLegacyInputListeners'
// After the child components and before this view's own styles, as it always was.
import './widget-surface.css'

export default defineComponent({
    name: 'ClassicWidget',
    components: {
        AskAiPanel, NewChatConfirm, BrandMark, ActionConfirmCard, ActionReceiptLine, JourneyPlan,
        SuggestedReplies, ProductCartButton,
    },
    setup() {
        const ctrl = inject(WIDGET_CTX)!

        // Follow the newest message, and whatever sits after the messages.
        const { messagesContainer, scrollToBottom } = useChatScroll(ctrl.messages, [
            ctrl.pendingConfirm, ctrl.shownPrompt, ctrl.receiptCount, ctrl.loading,
        ])
        const legacy = useLegacyInputListeners({
            newMessage: ctrl.newMessage, sendMessage: ctrl.sendMessage,
            connectionStatus: ctrl.connectionStatus, messages: ctrl.messages,
        })
        ctrl.registerView({
            scrollToBottom,
            focusComposer: legacy.focusMessageInput,
            afterSend: legacy.afterMessageSent,
        })
        // The native listeners start once the widget is initialized, as they always did.
        onMounted(async () => {
            await ctrl.ready
            legacy.start()
        })
        // Runs before the root's unmount (a child unmounts first).
        onUnmounted(() => legacy.stop())

        const fileInputRef = ref<HTMLInputElement | null>(null)

        // The stars lit on a rating message: the submitted rating, else the one
        // hovered, else the one picked. None (0) when there is none yet.
        const ratingShown = (message: WidgetMessage) =>
            (message.isSubmitted ? message.finalRating : (ctrl.hoverRating.value || message.selectedRating)) ?? 0

        return {
            ...ctrl,
            messagesContainer,
            fileInputRef,
            openFilePicker: () => fileInputRef.value?.click(),
            handleInputSync: legacy.handleInputSync,
            openProduct,
            ratingShown,
            reloadPage: () => window.location.reload(),
            isValidEmail, renderMarkdown, canAddToCart, stripUrlsForProducts, citationLabel, citationTooltip,
            SECRET_WARNING, AI_DISCLAIMER_TEXT, NEW_CHAT_LABEL,
        }
    },
})
</script>

<template>
    <!-- API Key Not Configured Error (Widget not set up) -->
    <div v-if="showAuthError && isApiKeyAuthRequired" class="widget-unavailable-overlay">
        <button type="button" class="cm-error-close" aria-label="Close chat" title="Close" @click="minimizeWidget">×</button>
        <div class="widget-unavailable-card">
            <div class="widget-unavailable-icon-wrapper">
                <svg class="widget-unavailable-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                </svg>
            </div>
            <h2 class="widget-unavailable-title">Chat Unavailable</h2>
            <p class="widget-unavailable-message">
                This chat widget is not currently configured. Please contact the website administrator to enable chat support.
            </p>
            <div v-if="showBranding" class="widget-unavailable-footer">
                <BrandMark class="chattermate-logo-small" :size="14" />
                <a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener"><span class="cm-powered-prefix">Powered by </span><strong class="cm-brand">ChatterMate</strong></a>
            </div>
        </div>
    </div>

    <!-- Generic Auth Error (Token expired/invalid) -->
    <div v-else-if="showAuthError" class="auth-error-overlay">
        <button type="button" class="cm-error-close" aria-label="Close chat" title="Close" @click="minimizeWidget">×</button>
        <div class="auth-error-card">
            <div class="auth-error-header">
                <svg class="auth-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h2>Authentication Error</h2>
            </div>

            <p class="auth-error-message">
                {{ authError }}
            </p>

            <button class="auth-error-refresh-btn" @click="reloadPage">
                Refresh Page
            </button>
        </div>
    </div>
    <div v-else-if="widgetId && !showAuthError" class="chat-container cm-surface" :class="[{ collapsed: !isExpanded, 'ask-anything-style': isAskAnythingStyle, aurora: isAuroraStyle }, themeClass]" :style="{ ...shadowStyle, ...containerStyles, ...themeVars }">
        <!-- Loading State -->
        <div v-if="isInitializing" class="initializing-overlay">
            <div class="loading-spinner">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <div class="loading-text">Initializing chat...</div>
        </div>

        <!-- Connection Status -->
        <div v-if="!isInitializing && connectionStatus !== 'connected'" class="connection-status" :class="connectionStatus">
            <div v-if="connectionStatus === 'connecting'" class="connecting-message">
                Connecting to chat service...
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
            <div v-else-if="connectionStatus === 'failed'" class="failed-message">
                Connection failed.
                <button @click="handleReconnect" class="reconnect-button">
                    Click here to reconnect
                </button>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="showError" class="error-alert" :style="chatIconStyles">
            {{ errorMessage }}
        </div>

        <!-- Ask AI surface (ASK_ANYTHING / AURORA): a command palette rather than a
             chat window. Workflow screens and the email gate still take precedence —
             they are flow-critical (see useAskAiPanel). -->
        <AskAiPanel
            v-if="useAskAiPanel"
            :messages="messages"
            :draft="newMessage"
            :agent-name="agentName"
            :suggestions="quickActions"
            :welcome-title="customization.welcome_title"
            :welcome-subtitle="askAiSubtitle"
            :placeholder="placeholderText"
            :input-enabled="isMessageInputEnabled"
            :typing-enabled="canTypeMessage"
            :loading="loading"
            :show-citations="showCitations"
            :disclaimer="showAiDisclaimer ? AI_DISCLAIMER_TEXT : ''"
            :show-branding="showBranding"
            :active="hostVisible"
            :hotkey="askAiHotkey"
            :can-start-new-chat="canStartNewChat"
            :starting-new-chat="startingNewChat"
            :new-chat-armed="newChatArmed"
            :new-chat-error="newChatError"
            @new-chat="requestNewChat"
            @confirm-new-chat="confirmNewChat"
            @cancel-new-chat="disarmNewChat"
            :display-text="displayText"
            :is-streaming="isStreaming"
            @update:draft="newMessage = $event"
            @send="sendMessage"
            @ask="sendQuickAction"
            @close="minimizeWidget"
        />

        <!-- Welcome Message for ASK_ANYTHING Style -->
        <div v-else-if="shouldShowWelcomeMessage" class="welcome-message-section" :class="{ aurora: isAuroraStyle }" :style="chatStyles">
            <div class="welcome-content">
                <div class="welcome-header">
                    <div v-if="useOrbAvatar" class="welcome-orb" :style="orbStyle"></div>
                    <img
                        v-else-if="photoUrl"
                        :src="photoUrl"
                        :alt="agentName"
                        class="welcome-avatar"
                    >
                    <h1 class="welcome-title">{{ customization.welcome_title || `Welcome to ${agentName}` }}</h1>
                    <p class="welcome-subtitle">{{ customization.welcome_subtitle || "I'm here to help you with anything you need. What can I assist you with today?" }}</p>
                </div>
            </div>

            <!-- Welcome Input Container -->
            <div class="welcome-input-container">
                <div class="email-input" v-if="!hasStartedChat && !hasConversationToken && shouldCollectEmail">
                    <input
                        v-model="emailInput"
                        type="email"
                        placeholder="Enter your email address"
                        :disabled="loading || connectionStatus !== 'connected'"
                        :class="{
                            'invalid': emailInput.trim() && !isValidEmail(emailInput.trim()),
                            'disabled': connectionStatus !== 'connected'
                        }"
                        class="welcome-email-input"
                    >
                </div>
                <div class="welcome-message-input">
                    <input
                        v-model="newMessage"
                        type="text"
                        :placeholder=placeholderText
                        @keypress="handleKeyPress"
                        @input="handleInputSync"
                        @change="handleInputSync"
                        :disabled="!canTypeMessage"
                        :class="{ 'disabled': !canTypeMessage }"
                        class="welcome-message-field"
                    >
                    <button
                        class="welcome-send-button"
                        :class="{ 'aurora-send': isAuroraStyle }"
                        :style="userBubbleStyles"
                        @click="sendMessage"
                        :disabled="!newMessage.trim() || !isMessageInputEnabled || secretInMessage"
                    >
                        <svg v-if="isAuroraStyle" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L3 21L21 12L3 3L5 12ZM5 12L13 12" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Powered by footer for welcome message -->
            <div v-if="showBranding" class="powered-by-welcome" :style="messageNameStyles">
                <BrandMark class="chattermate-logo" :size="16" />
                <a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener"><span class="cm-powered-prefix">Powered by </span><strong class="cm-brand">ChatterMate</strong></a>
            </div>
        </div>

        <!-- Landing Page Display (Full Screen) -->
        <div v-if="showLandingPage && landingPageData" class="landing-page-fullscreen" :style="chatStyles">
            <div class="landing-page-content">
                <div class="landing-page-header">
                    <h2 class="landing-page-heading">
                        {{ landingPageData.heading }}
                    </h2>
                    <div class="landing-page-text">
                        {{ landingPageData.content }}
                    </div>
                </div>
                <div class="landing-page-actions">
                    <button
                        class="landing-page-button"
                        @click="handleLandingPageProceed"
                    >
                        {{ workflowButtonText }}
                    </button>
                </div>
            </div>
            <!-- Powered by footer for landing page -->
            <div v-if="showBranding" class="powered-by-landing" :style="messageNameStyles">
                <BrandMark class="chattermate-logo" :size="16" />
                <a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener"><span class="cm-powered-prefix">Powered by </span><strong class="cm-brand">ChatterMate</strong></a>
            </div>
        </div>

        <!-- Full Screen Form Display -->
        <div v-else-if="showFullScreenForm && fullScreenFormData" class="form-fullscreen" :style="chatStyles">
            <div class="form-fullscreen-content">
                <div v-if="fullScreenFormData.title || fullScreenFormData.description" class="form-header">
                    <h2 v-if="fullScreenFormData.title" class="form-title">{{ fullScreenFormData.title }}</h2>
                    <p v-if="fullScreenFormData.description" class="form-description">
                        {{ fullScreenFormData.description }}
                    </p>
                </div>

                <div class="form-fields">
                    <div
                        v-for="field in fullScreenFormData.fields"
                        :key="field.name"
                        class="form-field"
                    >
                        <label :for="`fullscreen-form-${field.name}`" class="field-label">
                            {{ field.label }}
                            <span v-if="field.required" class="required-indicator">*</span>
                        </label>

                        <!-- Text Input -->
                        <input
                            v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
                            :id="`fullscreen-form-${field.name}`"
                            :type="field.type"
                            :placeholder="field.placeholder || ''"
                            :required="field.required"
                            :minlength="field.minLength"
                            :maxlength="field.maxLength"
                            :value="formData[field.name] || ''"
                            @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                            @blur="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                            class="form-input"
                            :class="{ 'error': formErrors[field.name] }"
                            :autocomplete="field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'"
                            :inputmode="field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'"
                        />

                        <!-- Number Input -->
                        <input
                            v-else-if="field.type === 'number'"
                            :id="`fullscreen-form-${field.name}`"
                            type="number"
                            :placeholder="field.placeholder || ''"
                            :required="field.required"
                            :min="field.minLength"
                            :max="field.maxLength"
                            :value="formData[field.name] || ''"
                            @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                            class="form-input"
                            :class="{ 'error': formErrors[field.name] }"
                        />

                        <!-- Textarea -->
                        <textarea
                            v-else-if="field.type === 'textarea'"
                            :id="`fullscreen-form-${field.name}`"
                            :placeholder="field.placeholder || ''"
                            :required="field.required"
                            :minlength="field.minLength"
                            :maxlength="field.maxLength"
                            :value="formData[field.name] || ''"
                            @input="handleFieldChange(field.name, ($event.target as HTMLTextAreaElement).value)"
                            class="form-textarea"
                            :class="{ 'error': formErrors[field.name] }"
                            rows="4"
                        ></textarea>

                        <!-- Select -->
                        <select
                            v-else-if="field.type === 'select'"
                            :id="`fullscreen-form-${field.name}`"
                            :required="field.required"
                            :value="formData[field.name] || ''"
                            @change="handleFieldChange(field.name, ($event.target as HTMLSelectElement).value)"
                            class="form-select"
                            :class="{ 'error': formErrors[field.name] }"
                        >
                            <option value="">{{ field.placeholder || 'Please select...' }}</option>
                            <option
                                v-for="option in (Array.isArray(field.options) ? field.options : field.options?.split('\n') || []).filter((o: string) => o.trim())"
                                :key="option"
                                :value="option.trim()"
                            >
                                {{ option.trim() }}
                            </option>
                        </select>

                        <!-- Checkbox -->
                        <label
                            v-else-if="field.type === 'checkbox'"
                            class="checkbox-field"
                        >
                            <input
                                :id="`fullscreen-form-${field.name}`"
                                type="checkbox"
                                :required="field.required"
                                :checked="formData[field.name] || false"
                                @change="handleFieldChange(field.name, ($event.target as HTMLInputElement).checked)"
                                class="form-checkbox"
                            />
                            <span class="checkbox-label">{{ field.label }}</span>
                        </label>

                        <!-- Radio -->
                        <div
                            v-else-if="field.type === 'radio'"
                            class="radio-group"
                        >
                            <label
                                v-for="option in (Array.isArray(field.options) ? field.options : field.options?.split('\n') || []).filter((o: string) => o.trim())"
                                :key="option"
                                class="radio-field"
                            >
                                <input
                                    type="radio"
                                    :name="`fullscreen-form-${field.name}`"
                                    :value="option.trim()"
                                    :required="field.required"
                                    :checked="formData[field.name] === option.trim()"
                                    @change="handleFieldChange(field.name, option.trim())"
                                    class="form-radio"
                                />
                                <span class="radio-label">{{ option.trim() }}</span>
                            </label>
                        </div>

                        <!-- Field error -->
                        <div v-if="formErrors[field.name]" class="field-error">
                            {{ formErrors[field.name] }}
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button
                        @click="submitFullScreenForm()"
                        :disabled="isSubmittingForm"
                        class="submit-form-button"
                        :style="userBubbleStyles"
                    >
                        <span v-if="isSubmittingForm" class="loading-spinner-inline">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </span>
                        <span v-else>{{ fullScreenFormData.submit_button_text || 'Submit' }}</span>
                    </button>
                </div>
            </div>
            <!-- Powered by footer for form -->
            <div v-if="showBranding" class="powered-by-landing" :style="messageNameStyles">
                <BrandMark class="chattermate-logo" :size="16" />
                <a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener"><span class="cm-powered-prefix">Powered by </span><strong class="cm-brand">ChatterMate</strong></a>
            </div>
        </div>

        <!-- Chat Panel (Only show when landing page, full screen form, and welcome message are not active) -->
        <div v-else-if="!shouldShowWelcomeMessage && isExpanded && !useAskAiPanel" class="chat-panel" :class="{ 'ask-anything-chat': isAskAnythingStyle }" :style="chatStyles">
            <div v-if="!isAskAnythingStyle" class="chat-header" :style="headerBorderStyles">
                <div class="cm-header-sheen" :style="{ background: 'linear-gradient(90deg, transparent, ' + (customization.accent_color || '#C9F24E') + ', transparent)' }"></div>
                <div class="header-content">
                    <div
                        v-if="!humanAgentPhotoUrl && (useOrbAvatar || !photoUrl)"
                        class="header-orb"
                        :style="orbStyle"
                    ></div>
                    <img
                        v-else-if="humanAgentPhotoUrl || photoUrl"
                        :src="humanAgentPhotoUrl || photoUrl"
                        :alt="humanAgent.human_agent_name || agentName"
                        class="header-avatar"
                    >
                    <div class="header-info">
                        <h3 :style="messageNameStyles">{{ humanAgent.human_agent_name || agentName }}</h3>
                        <div class="status">
                            <span class="status-indicator" :class="presence.online ? 'online' : 'away'"></span>
                            <span class="status-text cm-presence">{{ presence.text }}</span>
                        </div>
                    </div>
                </div>
                <!-- Grouped: the header is space-between, so as separate children the
                     two actions would drift to opposite ends of the free space. -->
                <div class="header-actions">
                <button
                    v-if="canStartNewChat"
                    type="button"
                    class="header-new-chat"
                    :class="{ armed: newChatArmed }"
                    :style="messageNameStyles"
                    :disabled="startingNewChat"
                    :title="NEW_CHAT_LABEL"
                    :aria-label="NEW_CHAT_LABEL"
                    :aria-expanded="newChatArmed"
                    @click="requestNewChat"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                    </svg>
                </button>
                <button
                    type="button"
                    class="header-minimize"
                    :style="messageNameStyles"
                    title="Minimize"
                    aria-label="Minimize chat"
                    @click="minimizeWidget"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6"></path>
                    </svg>
                </button>
                </div>
            </div>
            <div v-else class="ask-anything-top" :style="headerBorderStyles">
                <div class="ask-anything-header">
                    <img
                        v-if="humanAgentPhotoUrl || photoUrl"
                        :src="humanAgentPhotoUrl || photoUrl"
                        :alt="humanAgent.human_agent_name || agentName"
                        class="header-avatar"
                    >
                    <div class="header-info">
                        <h3 :style="messageNameStyles">{{ agentName }}</h3>
                        <p class="ask-anything-subtitle" :style="messageNameStyles">{{ customization.welcome_subtitle || 'Ask me anything. I\'m here to help.' }}</p>
                    </div>
                </div>
            </div>

            <!-- Loading indicator for history -->
            <div v-if="loadingHistory" class="loading-history">
                <div class="loading-spinner">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>

            <!-- Pre-chat email gate: collect a valid email before the conversation starts -->
            <div v-if="showEmailGate" class="cm-email-gate" :style="chatStyles">
                <div class="cm-email-gate-orb" :style="orbStyle"></div>
                <h3 class="cm-email-gate-title">{{ customization.welcome_title || 'Before we start' }}</h3>
                <p class="cm-email-gate-text">Enter your email and we'll continue the chat.</p>
                <input
                    v-model="emailInput"
                    type="email"
                    inputmode="email"
                    autocomplete="email"
                    placeholder="you@example.com"
                    class="cm-email-gate-input"
                    :class="{ invalid: !!emailGateError }"
                    :disabled="submittingEmail"
                    @keyup.enter="submitEmailGate"
                    @input="emailGateError = ''"
                >
                <p v-if="emailGateError" class="cm-email-gate-error">{{ emailGateError }}</p>
                <button
                    type="button"
                    class="cm-email-gate-btn"
                    :style="userBubbleStyles"
                    :disabled="submittingEmail"
                    @click="submitEmailGate"
                >{{ submittingEmail ? 'Please wait…' : 'Continue to chat' }}</button>
            </div>

            <NewChatConfirm
                v-if="newChatArmed && canStartNewChat"
                :busy="startingNewChat"
                :error="newChatError"
                @confirm="confirmNewChat"
                @cancel="disarmNewChat"
            />

            <div v-show="!showEmailGate" class="chat-messages" ref="messagesContainer" role="log" aria-label="Messages">
                <JourneyPlan v-if="journeyProgress" :progress="journeyProgress" @skip="skipStep" @hide="dismissJourney" />
                <!-- Welcome message on open (cleared after the first send). Quick actions
                     render as a bar above the input — see below. -->
                <div v-if="showWelcomeBlock" class="cm-welcome-block">
                    <div class="message agent-message cm-welcome-row">
                        <div v-if="useOrbAvatar || !photoUrl" class="cm-welcome-orb" :style="orbStyle"></div>
                        <img v-else :src="photoUrl" :alt="agentName" class="cm-welcome-avatar">
                        <div class="message-bubble cm-welcome-bubble" :style="agentBubbleStyles">{{ welcomeMessageText }}</div>
                    </div>
                </div>

                <template v-for="(message, index) in messages" :key="index">
                    <div v-if="promptPlace.isBefore(message)" class="message agent-message cm-welcome-row cm-host-prompt">
                        <div v-if="useOrbAvatar || !photoUrl" class="cm-welcome-orb" :style="orbStyle"></div>
                        <img v-else :src="photoUrl" :alt="agentName" class="cm-welcome-avatar">
                        <div class="message-bubble cm-welcome-bubble" :style="agentBubbleStyles">{{ shownPrompt?.message }}</div>
                    </div>
                    <div
                        :class="[
                            'message',
                            message.message_type === 'bot' ? 'agent-message' :
                            message.message_type === 'agent' ? 'agent-message' :
                            message.message_type === 'system' ? 'system-message' :
                            message.message_type === 'rating' ? 'rating-message' :
                            message.message_type === 'form' ? 'form-message' :
                            message.message_type === 'product' || message.shopify_output ? 'product-message' :
                            'user-message'
                        ]"
                    >
                        <!-- Agent/bot avatar beside every reply (design comp) -->
                        <div
                            v-if="message.message_type === 'bot' || message.message_type === 'agent'"
                            class="cm-msg-avatar"
                            aria-hidden="true"
                        >
                            <img v-if="humanAgentPhotoUrl" :src="humanAgentPhotoUrl" class="cm-msg-avatar-img" alt="">
                            <img v-else-if="!useOrbAvatar && photoUrl" :src="photoUrl" class="cm-msg-avatar-img" alt="">
                            <div v-else class="cm-msg-avatar-orb" :style="orbStyle"></div>
                        </div>
                        <div class="message-col">
                        <div class="message-bubble"
                            :style="message.message_type === 'system' || message.message_type === 'rating' || message.message_type === 'form' || message.message_type === 'product' || message.shopify_output ? {} :
                                   message.message_type === 'user' ? userBubbleStyles :
                                   agentBubbleStyles"
                        >
                            <template v-if="message.message_type === 'rating'">
                                <div class="rating-content">
                                    <p class="rating-prompt">Rate the chat session that you had with {{ message.agent_name || humanAgent.human_agent_name || agentName || 'our agent' }}</p>

                                    <!-- Rating stars -->
                                    <div class="star-rating" :class="{ 'submitted': isSubmittingRating || message.isSubmitted }">
                                        <button
                                            v-for="star in 5"
                                            :key="star"
                                            class="star-button"
                                            :aria-label="`${star} out of 5`"
                                            :class="{
                                                'warning': star <= ratingShown(message) && ratingShown(message) <= 3,
                                                'success': star <= ratingShown(message) && ratingShown(message) > 3,
                                                'selected': star <= ratingShown(message)
                                            }"
                                            @mouseover="!message.isSubmitted && handleStarHover(star)"
                                            @mouseleave="!message.isSubmitted && handleStarLeave"
                                            @click="!message.isSubmitted && handleStarClick(star)"
                                            :disabled="isSubmittingRating || message.isSubmitted"
                                        >
                                            ★
                                        </button>
                                    </div>

                                    <!-- Feedback input before submission -->
                                    <div v-if="message.showFeedback && !message.isSubmitted" class="feedback-wrapper">
                                        <div class="feedback-section">
                                            <input
                                                v-model="message.feedback"
                                                placeholder="Please share your feedback (optional)"
                                                :disabled="isSubmittingRating"
                                                maxlength="500"
                                                class="feedback-input"
                                            />
                                            <div class="feedback-counter">{{ message.feedback?.length || 0 }}/500</div>
                                        </div>
                                        <button
                                            @click="handleSubmitRating(message.session_id, hoverRating, message.feedback)"
                                            :disabled="isSubmittingRating || !hoverRating"
                                            class="submit-rating-button"
                                            :style="{ backgroundColor: customization.accent_color || 'var(--accent-solid)' }"
                                        >
                                            {{ isSubmittingRating ? 'Submitting...' : 'Submit Rating' }}
                                        </button>
                                    </div>

                                    <!-- Submitted feedback display -->
                                    <div v-if="message.isSubmitted && message.finalFeedback" class="submitted-feedback-wrapper">
                                        <div class="submitted-feedback">
                                            <p class="submitted-feedback-text">{{ message.finalFeedback }}</p>
                                        </div>

                                    </div>

                                    <!-- Thank you message if no feedback was provided -->
                                    <div v-else-if="message.isSubmitted" class="submitted-message">
                                        Thank you for your rating!
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="message.message_type === 'form'">
                                <div class="form-content">
                                                                    <div v-if="message.attributes?.form_data?.title || message.attributes?.form_data?.description" class="form-header">
                                    <h3 v-if="message.attributes?.form_data?.title" class="form-title">{{ message.attributes.form_data.title }}</h3>
                                    <p v-if="message.attributes?.form_data?.description" class="form-description">
                                        {{ message.attributes.form_data.description }}
                                    </p>
                                </div>
                                    <div class="form-fields">
                                        <div
                                            v-for="field in message.attributes?.form_data?.fields"
                                            :key="field.name"
                                            class="form-field"
                                        >
                                            <label :for="`form-${field.name}`" class="field-label">
                                                {{ field.label }}
                                                <span v-if="field.required" class="required-indicator">*</span>
                                            </label>

                                            <!-- Text Input -->
                                            <input
                                                v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
                                                :id="`form-${field.name}`"
                                                :type="field.type"
                                                :placeholder="field.placeholder || ''"
                                                :required="field.required"
                                                :minlength="field.minLength"
                                                :maxlength="field.maxLength"
                                                :value="formData[field.name] || ''"
                                                @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                                                @blur="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                                                class="form-input"
                                                :class="{ 'error': formErrors[field.name] }"
                                                :disabled="isSubmittingForm"
                                                :autocomplete="field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'"
                                                :inputmode="field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'"
                                            />

                                            <!-- Number Input -->
                                            <input
                                                v-else-if="field.type === 'number'"
                                                :id="`form-${field.name}`"
                                                type="number"
                                                :placeholder="field.placeholder || ''"
                                                :required="field.required"
                                                :min="field.min"
                                                :max="field.max"
                                                :value="formData[field.name] || ''"
                                                @input="handleFieldChange(field.name, ($event.target as HTMLInputElement).value)"
                                                class="form-input"
                                                :class="{ 'error': formErrors[field.name] }"
                                                :disabled="isSubmittingForm"
                                            />

                                            <!-- Textarea -->
                                            <textarea
                                                v-else-if="field.type === 'textarea'"
                                                :id="`form-${field.name}`"
                                                :placeholder="field.placeholder || ''"
                                                :required="field.required"
                                                :minlength="field.minLength"
                                                :maxlength="field.maxLength"
                                                :value="formData[field.name] || ''"
                                                @input="handleFieldChange(field.name, ($event.target as HTMLTextAreaElement).value)"
                                                class="form-textarea"
                                                :class="{ 'error': formErrors[field.name] }"
                                                :disabled="isSubmittingForm"
                                                rows="3"
                                            ></textarea>

                                            <!-- Select -->
                                            <select
                                                v-else-if="field.type === 'select'"
                                                :id="`form-${field.name}`"
                                                :required="field.required"
                                                :value="formData[field.name] || ''"
                                                @change="handleFieldChange(field.name, ($event.target as HTMLSelectElement).value)"
                                                class="form-select"
                                                :class="{ 'error': formErrors[field.name] }"
                                                :disabled="isSubmittingForm"
                                            >
                                                <option value="">{{ field.placeholder || 'Select an option' }}</option>
                                                <option
                                                    v-for="option in (Array.isArray(field.options) ? field.options : field.options?.split('\n') || []).filter((o: string) => o.trim())"
                                                    :key="option.trim()"
                                                    :value="option.trim()"
                                                >
                                                    {{ option.trim() }}
                                                </option>
                                            </select>

                                            <!-- Checkbox -->
                                            <div v-else-if="field.type === 'checkbox'" class="checkbox-field">
                                                <input
                                                    :id="`form-${field.name}`"
                                                    type="checkbox"
                                                    :checked="formData[field.name] || false"
                                                    @change="handleFieldChange(field.name, ($event.target as HTMLInputElement).checked)"
                                                    class="form-checkbox"
                                                    :disabled="isSubmittingForm"
                                                />
                                                <label :for="`form-${field.name}`" class="checkbox-label">
                                                    {{ field.placeholder || field.label }}
                                                </label>
                                            </div>

                                            <!-- Radio buttons -->
                                            <div v-else-if="field.type === 'radio'" class="radio-field">
                                                <div
                                                    v-for="option in (Array.isArray(field.options) ? field.options : field.options?.split('\n') || []).filter((o: string) => o.trim())"
                                                    :key="option.trim()"
                                                    class="radio-option"
                                                >
                                                    <input
                                                        :id="`form-${field.name}-${option.trim()}`"
                                                        :name="`form-${field.name}`"
                                                        type="radio"
                                                        :value="option.trim()"
                                                        :checked="formData[field.name] === option.trim()"
                                                        @change="handleFieldChange(field.name, option.trim())"
                                                        class="form-radio"
                                                        :disabled="isSubmittingForm"
                                                    />
                                                    <label :for="`form-${field.name}-${option.trim()}`" class="radio-label">
                                                        {{ option.trim() }}
                                                    </label>
                                                </div>
                                            </div>

                                            <!-- Error message -->
                                            <div v-if="formErrors[field.name]" class="field-error">
                                                {{ formErrors[field.name] }}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-actions">
                                        <button
                                            @click="handleFormSubmit(message.attributes?.form_data)"
                                            :disabled="isSubmittingForm"
                                            class="form-submit-button"
                                            :style="userBubbleStyles"
                                        >
                                            {{ isSubmittingForm ? 'Submitting...' : (message.attributes?.form_data?.submit_button_text || 'Submit') }}
                                        </button>
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="message.message_type === 'user_input'">
                                <div class="user-input-content">
                                    <!-- Only show prompt if message exists and is not empty -->
                                    <div
                                        v-if="message.attributes?.prompt_message && message.attributes.prompt_message.trim()"
                                        class="user-input-prompt"
                                    >
                                        {{ message.attributes.prompt_message }}
                                    </div>

                                    <!-- Show input form if not submitted -->
                                    <div v-if="!message.isSubmitted" class="user-input-form">
                                        <textarea
                                            v-model="message.userInputValue"
                                            class="user-input-textarea"
                                            placeholder="Type your message here..."
                                            rows="3"
                                            @keydown.enter.ctrl="handleUserInputSubmit(message)"
                                            @keydown.enter.meta="handleUserInputSubmit(message)"
                                        ></textarea>
                                        <button
                                            class="user-input-submit-button"
                                            @click="handleUserInputSubmit(message)"
                                            :disabled="!message.userInputValue || !message.userInputValue.trim()"
                                        >
                                            Submit
                                        </button>
                                    </div>

                                    <!-- Show submitted value -->
                                    <div v-else class="user-input-submitted">
                                        <strong>Your input:</strong> {{ message.submittedValue }}
                                        <div
                                            v-if="message.attributes?.confirmation_message && message.attributes.confirmation_message.trim()"
                                            class="user-input-confirmation"
                                        >
                                            {{ message.attributes.confirmation_message }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="message.shopify_output || message.message_type === 'product'">
                                <div class="product-message-container">
                                    <!-- Display the message text, removing images if products are present -->
                                    <div v-if="message.message" v-html="renderMarkdown((message.shopify_output?.products?.length ?? 0) > 0 ? stripUrlsForProducts(message.message) : message.message)" class="product-message-text"></div>

                                    <!-- Always use carousel/list display -->
                                    <div v-if="message.shopify_output?.products && message.shopify_output.products.length > 0" class="products-carousel">
                                        <h3 class="carousel-title">Products</h3>
                                        <div class="carousel-items">
                                            <div v-for="product in message.shopify_output.products" :key="product.id" class="product-card-compact carousel-item" role="group" :aria-label="product.title">
                                                <div class="product-image-compact" v-if="product.image?.src">
                                                    <img :src="product.image.src" :alt="product.title" class="product-thumbnail">
                                                </div>
                                                <div class="product-info-compact">
                                                    <div class="product-text-area">
                                                        <div class="product-title-compact">{{ product.title }}</div>
                                                        <div class="product-variant-compact" v-if="product.variant_title && product.variant_title !== 'Default Title'">{{ product.variant_title }}</div>
                                                        <div class="product-price-compact">{{ product.price_formatted || formatCurrency(product.price, product.currency) }}</div>
                                                    </div>
                                                    <div class="product-actions-compact">
                                                        <ProductCartButton
                                                            v-if="canAddToCart(product, message.shopify_output?.shop_domain)"
                                                            :variant-id="product.cart_variant_id ?? ''"
                                                        />
                                                        <button
                                                            class="view-details-button-compact"
                                                            @click="openProduct(product, message.shopify_output?.shop_domain)"
                                                        >
                                                            View product <span class="external-link-icon">↗</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- No products found message - only show if there's no message text -->
                                    <div v-else-if="!message.message && message.shopify_output?.products && message.shopify_output.products.length === 0" class="no-products-message">
                                        <p>No products found.</p>
                                    </div>
                                    <!-- Add a message if shopify_output exists but has no products array (edge case) -->
                                     <div v-else-if="!message.message && message.shopify_output && !message.shopify_output.products" class="no-products-message">
                                        <p>No products to display.</p>
                                     </div>
                                </div>
                            </template>
                            <template v-else>
                                <!-- Live replies reveal char-by-char, rendering the partial slice
                                     through the same sanitized markdown pipeline as the final text
                                     so formatting appears mid-stream (caret rides the last block). -->
                                <div v-if="isStreaming(index)" class="message-streaming" v-html="renderMarkdown(displayText(index, message.message || ''))"></div>
                                <div v-else v-html="renderMarkdown(message.message)"></div>

                                <!-- Display attachments if present -->
                                <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                                  <div
                                    v-for="attachment in message.attachments"
                                    :key="attachment.id"
                                    class="attachment-item"
                                  >
                                    <!-- Image attachment - render as image -->
                                    <template v-if="isImageAttachment(attachment.content_type)">
                                      <div class="attachment-image-container">
                                        <img
                                          :src="getDownloadUrl(attachment.file_url)"
                                          :alt="attachment.filename"
                                          class="attachment-image"
                                          @click.stop="openPreview({url: attachment.file_url, filename: attachment.filename, type: attachment.content_type, file_url: getDownloadUrl(attachment.file_url), size: undefined})"
                                          style="cursor: pointer;"
                                        />
                                        <div class="attachment-image-info">
                                          <a
                                            :href="getDownloadUrl(attachment.file_url)"
                                            target="_blank"
                                            class="attachment-link"
                                          >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                              <polyline points="7 10 12 15 17 10"></polyline>
                                              <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            {{ attachment.filename }}
                                            <span class="attachment-size">({{ formatFileSize(attachment.file_size) }})</span>
                                          </a>
                                        </div>
                                      </div>
                                    </template>
                                    <!-- Other file types - render as download link -->
                                    <template v-else>
                                      <a
                                        :href="getDownloadUrl(attachment.file_url)"
                                        target="_blank"
                                        class="attachment-link"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                        </svg>
                                        {{ attachment.filename }}
                                        <span class="attachment-size">({{ formatFileSize(attachment.file_size) }})</span>
                                      </a>
                                    </template>
                                  </div>
                                </div>
                            </template>
                        </div>
                        <!-- Knowledge-base citation chips -->
                        <div
                            v-if="showCitations && (message.message_type === 'bot' || message.message_type === 'agent') && message.sources && message.sources.length"
                            class="citation-chips"
                        >
                            <span class="citation-label">Sources</span>
                            <span
                                v-for="(src, sIdx) in message.sources"
                                :key="sIdx"
                                class="citation-chip"
                                :title="citationTooltip(src)"
                            >{{ citationLabel(src) }}</span>
                        </div>
                        <div class="message-info">
                            <span v-if="message.message_type === 'user'" class="agent-name">
                                You
                            </span>
                        </div>
                        </div>
                    </div>
                    <ActionReceiptLine v-for="(receipt, r) in receiptsAfter(index + 1)" :key="`receipt-${index}-${r}`" :receipt="receipt" />
                </template>

                <div v-if="promptPlace.isLast()" class="message agent-message cm-welcome-row cm-host-prompt">
                    <div v-if="useOrbAvatar || !photoUrl" class="cm-welcome-orb" :style="orbStyle"></div>
                    <img v-else :src="photoUrl" :alt="agentName" class="cm-welcome-avatar">
                    <div class="message-bubble cm-welcome-bubble" :style="agentBubbleStyles">{{ shownPrompt?.message }}</div>
                </div>

                <SuggestedReplies
                    v-if="replyChips.length"
                    :chips="replyChips"
                    :disabled="!isMessageInputEnabled || chipBusy"
                    @pick="onPageChip"
                />

                <ActionConfirmCard
                    v-if="pendingConfirm"
                    :pending="pendingConfirm"
                    @approve="approveAction"
                    @decline="declineAction"
                />

                <!-- Loading indicator: "reading knowledge base" only when citations
                     are enabled; otherwise a plain typing indicator. -->
                <div v-if="loading && !pendingConfirm" class="typing-indicator" :class="{ 'reading-indicator': showCitations }" role="status" aria-label="Agent is replying">
                    <template v-if="showCitations">
                        <div class="reading-bars" aria-hidden="true">
                            <span></span><span></span><span></span>
                        </div>
                        <span class="reading-label">reading knowledge base</span>
                    </template>
                    <template v-else>
                        <div class="cm-typing-bubble" :style="agentBubbleStyles">
                            <span class="cm-typing-dot"></span>
                            <span class="cm-typing-dot"></span>
                            <span class="cm-typing-dot"></span>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Quick actions (shown on open, just above the input — comp layout) -->
            <div v-if="showQuickActions" class="cm-quick-actions-bar">
                <button
                    v-for="action in quickActions"
                    :key="action"
                    type="button"
                    class="cm-quick-action"
                    :disabled="!isMessageInputEnabled"
                    @click="sendQuickAction(action)"
                >{{ action }}</button>
            </div>

            <!-- Chat Input Section (hidden during the email gate and workflow end) -->
            <div v-if="!shouldShowNewConversationOption && !showEmailGate" class="chat-input" :class="{ 'ask-anything-input': isAskAnythingStyle }">
                <!-- File upload input (hidden) -->
                <input
                    ref="fileInputRef"
                    type="file"
                    :accept="acceptTypes"
                    multiple
                    style="display: none"
                    @change="handleFileSelect"
                />

                <!-- File previews -->
                <div v-if="uploadedAttachments.length > 0" class="file-previews-widget">
                    <div
                        v-for="(file, index) in uploadedAttachments"
                        :key="index"
                        class="file-preview-widget"
                    >
                        <div class="file-preview-content-widget" style="cursor: pointer;">
                            <img
                                v-if="isImage(file.type)"
                                :src="getPreviewUrl(file)"
                                :alt="file.filename"
                                class="file-preview-image-widget"
                                @click.stop="openPreview(file)"
                                style="cursor: pointer;"
                            />
                            <div v-else class="file-preview-icon-widget" @click.stop="openPreview(file)" style="cursor: pointer;">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                            </div>
                        </div>
                        <div class="file-preview-info-widget">
                            <div class="file-preview-name-widget">{{ file.filename }}</div>
                            <div class="file-preview-size-widget">{{ formatFileSize(file.size) }}</div>
                        </div>
                        <button
                            type="button"
                            class="file-preview-remove-widget"
                            @click="removeAttachment(index)"
                            :title="'Remove file'"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <!-- Upload progress indicator -->
                <div v-if="isUploading" class="upload-progress-widget">
                    <div class="upload-spinner-widget"></div>
                    <span class="upload-text-widget">Uploading files...</span>
                </div>

                <div class="message-input">
                    <input
                        v-model="newMessage"
                        type="text"
                        :placeholder="placeholderText"
                        @keypress="handleKeyPress"
                        @input="handleInputSync"
                        @change="handleInputSync"
                        @paste="handlePaste"
                        @drop="handleDrop"
                        @dragover="handleDragOver"
                        @dragleave="handleDragLeave"
                        :disabled="!canTypeMessage"
                        :class="{ 'disabled': !canTypeMessage, 'ask-anything-field': isAskAnythingStyle }"
                    >
                    <button
                        v-if="canUploadMore"
                        type="button"
                        class="attach-button"
                        :disabled="isUploading"
                        @click="openFilePicker"
                        :title="`Attach files (${uploadedAttachments.length}/${maxFiles} used) or paste screenshots`"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>
                        <span class="attach-button-glow"></span>
                    </button>
                    <button
                        class="send-button"
                        aria-label="Send message"
                        :class="{ 'ask-anything-send': isAskAnythingStyle }"
                        :style="userBubbleStyles"
                        @click="sendMessage"
                        :disabled="(!newMessage.trim() && uploadedAttachments.length === 0) || !isMessageInputEnabled || secretInMessage"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
                <p v-if="secretInMessage" class="cm-secret-hint" role="alert">{{ SECRET_WARNING }}</p>
            </div>

            <!-- New Conversation Section (Shown when conversation is ended in workflow) -->
            <div v-else-if="shouldShowNewConversationOption && !showEmailGate" class="new-conversation-section">
                <div class="conversation-ended-message">
                    <p class="ended-text">This chat has ended.</p>
                    <button
                        class="start-new-conversation-button"
                        :style="userBubbleStyles"
                        @click="handleStartNewConversation"
                    >
                        Click here to start a new conversation
                    </button>
                </div>
            </div>

            <!-- AI disclosure — dropped as soon as a human agent takes over -->
            <div v-if="showAiDisclaimer" class="ai-disclaimer">
                {{ AI_DISCLAIMER_TEXT }}
            </div>

            <!-- Powered by footer -->
            <div v-if="showBranding" class="powered-by" :style="messageNameStyles">
                <BrandMark class="chattermate-logo" :size="16" />
                <a class="cm-powered-link" href="https://chattermate.chat" target="_blank" rel="noopener"><span class="cm-powered-prefix">Powered by </span><strong class="cm-brand">ChatterMate</strong></a>
            </div>
        </div>

        <!-- Image Preview Modal -->
        <div v-if="previewModal" class="preview-modal-overlay" @click="closePreview">
            <div class="preview-modal-content" @click.stop>
                <button class="preview-modal-close" @click="closePreview">×</button>
                <div v-if="previewFile && isImage(previewFile.type)" class="preview-modal-image-container">
                    <img :src="getPreviewUrl(previewFile)" :alt="previewFile.filename" class="preview-modal-image" />
                    <div class="preview-modal-filename">{{ previewFile.filename }}</div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="widget-loading">
        <!-- Widget is initializing, waiting for widgetId -->
    </div>
</template>

<style scoped>
.chat-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
    overflow: hidden;
    position: relative;
    border-radius: var(--radius-lg);
    /* Subtle solid border around chat window */
    border: none;
    box-shadow: none;
    /* Open/close transition used when container toggles in embed */
    transition: opacity 220ms ease, transform 220ms ease;
    /* Body font comes from the shared theme token (mono on Terminal, custom font when set). */
    font-family: var(--cm-body-font, 'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif);
}

/* ===== Typography roles (design comp) =====
   Body/name: Instrument Sans (var); labels/citations/system pills: JetBrains Mono */
.chat-container .welcome-title {
    font-family: var(--cm-body-font, 'Instrument Sans', system-ui, sans-serif);
    font-weight: 700;
}
.chat-container .citation-label,
.chat-container .citation-chip,
.chat-container .reading-label,
.chat-container .system-message .message-bubble {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.chat-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    border-radius: var(--radius-lg);
    /* Theme-aware so it never paints a hard white line on dark themes. */
    border: 1px solid var(--cm-border, rgba(0, 0, 0, 0.08));
}

.chat-container.collapsed {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-panel {
    background: var(--background-base);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 0;
}

.chat-header {
    padding: var(--space-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}

/* Header orb avatar (when no photo) + animated accent sheen */
.header-orb {
    width: 34px;
    height: 34px;
    border-radius: var(--cm-avatar-radius, 50%);
    flex-shrink: 0;
}
.cm-header-sheen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-size: 200% 100%;
    animation: cm-sheen 4.5s linear infinite;
    opacity: 0.75;
    pointer-events: none;
}
@keyframes cm-sheen {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
    .cm-header-sheen { animation: none !important; }
}

.header-content {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

/* Minimize (chevron) button */
.header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.header-minimize {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    border: none;
    background: rgba(127, 127, 127, 0.12);
    color: inherit;
    cursor: pointer;
    font-size: 17px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s ease;
}
.header-minimize:hover {
    background: rgba(127, 127, 127, 0.22);
}

/* Header Menu Styles */
/* Matches the minimize chevron exactly — two header actions should read as one
   set, not a text pill competing with the agent name. A compose glyph (not a bare
   "+") is the widely-understood "start a new chat" mark. */
.header-new-chat {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    border: none;
    background: rgba(127, 127, 127, 0.12);
    color: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    transition: background 0.15s ease;
}

.header-new-chat:hover:not(:disabled) { background: rgba(127, 127, 127, 0.22); }

/* Armed = the next click confirms. Tint the control and float the hint, rather
   than growing the button and shoving the header around. */
.header-new-chat.armed { background: color-mix(in srgb, currentColor 20%, transparent); }


.header-new-chat:disabled {
    opacity: 0.5;
    cursor: default;
}

.header-menu-container {
    position: relative;
    margin-left: auto;
}

.header-menu-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    color: var(--text-secondary, #6b7280);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.header-menu-btn:hover {
    background: var(--background-secondary, #f3f4f6);
    color: var(--text-primary, #1f2937);
}

.header-menu-btn:focus {
    outline: 2px solid var(--primary-color, #3b82f6);
    outline-offset: 2px;
}

.header-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: var(--background-base, white);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 140px;
    z-index: 1000;
    overflow: hidden;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 14px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: var(--text-sm, 14px);
    color: var(--text-primary, #1f2937);
    text-align: left;
    transition: all 0.15s ease;
}

.dropdown-item:hover:not(:disabled) {
    background: var(--background-secondary, #f3f4f6);
}

.dropdown-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.dropdown-item.end-chat-btn {
    color: var(--error-color, #ef4444);
}

.dropdown-item.end-chat-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.1);
}

.dropdown-item svg {
    flex-shrink: 0;
}

.header-avatar {
    width: 34px;
    height: 34px;
    border-radius: var(--cm-avatar-radius, 50%);
    object-fit: cover;
    border: none;
}

.header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.header-info h3 {
    margin: 0;
    font-size: var(--text-md);
    font-weight: 600;
    line-height: 1.2;
}

.status {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--text-sm);
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--error-color);
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    animation: pulse-offline 2s ease-in-out infinite;
}

@keyframes pulse-offline {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.status-indicator.online {
    background: var(--success-color);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    animation: pulse-online 2s ease-in-out infinite;
}

/* Outside business hours on a human-handled agent. Muted rather than the base
   red, which reads as something being broken — nobody is at their desk, that
   is all. Still, no animation: there is nothing live to signal. */
.status-indicator.away {
    background: var(--cm-muted, #9ca3af);
    box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.2);
    animation: none;
}

/* Presence line ("Online · replies instantly"): accent when readable on the
   card, muted otherwise — themeCssVars picks via --cm-presence. */
.cm-presence {
    color: var(--cm-presence, var(--cm-muted, #C9F24E));
    font-size: 11.5px;
}

@keyframes pulse-online {
    0%, 100% {
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    50% {
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
    }
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    margin-top: var(--space-sm);
    /* Slim, themed scrollbar instead of the chunky browser default (Firefox).
       Uses the resolved theme accent so it matches the surface. */
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--cm-accent, #C9F24E) 40%, transparent) transparent;
}
/* Slim, themed scrollbar (WebKit/Chromium). Track stays transparent so it blends into
   the panel; the thumb picks up the theme accent colour and thickens on hover. */
.chat-messages::-webkit-scrollbar {
    width: 8px;
}
.chat-messages::-webkit-scrollbar-track {
    background: transparent;
}
.chat-messages::-webkit-scrollbar-thumb {
    background-color: color-mix(in srgb, var(--cm-accent, #C9F24E) 35%, transparent);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
}
.chat-messages::-webkit-scrollbar-thumb:hover {
    background-color: color-mix(in srgb, var(--cm-accent, #C9F24E) 60%, transparent);
}

.message {
    display: flex;
    gap: var(--space-sm);
    max-width: 85%;
    align-items: flex-start;
    margin-bottom: var(--space-md);
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 4px;
}

/* Per-message agent avatar (28px orb/photo beside each reply, design comp) */
.cm-msg-avatar {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
}
.cm-msg-avatar-orb,
.cm-msg-avatar-img {
    width: 28px;
    height: 28px;
    border-radius: var(--cm-avatar-radius, 50%);
    display: block;
}
.cm-msg-avatar-img { object-fit: cover; }

.message-bubble {
    padding: 10px 14px;
    /* Per-theme bubble radius from the shared tokens (single source of truth).
       The user/agent rules below place the "tail" corner to match the comp. */
    border-radius: var(--cm-bubble, 16px);
    font-size: 14px;
    line-height: 1.45;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    max-width: 85%;
    transition: all 0.2s ease;
    position: relative;
    /* Long unbroken tokens (URLs, identifiers) wrap instead of painting past
       the bubble edge. */
    overflow-wrap: anywhere;
}

.message-bubble:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

/* Comp bubble shape: user tail at bottom-right, agent tail at top-left. */
.user-message .message-bubble {
    border-radius: var(--cm-bubble, 16px) var(--cm-bubble, 16px) var(--cm-bubble-tail, 5px) var(--cm-bubble, 16px);
    background: linear-gradient(135deg, var(--accent-solid) 0%, color-mix(in srgb, var(--accent-solid) 90%, black) 100%);
}

.assistant-message .message-bubble,
.agent-message .message-bubble {
    border-radius: var(--cm-bubble-tail, 5px) var(--cm-bubble, 16px) var(--cm-bubble, 16px) var(--cm-bubble, 16px);
    /* Fallback only — the per-theme color from agentBubbleStyles (inline background-color)
       wins, so dark themes (Aurora/Glass/Calm/Terminal) get a dark bubble, not white. */
    background-color: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Markdown paragraphs default to 1em top/bottom margins, which makes bubbles tall.
   Collapse them so a single-line reply is a compact bubble. */
.message-bubble p { margin: 0; }
.message-bubble p + p { margin-top: 0.5em; }
.message-bubble ul,
.message-bubble ol { margin: 0.4em 0; padding-left: 1.2em; }

/* Markdown code/table rules live in widget-surface.css — they target v-html
   content, which scoped styles cannot reach. */

.chat-input {
    padding: var(--space-md);
    border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.email-input {
    width: 100%;
}

/* Inputs derive fill/border/placeholder from the inherited panel text color, so they
   stay clearly legible on both light (Legacy/Playful) and dark (Glass/Terminal/Calm) themes. */
.email-input input,
.message-input input {
    width: 100%;
    box-sizing: border-box;
    padding: var(--space-sm) var(--space-md);
    /* Border tinted with the agent's accent so it matches each theme (not bright white). */
    border: 1.5px solid rgba(127, 127, 127, 0.3);
    border: 1.5px solid color-mix(in srgb, var(--cm-accent, #C9F24E) 35%, transparent);
    border-radius: var(--cm-field-radius, 12px);
    background: rgba(127, 127, 127, 0.08);
    background: color-mix(in srgb, currentColor 7%, transparent);
    color: inherit;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.chat-input input::placeholder {
    color: currentColor;
    opacity: 0.5;
}

.email-input input:focus,
.message-input input:focus {
    border-color: var(--cm-accent, #C9F24E);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--cm-accent, #C9F24E) 22%, transparent);
}

.email-input input.invalid {
    border-color: var(--error-color);
}

.email-input input.invalid:focus {
    outline-color: var(--error-color);
}

.message-input {
    display: flex;
    gap: var(--space-sm);
}

.message-input input:disabled {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
}

.cm-secret-hint {
    margin: 6px 4px 0;
    font-size: 12px;
    color: var(--cm-muted);
}

.send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    min-width: 42px;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border: none;
    border-radius: var(--cm-field-radius, 12px);
    cursor: pointer;
    color: white;
}

.send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
}

.dot {
    width: 8px;
    height: 8px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.6;
    animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
    animation-delay: -0.32s;
}

.dot:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

/* AI disclosure. Sits directly above the "Powered by" row and is deliberately
   smaller and dimmer than it, so it reads as a footnote rather than a second
   footer. Both carry the same inline colour (messageNameStyles), which beats any
   stylesheet rule, so the dimming has to be opacity rather than a colour token. */
.ai-disclaimer {
    text-align: center;
    /* No top padding: .chat-input above already ends with var(--space-md), and
       stacking another gap on it made the footer visibly top-heavy. */
    padding: 0 var(--space-md) 2px;
    font-size: 0.6875rem;
    line-height: 1.3;
    /* The theme's muted colour, not opacity over the text colour: dimming
       by opacity fell below readable contrast on light themes. */
    color: var(--cm-muted);
}

/* Close the gap between the two footer lines, but only when the disclosure is
   shown — with it off, the footer keeps its original spacing exactly. */
.ai-disclaimer + .powered-by { padding-top: 0; }

.powered-by {
    text-align: center;
    padding: var(--space-xs);
    font-size: 0.75rem;
    border-top: none;
    background: transparent;
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

/* Footer: "Powered by" muted, "ChatterMate" emphasized (comp). Dimming lives on the
   prefix span (not the container) so the brand keeps the full text colour. */
.cm-powered-prefix { color: var(--cm-muted); }
.cm-brand { font-weight: 700; }
.cm-powered-link { color: inherit; text-decoration: none; cursor: pointer; }
.cm-powered-link:hover .cm-brand { text-decoration: underline; }

/* New conversation section styles */
.new-conversation-section {
    padding: var(--space-md);
    border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    display: flex;
    justify-content: center;
    align-items: center;
}

.conversation-ended-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    text-align: center;
    width: 100%;
}

.ended-text {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-weight: 500;
}

.start-new-conversation-button {
    padding: var(--space-sm) var(--space-lg);
    border: none;
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.start-new-conversation-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.start-new-conversation-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-alert {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 12px;
    text-align: center;
    color: white;
    z-index: 100;
    animation: slideDown 0.3s ease-out;
    border-radius: 24px 24px 0 0;
}

/* Authentication Error Alert Styles */
.auth-error-alert {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    color: white;
    z-index: 200;
    border-radius: 24px;
    animation: slideDown 0.3s ease-out;
    text-align: center;
}

.auth-error-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
}

.auth-error-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

.auth-error-message {
    font-size: 14px;
    line-height: 1.5;
    margin: 12px 0;
    opacity: 0.95;
}

.auth-error-refresh-btn {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 6px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.auth-error-refresh-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-1px);
}

.auth-error-refresh-btn:active {
    transform: translateY(0);
    background-color: rgba(255, 255, 255, 0.2);
}

/* Generic auth-error overlay (token expired / connection failed). The markup
   mirrors .widget-unavailable-* but had no styles, so it rendered transparent
   over the page. Mirror that design and re-scope the legacy red .auth-error-*
   rules above (white-on-red) for this light card. */
.auth-error-overlay {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: var(--radius-lg);
    overflow: hidden;
    position: relative;
    font-family: var(--cm-body-font, 'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif);
}

.auth-error-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    text-align: center;
    position: relative;
    z-index: 1;
    max-width: 90%;
}

.auth-error-card .auth-error-header {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 0;
}

.auth-error-card .auth-error-icon {
    width: 40px;
    height: 40px;
    padding: 16px;
    box-sizing: content-box;
    color: #dc2626;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-radius: 20px;
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.15);
}

.auth-error-card h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.01em;
}

.auth-error-card .auth-error-message {
    font-size: 14px;
    line-height: 1.6;
    color: #64748b;
    margin: 12px 0 24px 0;
    max-width: 280px;
    opacity: 1;
}

.auth-error-card .auth-error-refresh-btn {
    margin-top: 0;
    padding: 11px 24px;
    background: #1e293b;
    border: none;
    border-radius: 10px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease;
}

.auth-error-card .auth-error-refresh-btn:hover {
    background: #0f172a;
    transform: translateY(-1px);
}

.auth-error-card .auth-error-refresh-btn:active {
    transform: translateY(0);
    background: #1e293b;
}

/* SECURITY: Full-page blocking auth error container */
.auth-error-only-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Blocking auth error alert - prevents any interaction with chat */
.auth-error-alert-blocking {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    color: white;
    z-index: 9999;
    text-align: center;
    animation: slideDown 0.3s ease-out;
    max-width: 90%;
}

.auth-error-alert-blocking .auth-error-header {
    margin-bottom: 16px;
}

.auth-error-alert-blocking .auth-error-message {
    font-size: 14px;
    line-height: 1.6;
    margin: 16px 0;
    opacity: 0.95;
    color: #f9fafb;
}

.chat-container.collapsed .auth-error-alert {
    display: none;
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }
    to {
        transform: translateY(0);
    }
}

.chat-container.collapsed .error-alert {
    display: none;
}

@media (max-width: 768px) {

    .chat-container,
    .chat-container.collapsed {
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        border-radius: 0 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        right: 0 !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        max-height: 100dvh !important;
    }

    .chat-panel {
        height: 100%;
        border-radius: 0;
    }

    .chat-messages {
        padding: var(--space-sm);
    }

    .chat-toggle {
        width: 48px;
        height: 48px;
        font-size: 14px;
    }

    /* Mobile styles for new conversation section */
    .new-conversation-section {
        padding: var(--space-sm);
    }

    .conversation-ended-message {
        gap: var(--space-sm);
    }

    .ended-text {
        font-size: var(--text-xs);
    }

    .start-new-conversation-button {
        padding: var(--space-xs) var(--space-md);
        font-size: var(--text-xs);
        min-width: 160px;
        border-radius: var(--radius-md);
    }
}

.loading-history {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-sm);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 10;
}

.loading-spinner {
    display: flex;
    gap: 4px;
}

.message-info {
    font-size: 0.75rem;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.agent-name {
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 500;
    opacity: 0.8;
}

.message-time {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 4px;
    text-align: right;
}

.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 4px 16px;
    margin-top: var(--space-md);
}

/* Processing dots (comp): 3 dots gently bouncing inside an agent bubble. */
.cm-typing-bubble {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 13px 16px;
    border-radius: var(--cm-bubble-tail, 5px) var(--cm-bubble, 16px) var(--cm-bubble, 16px) var(--cm-bubble, 16px);
}
.cm-typing-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.45;
    animation: cm-bounce 1.2s ease-in-out infinite;
}
.cm-typing-dot:nth-child(2) { animation-delay: 0.16s; }
.cm-typing-dot:nth-child(3) { animation-delay: 0.32s; }
@keyframes cm-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
}

/* ===== Reading-knowledge-base indicator ===== */
.typing-indicator.reading-indicator {
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    color: var(--text-muted, #6b7280);
    font-size: 0.78rem;
}
.reading-bars {
    display: inline-flex;
    align-items: flex-end;
    gap: 3px;
    height: 14px;
}
.reading-bars span {
    width: 3px;
    height: 14px;
    border-radius: 2px;
    background: var(--primary-color, currentColor);
    transform-origin: bottom;
    transform: scaleY(0.35);
    animation: cm-reading-bar 1s ease-in-out infinite;
}
.reading-bars span:nth-child(2) { animation-delay: 0.15s; }
.reading-bars span:nth-child(3) { animation-delay: 0.3s; }
.reading-label { opacity: 0.85; }
@keyframes cm-reading-bar {
    0%, 100% { transform: scaleY(0.35); }
    50% { transform: scaleY(1); }
}

/* Stack the bubble, its citations and the meta line vertically. Without this the
   citation chips sit as a flex sibling of the bubble inside the `.message` row and
   squeeze the bubble down to one word per line. min-width:0 lets long words wrap. */
.message-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    /* Fill the row (after the avatar) so wide content like the product carousel has
       room, while each bubble still hugs its own content via its own max-width. */
    flex: 1 1 auto;
}
.user-message .message-col {
    align-items: flex-end;
}

/* ===== Knowledge-base citation chips ===== */
.citation-chips {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    padding-left: 2px;
    max-width: 100%;
    animation: cm-msg-in 0.4s ease both;
}
.citation-label {
    font-size: 0.66rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--cm-muted, currentColor);
    opacity: 0.85;
}
/* Subtle, theme-tinted pill that hugs its label (not a full-width orange bar).
   Colours come from the resolved theme accent/text so they match the surface. */
.citation-chip {
    font-size: 0.72rem;
    line-height: 1.3;
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(127, 127, 127, 0.08);
    background: color-mix(in srgb, var(--cm-accent, #C9F24E) 9%, transparent);
    border: 1px solid rgba(127, 127, 127, 0.22);
    border-color: color-mix(in srgb, var(--cm-accent, #C9F24E) 26%, transparent);
    color: var(--cm-text, inherit);
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ===== Shared premium animation layer ===== */
.chat-messages .message {
    animation: cm-msg-in 0.32s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.chat-panel {
    animation: cm-panel-in 0.34s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
@keyframes cm-msg-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
}
@keyframes cm-panel-in {
    from { opacity: 0; transform: translateY(10px) scale(0.99); }
    to { opacity: 1; transform: none; }
}

/* Streaming typewriter: the partial reply renders as markdown on every tick,
   so bold/links/code appear styled mid-stream instead of as raw asterisks.
   (No white-space: pre-wrap here — the markdown HTML owns its spacing.) */
.message-streaming {
    word-break: break-word;
}
/* Blinking caret rides the end of the last rendered block. */
.message-streaming > :last-child::after {
    content: '';
    display: inline-block;
    width: 6px;
    height: 1em;
    margin-left: 2px;
    vertical-align: -0.15em;
    background: var(--cm-accent, currentColor);
    animation: cm-blink 1s steps(1) infinite;
}
@keyframes cm-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
}

/* ===== Welcome message + quick actions (shown on open) ===== */
.cm-welcome-block {
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: cm-msg-in 0.4s ease both;
}
.cm-welcome-row {
    display: flex;
    gap: 9px;
    align-items: flex-start;
}
.cm-welcome-orb,
.cm-welcome-avatar {
    width: 28px;
    height: 28px;
    border-radius: var(--cm-avatar-radius, 50%);
    flex-shrink: 0;
}
.cm-welcome-avatar { object-fit: cover; }
.cm-welcome-bubble { max-width: 84%; }
/* Quick-action pills sit in a bar just above the input (comp layout). */
.cm-quick-actions-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 16px 12px;
}
.cm-quick-action {
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--cm-accent, #C9F24E) 66%, transparent);
    background: color-mix(in srgb, var(--cm-accent, #C9F24E) 18%, transparent);
    color: inherit;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s ease, color .15s ease, border-color .15s ease;
}
.cm-quick-action:hover:not(:disabled) {
    background: var(--cm-accent, #C9F24E);
    color: #0B0C10;
    border-color: var(--cm-accent, #C9F24E);
}
.cm-quick-action:disabled {
    opacity: 0.55;
    cursor: default;
}

/* ===== Pre-chat email gate ===== */
.cm-email-gate {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 10px;
    padding: 24px 22px;
    animation: cm-msg-in 0.4s ease both;
}
.cm-email-gate-orb {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-bottom: 4px;
}
.cm-email-gate-title {
    margin: 0;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 1.05rem;
    font-weight: 600;
}
.cm-email-gate-text {
    margin: 0 0 6px;
    font-size: 0.85rem;
    opacity: 0.7;
    max-width: 240px;
}
.cm-email-gate-input {
    width: 100%;
    max-width: 280px;
    box-sizing: border-box;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-lg);
    border: 1.5px solid color-mix(in srgb, var(--cm-accent, #C9F24E) 35%, transparent);
    background: color-mix(in srgb, currentColor 7%, transparent);
    color: inherit;
    font: inherit;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.cm-email-gate-input::placeholder { color: currentColor; opacity: 0.5; }
.cm-email-gate-input:focus {
    border-color: var(--cm-accent, #C9F24E);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--cm-accent, #C9F24E) 22%, transparent);
}
.cm-email-gate-input.invalid {
    border-color: var(--error-color, #e5484d);
}
.cm-email-gate-error {
    margin: 0;
    font-size: 0.78rem;
    color: var(--error-color, #e5484d);
}
.cm-email-gate-btn {
    margin-top: 6px;
    padding: 10px 22px;
    border: none;
    border-radius: 999px;
    font: inherit;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.15s ease, transform 0.15s ease;
}
.cm-email-gate-btn:disabled {
    opacity: 0.6;
    cursor: default;
}
.cm-email-gate-btn:not(:disabled):hover {
    transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
    .chat-messages .message,
    .chat-panel,
    .citation-chips,
    .reading-bars span,
    .cm-typing-dot,
    .message-streaming > :last-child::after,
    .status-indicator.online { animation: none !important; }
    .message-streaming > :last-child::after { display: none; }
}

/* ========================================================== */
/* ===== PREMIUM DESIGN PRESETS (theme classes) ============= */
/* Colors come from the seeded customization palette; these   */
/* rules own the structural finish: radius, shadow, fonts.    */
/* ========================================================== */

/* Bubble shape + field radius are driven by the shared theme tokens
   (--cm-bubble / --cm-bubble-tail / --cm-field-radius) set on .chat-container, so
   they live in exactly one place (widget-theme.ts) and match the comp for every
   theme. The panel fills the embedder iframe (which owns the outer window corner),
   so these rules only add per-theme finish: shadow, blur, and Terminal monospace. */

/* ---- Glass ---- */
.chat-container.theme-glass .chat-panel {
    box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.55), 0 0 50px rgba(157, 140, 255, 0.12);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
}
.chat-container.theme-glass .message-bubble {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.16);
}

/* ---- Terminal: monospace across the panel + footer + quick actions ---- */
.chat-container.theme-terminal .chat-panel,
.chat-container.theme-terminal .chat-messages,
.chat-container.theme-terminal .message-bubble,
.chat-container.theme-terminal .chat-input,
.chat-container.theme-terminal .cm-quick-action,
.chat-container.theme-terminal .powered-by,
.chat-container.theme-terminal .header-info h3,
.chat-container.theme-terminal .reading-label,
.chat-container.theme-terminal .citation-chip {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.chat-container.theme-terminal .citation-chip { border-radius: 4px; }
.chat-container.theme-terminal .cm-quick-action { border-radius: 6px; }

/* ---- Calm Mint ---- */
.chat-container.theme-calm .chat-panel {
    box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.5);
}

/* ---- Sunrise (light) ---- */
.chat-container.theme-sunrise .chat-panel {
    box-shadow: 0 30px 80px -28px rgba(0, 0, 0, 0.25), 0 0 60px var(--cm-glow, rgba(0, 0, 0, 0.06));
    border: 1px solid var(--cm-border, rgba(0, 0, 0, 0.08));
}

/* ===== Dark presets: transient light surfaces need a dark variant =====
   The init/loading/connection overlays and the attach button hardcode a light background,
   which flashes white over the dark conversation. Give the dark presets (Aurora + Glass +
   Terminal + Calm) a dark variant. Playful stays light. Form cards are left light by design
   (readable card with dark fields). */
.chat-container.aurora .initializing-overlay,
.chat-container.theme-glass .initializing-overlay,
.chat-container.theme-terminal .initializing-overlay,
.chat-container.theme-calm .initializing-overlay,
.chat-container.aurora .loading-history,
.chat-container.theme-glass .loading-history,
.chat-container.theme-terminal .loading-history,
.chat-container.theme-calm .loading-history,
.chat-container.aurora .connection-status,
.chat-container.theme-glass .connection-status,
.chat-container.theme-terminal .connection-status,
.chat-container.theme-calm .connection-status {
    background: rgba(13, 14, 20, 0.92) !important;
    color: #F2F3F8;
    border-bottom-color: rgba(255, 255, 255, 0.08);
}
.chat-container.aurora .attach-button,
.chat-container.theme-glass .attach-button,
.chat-container.theme-terminal .attach-button,
.chat-container.theme-calm .attach-button {
    background: rgba(255, 255, 255, 0.08) !important;
    color: #F2F3F8 !important;
}

.connection-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 12px;
    text-align: center;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid var(--border-color);
}

.connecting-message {
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.failed-message {
    color: var(--error-color);
}

.reconnect-button {
    background: none;
    border: none;
    color: var(--primary-color);
    text-decoration: underline;
    cursor: pointer;
    padding: 4px 8px;
    margin-left: 8px;
}

.reconnect-button:hover {
    color: var(--primary-dark);
}

.loading-dots {
    display: flex;
    gap: 4px;
    margin-left: 4px;
}

.loading-dots .dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

.message-input input.disabled,
.email-input input.disabled {
    background-color: rgba(0, 0, 0, 0.05) !important;
    cursor: not-allowed;
    color: var(--text-muted);
}

.message-input input.disabled::placeholder,
.email-input input.disabled::placeholder {
    color: var(--text-muted);
}

/* Add styles for agent messages */
.message.agent-message {
    margin-right: auto;
    justify-content: flex-start;
}

.agent-name {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
    margin-left: 8px;
}

.message-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin-top: 4px;
}

/* Add system message styles */
.message.system-message {
    align-self: center;
    max-width: 100%;
    margin: var(--space-sm) 0;
}

.system-message .message-bubble {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-muted);
    font-size: 0.85em;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-lg);
    text-align: center;
}

.initializing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: var(--radius-lg);
}

.loading-text {
    margin-top: var(--space-md);
    color: var(--text-color);
    font-size: var(--text-md);
}

.loading-spinner {
    display: flex;
    gap: 6px;
}

.loading-spinner .dot {
    width: 10px;
    height: 10px;
    background: var(--accent-solid);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.loading-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.loading-spinner .dot:nth-child(2) { animation-delay: -0.16s; }

.rating-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    width: 100%;
}

.star-rating {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin: 0 0 24px;
}

.star-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 28px;
    color: #d1d5db;
    transition: all var(--transition-fast);
    padding: 0 4px;
    transform-origin: center;
    line-height: 1;
}

.star-button:hover {
    transform: scale(1.1);
}

.star-button.selected {
    transform: scale(1.05);
}

.star-button.warning {
    color: var(--error-color);
    text-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
}

.star-button.success {
    color: var(--success-color);
    text-shadow: 0 0 5px rgba(16, 185, 129, 0.3);
}

.star-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
}

.rating-prompt {
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin-bottom: 24px;
    text-align: center;
    font-weight: 500;
}

.rating-message {
    align-self: center;
    width: 100%;
    max-width: 500px;
    margin: var(--space-sm) 0;
}

.rating-message .message-bubble {
    background-color: white;
    padding: var(--space-md) var(--space-md);
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal);
}

.rating-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 0;
}

.rating-prompt {
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin-bottom: 20px;
    text-align: center;
    font-weight: 500;
}

.star-rating {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin: 0 0 20px;
}

.feedback-wrapper {
    width: 100%;
}

.feedback-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 0;
    margin-bottom: 4px;
}

.feedback-input {
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: var(--text-sm);
    transition: border-color var(--transition-fast);
    background-color: white;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.feedback-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(243, 70, 17, 0.1);
}

.feedback-counter {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-align: right;
    margin-right: 4px;
    padding: 0 4px;
}

.submit-rating-button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background-color: var(--accent-solid);
    color: white;
    cursor: pointer;
    font-size: var(--text-base);
    font-weight: 600;
    transition: all var(--transition-fast);
    width: 100%;
    text-align: center;
    display: block;
    margin: 12px 0 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-rating-button:hover:not(:disabled) {
    opacity: 0.95;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.submit-rating-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.submit-rating-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.submitted .star-button {
    pointer-events: none;
    opacity: 0.7;
}

.submitted-feedback-wrapper {
    width: 100%;
    margin-top: 16px;
}

.submitted-feedback {
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: #f9f9f9;
    margin-bottom: 8px;
}

.submitted-feedback-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
    word-break: break-word;
}

.submitted-message {
    font-size: var(--text-sm);
    color: var(--success-color);
    text-align: center;
    font-weight: 500;
    margin-top: 8px;
}

/* Compact Product Card Styles - UPDATED */
.message.product-message .message-bubble {
    padding: 0;
    background: none;
    border: none;
    box-shadow: none;
    width: 100%;
    max-width: none;
}

.product-card-compact {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    border: 1px solid var(--border-color); /* Keep border, ensure it uses token */
    border-radius: var(--radius-lg); /* Slightly larger radius for modern feel */
    overflow: hidden;
    background-color: var(--background-base);
    box-shadow: var(--shadow-sm); /* Use softer shadow */
    padding: var(--space-md); /* Increased padding */
    gap: var(--space-md); /* Increased gap */
    width: 100%;
    transition: box-shadow var(--transition-fast); /* Add transition */
}

.product-card-compact:hover {
    box-shadow: var(--shadow-md); /* Slightly elevate on hover */
}

.product-card-compact.carousel-item {
    flex-direction: column;
    align-items: stretch;
    width: 160px;
    flex-shrink: 0;
    padding: 0;
    gap: 0;
    height: auto;
    border-radius: var(--radius-md); /* Keep standard radius for carousel */
    box-shadow: var(--shadow-sm);
}

.product-card-compact.carousel-item:hover {
     box-shadow: var(--shadow-md);
}

.product-card-compact.single-product {
    max-width: 280px; /* Reduced max width */
    align-self: flex-start;
    padding: var(--space-sm); /* Reduced padding */
    gap: var(--space-sm); /* Reduced gap */
    display: flex;
    flex-direction: row;
    align-items: flex-start; /* Align items at the start */
}

.product-card-compact.single-product .product-image-compact {
    width: 50px; /* Smaller image */
    height: 50px;
    border-radius: var(--radius-xs); /* Smaller radius */
    flex-shrink: 0;
}

.product-card-compact.single-product .product-info-compact {
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Space out text and button */
    flex: 1; /* Take remaining space */
    min-height: 50px; /* Match image height */
    gap: var(--space-xxs); /* Reduced gap */
}

.product-card-compact.single-product .product-text-info {
    display: flex;
    flex-direction: column;
    gap: 1px; /* Very small gap between text lines */
}

.product-card-compact.single-product .product-title-compact {
    font-size: var(--text-xs); /* Smaller font */
    font-weight: 500;
    line-height: 1.3;
    white-space: normal; /* Allow wrapping */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
}

.product-card-compact.single-product .product-variant-compact {
    font-size: 10px; /* Even smaller variant text */
    color: var(--text-muted);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-card-compact.single-product .product-price-compact {
    font-size: var(--text-xs); /* Smaller font */
    font-weight: 600;
    margin-top: 2px;
}

.product-card-compact.single-product .product-actions-compact {
    margin-top: auto; /* Push button to bottom */
    width: 100%; /* Make container full width */
}

.product-card-compact.single-product .view-details-button-compact {
    width: 100%; /* Make button full width */
    padding: 5px 8px; /* Smaller padding */
    font-size: 11px; /* Smaller font */
    justify-content: center; /* Center text/icon */
}

.product-image-compact {
    position: relative;
    width: 60px; /* Fixed width for thumbnail */
    height: 60px; /* Fixed height for thumbnail */
    aspect-ratio: 1 / 1;
    background-color: var(--background-soft);
    overflow: hidden;
    border: none; /* Remove border */
    border-radius: var(--radius-sm); /* Rounded corners */
    flex-shrink: 0; /* Prevent image from shrinking */
}

.product-card-compact.carousel-item .product-image-compact {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    border-radius: 0;
    border-bottom: 1px solid var(--border-color);
}

.product-thumbnail {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-fast);
}

.product-thumbnail:hover {
    transform: scale(1.05);
}

.product-info-compact {
    display: flex;
    flex-direction: column;
    gap: 2px; /* Reduced gap */
    flex: 1; /* Allow info to take remaining space */
    justify-content: center; /* Center content vertically */
    min-width: 0; /* Prevent flex item overflow */
}

.product-card-compact.carousel-item .product-info-compact {
    padding: var(--space-sm);
    gap: var(--space-xs);
    justify-content: flex-start; /* Align items to start for carousel */
}

.product-title-compact {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: 500;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; /* Single line */
}

.product-variant-compact {
    font-size: var(--text-xs);
    color: var(--text-muted);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-price-compact {
    font-size: var(--text-sm); /* Adjusted size */
    font-weight: 600; /* Adjusted weight */
    color: var(--text-primary);
    white-space: nowrap;
    margin-top: 2px; /* Small top margin */
}

.product-actions-compact {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-top: var(--space-sm); /* Add margin for single card */
}

.product-actions-compact.single {
     justify-content: flex-start; /* Align button left */
}

.product-card-compact.carousel-item .product-actions-compact {
    margin-top: auto; /* Push actions to bottom */
    padding-top: var(--space-xs);
}

.view-details-button-compact {
    flex: none; /* Don't grow */
    padding: 6px 10px; /* Adjusted padding */
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-size: var(--text-xs);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
    white-space: nowrap;
    background-color: var(--background-base);
    color: var(--text-secondary);
    line-height: 1;
}

.view-details-button-compact {
     display: inline-flex; /* Align icon */
     align-items: center;
     gap: 4px;
}

.external-link-icon {
    font-size: 1em;
    line-height: 1;
    display: inline-block;
}

.view-details-button-compact:hover {
    background-color: var(--background-soft);
    border-color: var(--border-color-hover);
    color: var(--text-primary);
}

/* Remove old .product-card styles */
/* .product-card { ... } */
/* .product-image-container { ... } */
/* .product-image { ... } */
/* .product-badge { ... } */
/* .product-details { ... } */
/* .product-title { ... } */
/* .product-price { ... } */
/* .current-price { ... } */
/* .product-meta { ... } */
/* .product-vendor { ... } */
/* .label { ... } */
/* .product-type { ... } */
/* .product-description { ... } */
/* .product-actions { ... } */
/* .view-details-button { ... } */

/* Ensure product message container uses full width */
.product-message-container {
    width: 100%;
    overflow: hidden; /* Hide scrollbar overflow from container */
}

.products-carousel {
    margin: var(--space-xs) 0;
    width: 100%;
    padding: var(--space-xs);
    background: rgba(0, 0, 0, 0.02);
    border-radius: 20px;
}

.carousel-title {
    font-size: var(--text-base);
    font-weight: 600;
    margin-bottom: var(--space-sm);
    color: var(--text-primary);
    padding: 0 var(--space-xs);
}

.carousel-items {
    display: flex;
    flex-direction: row;
    gap: var(--space-sm);
    margin-top: var(--space-xs);
    overflow-x: auto;
    padding: var(--space-xs);
    padding-bottom: var(--space-md);
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1);
}

/* Modern scrollbar styling */
.carousel-items::-webkit-scrollbar {
    display: block;
    height: 8px;
}

.carousel-items::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
}

.carousel-items::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    transition: background-color 0.2s;
}

.carousel-items::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
}

/* Enhanced product card styling */
.product-card-compact {
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06),
                0 1px 2px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    width: 180px; /* Slightly reduced width */
    flex-shrink: 0;
    transition: all 0.2s ease;
}

.product-card-compact:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08),
                0 2px 4px rgba(0, 0, 0, 0.06);
}

.product-card-compact .product-info-compact {
    display: flex;
    flex-direction: column;
    padding: var(--space-sm) var(--space-sm);
    gap: var(--space-xs);
    background-color: white;
}

.product-card-compact .product-title-compact {
    font-size: var(--text-sm);
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin: 0;
    min-height: 2.8em;
}

.product-card-compact .product-price-compact {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 2px;
}

.product-card-compact .view-details-button-compact {
    width: 100%;
    padding: 8px 12px;
    background-color: white;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    font-size: var(--text-xs);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    margin-top: var(--space-xs);
}

.product-card-compact .view-details-button-compact:hover {
    background-color: var(--background-soft);
    border-color: var(--border-color-hover);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.product-message-container {
    width: 100%;
    margin: var(--space-sm) 0;
    padding: 0 var(--space-xs);
}

/* Adjust carousel title spacing */
.carousel-title {
    font-size: var(--text-base);
    font-weight: 600;
    margin-bottom: var(--space-sm);
    color: var(--text-primary);
    padding: 0 var(--space-xs);
}

.no-products-message {
    padding: var(--space-md);
    color: var(--text-muted);
    text-align: center;
    font-style: italic;
    font-size: var(--text-sm);
}

/* Modern Form Styles */
.message.form-message {
    align-self: center;
    width: 100%;
    /* Never wider than the chat area — the widget iframe is narrower than
       520px, and anything past 100% ignores the message gutters (#270). */
    max-width: min(520px, 100%);
    margin: var(--space-md) 0;
}

.form-message .message-bubble {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    padding: var(--space-lg);
    border-radius: 24px;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.06);
    width: 100%;
    max-width: none;
    /* The iframe shell has no CSS reset, so without this the card is 100%
       PLUS padding/border and overflows the widget frame (#270). */
    box-sizing: border-box;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
}

.form-message .message-bubble::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-solid), #ff6b6b, #4ecdc4, var(--accent-solid));
    background-size: 200% 100%;
    animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

.form-content {
    width: 100%;
    position: relative;
}

.form-header {
    margin-bottom: var(--space-xl);
    text-align: center;
    position: relative;
}

.form-title {
    font-size: 28px;
    font-weight: 700;
    background: black;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 var(--space-sm) 0;
    letter-spacing: -0.02em;
}

/* ===== Compact inline variant (#270): the card renders inside the chat, so
   the full-screen form's generous spacing forces the visitor to scroll.
   Tighten every step for .form-message only — the full-screen form and the
   dashboard keep the base styles. ===== */

.form-message .form-header {
    margin-bottom: var(--space-md);
    /* Left-aligned like the surrounding chat bubbles; a centered title that
       wraps to two lines reads as broken in the narrow card. */
    text-align: left;
}

/* 28px is proportioned for the full-screen form; inside the ~370px inline
   card it wraps into an oversized two-line heading. */
.form-message .form-title {
    font-size: var(--text-lg);
    margin-bottom: var(--space-xs);
}

.form-message .form-description {
    font-size: var(--text-sm);
}

.form-message .form-fields {
    gap: var(--space-md);
}

.form-message .form-field {
    gap: var(--space-xs);
}

.form-message .field-label {
    margin-bottom: 0;
}

.form-message .form-input,
.form-message .form-textarea,
.form-message .form-select {
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-lg);
}

.form-message .form-textarea {
    min-height: 80px;
}

.form-message .form-actions {
    margin-top: var(--space-md);
}

.form-message .form-submit-button {
    width: 100%;
    padding: var(--space-sm) var(--space-lg);
}

.form-description {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    opacity: 0.8;
}

/* ===== Dark presets: the inline form/contact card is a light card by default,
   which looks broken on dark themes. Give it a dark variant (light themes unchanged). ===== */
.chat-container.aurora .form-message .message-bubble,
.chat-container.theme-glass .form-message .message-bubble,
.chat-container.theme-terminal .form-message .message-bubble,
.chat-container.theme-calm .form-message .message-bubble {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5) !important;
}
.chat-container.aurora .form-title,
.chat-container.theme-glass .form-title,
.chat-container.theme-terminal .form-title,
.chat-container.theme-calm .form-title {
    /* The base title uses background-clip:text + transparent fill (renders as a blank
       block when we only change the background). Set the text color directly instead. */
    background: none !important;
    -webkit-text-fill-color: #F2F3F8 !important;
    color: #F2F3F8 !important;
}
.chat-container.aurora .form-description,
.chat-container.theme-glass .form-description,
.chat-container.theme-terminal .form-description,
.chat-container.theme-calm .form-description,
.chat-container.aurora .field-label,
.chat-container.theme-glass .field-label,
.chat-container.theme-terminal .field-label,
.chat-container.theme-calm .field-label {
    color: #C7CCD6 !important;
}
.chat-container.aurora .form-input,
.chat-container.theme-glass .form-input,
.chat-container.theme-terminal .form-input,
.chat-container.theme-calm .form-input,
.chat-container.aurora .form-textarea,
.chat-container.theme-glass .form-textarea,
.chat-container.theme-terminal .form-textarea,
.chat-container.theme-calm .form-textarea {
    background: rgba(255, 255, 255, 0.06) !important;
    color: #F2F3F8 !important;
    border-color: rgba(255, 255, 255, 0.16) !important;
    box-shadow: none !important;
}
.chat-container.aurora .form-input::placeholder,
.chat-container.theme-glass .form-input::placeholder,
.chat-container.theme-terminal .form-input::placeholder,
.chat-container.theme-calm .form-input::placeholder,
.chat-container.aurora .form-textarea::placeholder,
.chat-container.theme-glass .form-textarea::placeholder,
.chat-container.theme-terminal .form-textarea::placeholder,
.chat-container.theme-calm .form-textarea::placeholder {
    color: rgba(242, 243, 248, 0.5) !important;
}











/* Responsive form styles */
@media (max-width: 768px) {
    .message.form-message {
        max-width: 100%;
        margin: var(--space-sm) 0;
    }

    .form-message .message-bubble {
        padding: var(--space-lg);
        border-radius: 20px;
        margin: 0 var(--space-xs);
    }

    .form-title {
        font-size: 24px;
        letter-spacing: -0.01em;
    }

    .form-description {
        font-size: var(--text-sm);
    }






}

/* User Input Message Styles */
.user-input-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.user-input-prompt {
    font-size: var(--text-base);
    color: var(--text-primary);
    line-height: 1.5;
}

.user-input-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-md);
    background: var(--background-soft);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

.user-input-textarea {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-base);
    color: var(--text-primary);
    font-size: var(--text-base);
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.user-input-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(243, 70, 17, 0.1);
}

.user-input-textarea::placeholder {
    color: var(--text-muted);
}

.user-input-actions {
    display: flex;
    justify-content: flex-end;
}

.user-input-submit-button {
    padding: var(--space-sm) var(--space-lg);
    background: var(--accent-solid);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;
}

.user-input-submit-button:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
}

.user-input-submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.user-input-submitted {
    padding: var(--space-md);
    background: var(--background-soft);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

.submitted-input {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
}

.submitted-input strong {
    color: var(--text-primary);
    font-weight: 600;
}

/* Responsive styles for user input */
@media (max-width: 768px) {
    .user-input-form {
        padding: var(--space-sm);
        gap: var(--space-xs);
    }

    .user-input-textarea {
        min-height: 60px;
        padding: var(--space-xs) var(--space-sm);
    }

    .user-input-submit-button {
        padding: var(--space-xs) var(--space-md);
        font-size: var(--text-xs);
        min-width: 80px;
    }

    .user-input-submitted {
        padding: var(--space-sm);
    }
}

/* ========== ASK_ANYTHING CHAT STYLE - COMPLETE OVERRIDE ========== */

.chat-container.ask-anything-style {
    max-width: 400px;
    min-width: 400px;
    width: 400px;
    margin: 0 auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    border-radius: 24px;
    background: white;
}

/* Tablet responsive for ASK_ANYTHING */
@media (max-width: 1024px) and (min-width: 769px) {
    .chat-container.ask-anything-style {
        max-width: 700px;
        min-width: 500px;
        margin: 10px auto;
        height: 650px;
    }
}

/* ASK_ANYTHING: Complete chat messages container override */
.chat-container.ask-anything-style .chat-messages {
    flex: 1 !important;
    overflow-y: auto !important;
    padding: var(--space-xl) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    gap: var(--space-md) !important;
    -webkit-overflow-scrolling: touch !important;
    scroll-behavior: smooth !important;
    margin-top: 0 !important;
    max-width: 600px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

/* ASK_ANYTHING: Reset all message base styles */
.chat-container.ask-anything-style .chat-messages .message {
    display: flex !important;
    gap: var(--space-sm) !important;
    max-width: 85% !important;
    align-items: flex-start !important;
    margin-bottom: var(--space-md) !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    width: auto !important;
    align-self: unset !important;
    justify-content: unset !important;
    text-align: unset !important;
}

/* ASK_ANYTHING: User messages - force right alignment */
.chat-container.ask-anything-style .chat-messages .message.user-message,
.chat-container.ask-anything-style .message.user-message,
.chat-container.ask-anything-style div.message.user-message {
    align-self: flex-end !important;
    margin-left: auto !important;
    margin-right: 0 !important;
    flex-direction: row-reverse !important;
    text-align: right !important;
    justify-content: flex-start !important;
    width: auto !important;
    max-width: 85% !important;
}

/* ASK_ANYTHING: Agent/Bot messages - force left alignment */
.chat-container.ask-anything-style .chat-messages .message.agent-message,
.chat-container.ask-anything-style .chat-messages .message.bot,
.chat-container.ask-anything-style .chat-messages .message.agent,
.chat-container.ask-anything-style .message.agent-message,
.chat-container.ask-anything-style .message.bot,
.chat-container.ask-anything-style .message.agent,
.chat-container.ask-anything-style div.message.agent-message,
.chat-container.ask-anything-style div.message.bot,
.chat-container.ask-anything-style div.message.agent {
    align-self: flex-start !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    flex-direction: row !important;
    text-align: left !important;
    justify-content: flex-start !important;
    width: auto !important;
    max-width: 85% !important;
}

/* ASK_ANYTHING: Typing indicator - force left alignment */
.chat-container.ask-anything-style .typing-indicator {
    display: flex !important;
    gap: 4px !important;
    padding: 12px 16px !important;
    margin-top: var(--space-md) !important;
    align-self: flex-start !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    width: auto !important;
    max-width: 85% !important;
    justify-content: flex-start !important;
}

/* ASK_ANYTHING: System messages - center them */
.chat-container.ask-anything-style .chat-messages .message.system-message,
.chat-container.ask-anything-style .message.system-message {
    align-self: center !important;
    margin: var(--space-sm) auto !important;
    text-align: center !important;
    max-width: 100% !important;
    justify-content: center !important;
}

/* ASK_ANYTHING: Message bubbles */
.chat-container.ask-anything-style .message-bubble {
    padding: var(--space-md) var(--space-lg) !important;
    border-radius: 20px !important;
    line-height: 1.4 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
    max-width: 100% !important;
    width: auto !important;
    display: inline-block !important;
}

.chat-container.ask-anything-style .user-message .message-bubble {
    border-bottom-right-radius: 6px !important;
}

.chat-container.ask-anything-style .agent-message .message-bubble,
.chat-container.ask-anything-style .bot .message-bubble,
.chat-container.ask-anything-style .agent .message-bubble {
    border-bottom-left-radius: 6px !important;
}

/* ASK_ANYTHING: Chat Panel Layout */
.chat-panel.ask-anything-chat {
    max-width: 700px;
    margin: 0 auto;
    background: var(--background-base);
    border-radius: var(--radius-lg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* ASK_ANYTHING Input Styling */
.chat-input.ask-anything-input {
    padding: var(--space-xl) !important;
    background: var(--background-base) !important;
    border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent) !important;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
}

.chat-input.ask-anything-input .message-input {
    max-width: 600px !important;
    margin: 0 auto !important;
    gap: var(--space-md) !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
}

.chat-input.ask-anything-input .email-input {
    max-width: 600px !important;
    margin: 0 auto var(--space-md) auto !important;
    width: 100% !important;
}

.chat-input.ask-anything-input .email-input input {
    padding: 18px 24px;
    border: 2px solid var(--border-color);
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 500;
    background: var(--background-base);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.chat-input.ask-anything-input .email-input input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.ask-anything-field {
    padding: 18px 24px !important;
    border: 2px solid var(--border-color) !important;
    border-radius: 16px !important;
    font-size: 1rem !important;
    font-weight: 500 !important;
    background: var(--background-base) !important;
    color: var(--text-primary) !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
}

.ask-anything-field:focus {
    outline: none !important;
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1) !important;
    transform: translateY(-1px) !important;
}

.ask-anything-field::placeholder {
    color: var(--text-muted) !important;
    font-weight: 400 !important;
}

.send-button.ask-anything-send {
    padding: 18px !important;
    min-width: 56px !important;
    height: 56px !important;
    border-radius: 16px !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3) !important;
}

.send-button.ask-anything-send:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(243, 70, 17, 0.4) !important;
}

.send-button.ask-anything-send:active:not(:disabled) {
    transform: translateY(0) !important;
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3) !important;
}

/* Welcome Message Section for ASK_ANYTHING Style */
.welcome-message-section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: var(--background-base);
    border-radius: var(--radius-lg);
    position: relative;
    overflow: hidden;
    padding: var(--space-xl);
    box-sizing: border-box;
}

.welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 600px;
    text-align: center;
    flex: 1;
}

.welcome-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-lg);
}

.welcome-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 4px solid white;
}

.welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.welcome-subtitle {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    max-width: 500px;
    font-weight: 400;
}

/* Welcome Input Section */
.welcome-input-section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--background-base);
    border-radius: var(--radius-lg);
    position: relative;
}

.welcome-input-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-lg);
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    padding: 0;
}

.welcome-input-container .email-input {
    width: 100%;
    margin-bottom: var(--space-md);
}

.welcome-email-input {
    width: 100%;
    padding: 18px 24px;
    border: 2px solid var(--border-color);
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 500;
    background: var(--background-base);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-email-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.welcome-email-input.invalid {
    border-color: var(--error-color);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.welcome-email-input.disabled {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
    opacity: 0.7;
}

.welcome-message-input {
    display: flex;
    gap: var(--space-md);
    width: 100%;
    align-items: center;
}

.welcome-message-field {
    flex: 1;
    padding: 18px 24px;
    border: 2px solid var(--border-color);
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 500;
    background: var(--background-base);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.welcome-message-field:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(243, 70, 17, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.welcome-message-field.disabled {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
    opacity: 0.7;
}

.welcome-message-field::placeholder {
    color: var(--text-muted);
    font-weight: 400;
}

.welcome-send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    min-width: 56px;
    height: 56px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3);
}

.welcome-send-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(243, 70, 17, 0.4);
}

.welcome-send-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 14px rgba(243, 70, 17, 0.3);
}

.welcome-send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ===== AURORA conversation (dark) overrides =====
   The ASK_ANYTHING input/field styles assume a light theme (var(--background-base) etc.).
   Aurora is dark, so override the input band + fields to dark-on-light. Scoped to
   .chat-container.aurora so legacy ASK_ANYTHING (light) is untouched. The agent bubble
   itself is already correct via the per-theme inline background-color. */
.chat-container.aurora .chat-input.ask-anything-input {
    background: transparent !important;
}
.chat-container.aurora .ask-anything-field,
.chat-container.aurora .chat-input.ask-anything-input .email-input input {
    background: rgba(255, 255, 255, 0.06) !important;
    color: #F2F3F8 !important;
    border-color: rgba(255, 255, 255, 0.16) !important;
    border-color: color-mix(in srgb, var(--cm-accent, #9D8CFF) 35%, transparent) !important;
    box-shadow: none !important;
}
.chat-container.aurora .ask-anything-field::placeholder,
.chat-container.aurora .chat-input.ask-anything-input .email-input input::placeholder {
    color: rgba(242, 243, 248, 0.5) !important;
}
.chat-container.aurora .powered-by {
    color: rgba(242, 243, 248, 0.6);
    border-top-color: rgba(255, 255, 255, 0.08);
}

/* ===== AURORA style: dark ask-me-anything with glowing orb avatar =====
   Scoped to .welcome-message-section.aurora so legacy ASK_ANYTHING is untouched. */
.welcome-orb {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    flex-shrink: 0;
}
.welcome-message-section.aurora .welcome-avatar {
    width: 120px;
    height: 120px;
    border: none;
    box-shadow: 0 8px 40px rgba(157, 140, 255, 0.35);
}
.welcome-message-section.aurora .welcome-title {
    color: #ffffff;
}
.welcome-message-section.aurora .welcome-subtitle {
    color: rgba(255, 255, 255, 0.6);
}
.welcome-message-section.aurora .welcome-message-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    padding: 6px 6px 6px 8px;
}
.welcome-message-section.aurora .welcome-message-field {
    background: transparent;
    border: none;
    box-shadow: none;
    color: #ffffff;
    border-radius: 999px;
}
.welcome-message-section.aurora .welcome-message-field:focus {
    border: none;
    box-shadow: none;
    transform: none;
}
.welcome-message-section.aurora .welcome-message-field::placeholder {
    color: rgba(255, 255, 255, 0.45);
}
.welcome-message-section.aurora .welcome-send-button.aurora-send {
    border-radius: 50%;
    min-width: 48px;
    width: 48px;
    height: 48px;
    padding: 0;
}

.powered-by-welcome {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-muted);
    padding: var(--space-md);
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: auto;
}

/* Mobile responsive styles for ASK_ANYTHING */
@media (max-width: 768px) {
    .chat-container.ask-anything-style {
        min-width: 100vw !important;
        max-width: 100vw !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        margin: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
    }

    .chat-panel.ask-anything-chat {
        max-width: 100% !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        margin: 0 !important;
        border-radius: 0 !important;
    }

    .chat-container.ask-anything-style .chat-messages {
        padding: var(--space-lg) !important;
        max-width: 100% !important;
        /* Add space for mobile top bar when present */
        padding-top: calc(var(--space-lg) + 60px) !important;
        height: calc(100vh - 60px - 120px) !important; /* topbar + input */
        height: calc(100dvh - 60px - 120px) !important;
    }

    .chat-input.ask-anything-input {
        padding: var(--space-lg) !important;
        border-radius: 0 !important;
        /* position: fixed !important; */
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        box-sizing: border-box !important;
    }

    .chat-input.ask-anything-input .message-input,
    .chat-input.ask-anything-input .email-input {
        max-width: 100%;
    }

    .ask-anything-field {
        padding: 16px 20px !important;
        font-size: 0.9rem !important;
        border-radius: 12px !important;
    }

    .send-button.ask-anything-send {
        padding: 16px !important;
        min-width: 52px !important;
        height: 52px !important;
        border-radius: 12px !important;
    }

    .welcome-title {
        font-size: 2rem;
    }

    .welcome-subtitle {
        font-size: 1rem;
    }

    .welcome-input-container {
        padding: var(--space-lg);
        gap: var(--space-md);
    }

    .welcome-email-input,
    .welcome-message-field {
        padding: 16px 20px;
        font-size: 0.9rem;
        border-radius: 12px;
    }

    .welcome-send-button {
        padding: 16px;
        min-width: 52px;
        height: 52px;
        border-radius: 12px;
    }

    .welcome-avatar {
        width: 64px;
        height: 64px;
    }

    .welcome-message-input {
        gap: var(--space-sm);
    }
}

@media (max-width: 480px) {
    .welcome-title {
        font-size: 1.75rem;
    }

    .welcome-subtitle {
        font-size: 0.9rem;
    }

    .welcome-input-container {
        padding: var(--space-md);
    }

    .welcome-email-input,
    .welcome-message-field {
        padding: 14px 18px;
        font-size: 0.85rem;
    }

    .welcome-send-button {
        padding: 14px;
        min-width: 48px;
        height: 48px;
    }

    .chat-input.ask-anything-input {
        padding: var(--space-md);
    }

    .ask-anything-field {
        padding: 14px 18px !important;
        font-size: 0.85rem !important;
    }

    .send-button.ask-anything-send {
        padding: 14px !important;
        min-width: 48px !important;
        height: 48px !important;
    }
}

/* ASK ANYTHING header */
.ask-anything-top {
    padding: var(--space-md);
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
}
.ask-anything-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}
.ask-anything-subtitle {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
}

/* Attachment styles */
.message-attachments {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
  max-width: 100%;
  overflow: hidden;
}

.attachment-link:hover {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.2);
}

.attachment-link svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.attachment-size {
  opacity: 0.7;
  font-size: 11px;
  margin-left: 4px;
}

.user-message .attachment-link {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: inherit;
}

.user-message .attachment-link:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Image attachment styles */
.attachment-image-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 300px;
  margin-top: 8px;
}

.attachment-image {
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.02);
}

.attachment-image:hover {
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-message .attachment-image {
  border-color: rgba(255, 255, 255, 0.3);
}

.user-message .attachment-image:hover {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}

.attachment-image-info {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.attachment-image-info .attachment-link {
  margin: 0;
  padding: 4px 8px;
  font-size: 12px;
}

/* File upload styles for widget */
.file-previews-widget {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(243, 70, 17, 0.03) 0%, rgba(243, 70, 17, 0.01) 100%);
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px dashed rgba(243, 70, 17, 0.2);
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modern File Preview Cards */
.file-preview-widget {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 13px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02);
  max-width: 100%;
  overflow: hidden;
}

.file-preview-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg,
    #818cf8 0%,
    #a78bfa 50%,
    #c084fc 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.file-preview-widget:hover {
  box-shadow:
    0 8px 16px rgba(124, 58, 237, 0.12),
    0 4px 8px rgba(124, 58, 237, 0.08);
  transform: translateY(-2px);
  border-color: #c4b5fd;
}

.file-preview-widget:hover::before {
  opacity: 1;
}

.file-preview-content-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e9d5ff 100%);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 2px 8px rgba(124, 58, 237, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
}

.file-preview-content-widget::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.4) 0%,
    transparent 100%);
  pointer-events: none;
}

.file-preview-image-widget {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 10px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.file-preview-widget:hover .file-preview-image-widget {
  transform: scale(1.05);
}

.file-preview-icon-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.file-preview-widget:hover .file-preview-icon-widget {
  transform: scale(1.1) rotate(-5deg);
}

.file-preview-info-widget {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.file-preview-name-widget {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.file-preview-size-widget {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.file-preview-remove-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1.5px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}

.file-preview-remove-widget:hover {
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
  border-color: #ef4444;
  color: white;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.25);
}

.file-preview-remove-widget:active {
  transform: scale(1) rotate(90deg);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

/* Modern Attach Button Styling */
.attach-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  min-width: 44px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  overflow: visible;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
}

.attach-button::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg,
    rgba(243, 70, 17, 0.4) 0%,
    rgba(217, 58, 12, 0.4) 50%,
    rgba(239, 68, 68, 0.4) 100%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(8px);
}

.attach-button-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(243, 70, 17, 0.2) 0%,
    transparent 70%);
  opacity: 0;
  transition: all 0.4s ease;
  pointer-events: none;
  z-index: -1;
}

.attach-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-3px) scale(1.05);
  box-shadow:
    0 8px 16px rgba(243, 70, 17, 0.15),
    0 4px 8px rgba(243, 70, 17, 0.1),
    0 0 0 4px rgba(243, 70, 17, 0.1);
}

.attach-button:hover:not(:disabled)::before {
  opacity: 1;
  animation: pulseGlow 2s ease-in-out infinite;
}

.attach-button:hover:not(:disabled) .attach-button-glow {
  opacity: 1;
  width: 150%;
  height: 150%;
}

.attach-button:active:not(:disabled) {
  transform: translateY(-1px) scale(1);
  box-shadow:
    0 4px 8px rgba(243, 70, 17, 0.2),
    0 0 0 3px rgba(243, 70, 17, 0.15);
  transition: all 0.1s ease;
}

.attach-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f3f4f6;
  transform: none;
  box-shadow: none;
}

.attach-button svg {
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.attach-button:hover:not(:disabled) svg {
  transform: rotate(-15deg) scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(243, 70, 17, 0.3));
}

.attach-button:active:not(:disabled) svg {
  transform: rotate(-15deg) scale(1.05);
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.message-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.message-input input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  /* Accent-tinted border so it matches the theme (this duplicate rule otherwise wins
     over the earlier one with a light --border-color → white on dark themes). */
  border: 1.5px solid rgba(127, 127, 127, 0.3);
  border: 1.5px solid color-mix(in srgb, var(--cm-accent, #C9F24E) 35%, transparent);
  border-radius: var(--radius-lg);
  font-size: 14px;
  transition: all 0.2s ease;
}

.message-input input:focus {
  outline: none;
  border-color: var(--cm-accent, #C9F24E);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cm-accent, #C9F24E) 22%, transparent);
}

.message-input input:disabled {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  min-width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.send-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.send-button:hover:not(:disabled)::before {
  opacity: 1;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button svg {
  position: relative;
  z-index: 1;
}

/* Modern Upload Progress Indicator */
.upload-progress-widget {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg,
    rgba(124, 58, 237, 0.08) 0%,
    rgba(168, 85, 247, 0.05) 100%);
  border-radius: 12px;
  margin-bottom: 10px;
  border: 2px solid rgba(124, 58, 237, 0.2);
  animation: uploadPulse 2s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
  position: relative;
  overflow: hidden;
}

.upload-progress-widget::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes uploadPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(0.995);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.upload-spinner-widget {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(124, 58, 237, 0.2);
  border-top: 2.5px solid #7c3aed;
  border-radius: 50%;
  animation: modernSpin 0.8s linear infinite;
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.3);
}

@keyframes modernSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-text-widget {
  font-size: 13px;
  color: #7c3aed;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(124, 58, 237, 0.1);
}

/* Attachment restriction message */
.attachment-restriction-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.08) 0%,
    rgba(96, 165, 250, 0.05) 100%);
  border-radius: 10px;
  margin-bottom: 10px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.08);
}

.restriction-text {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 500;
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1.4;
}

/* Preview Modal Styles */
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in;
}

.preview-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.preview-modal-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  max-width: 100%;
  max-height: 100%;
}

.preview-modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.preview-modal-filename {
  font-size: 14px;
  color: #666;
  text-align: center;
  max-width: 100%;
  word-break: break-word;
  padding: 0 12px;
}

.preview-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10000;
}

.preview-modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Widget Unavailable / API Key Not Configured State */
.widget-unavailable-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

/* Close control for the full-screen error overlays (widget-unavailable / auth-error).
   Fixed to the viewport top-right so it's reachable even on mobile, where these
   screens replace the whole widget and there is no header chevron to minimize. */
.cm-error-close {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(120, 120, 140, 0.12);
  color: #4b5563;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease;
}
.cm-error-close:hover {
  background: rgba(120, 120, 140, 0.22);
}

.widget-unavailable-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.06) 0%, transparent 50%);
  pointer-events: none;
}

.widget-unavailable-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
  position: relative;
  z-index: 1;
  max-width: 90%;
}

.widget-unavailable-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.widget-unavailable-icon {
  width: 36px;
  height: 36px;
  color: #6366f1;
}

.widget-unavailable-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  letter-spacing: -0.01em;
}

.widget-unavailable-message {
  font-size: 14px;
  line-height: 1.6;
  color: #64748b;
  margin: 0 0 24px 0;
  max-width: 280px;
}

.widget-unavailable-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  opacity: 0.8;
}

.chattermate-logo-small {
  opacity: 0.6;
}

/* Mobile responsive for unavailable state */
@media (max-width: 768px) {
  .widget-unavailable-card {
    padding: 24px 20px;
  }

  .widget-unavailable-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }

  .widget-unavailable-icon {
    width: 32px;
    height: 32px;
  }

  .widget-unavailable-title {
    font-size: 18px;
  }

  .widget-unavailable-message {
    font-size: 13px;
    max-width: 260px;
  }
}
</style>
