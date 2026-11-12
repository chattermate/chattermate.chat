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
// The Ask AI palette wired to the widget controller (ASK_ANYTHING / AURORA, or the
// search-bar trigger).
import { inject } from 'vue'
import AskAiPanel from './AskAiPanel.vue'
import { WIDGET_CTX, WIDGET_PREVIEW } from './panel/controller'
import { AI_DISCLAIMER_TEXT } from '../utils/aiDisclaimer'

const ctrl = inject(WIDGET_CTX)!
const preview = inject(WIDGET_PREVIEW, false)
const {
    messages, newMessage, agentName, quickActions, customization, askAiSubtitle, placeholderText,
    isMessageInputEnabled, canTypeMessage, loading, showCitations, showAiDisclaimer, showBranding,
    hostVisible, askAiHotkey, canStartNewChat, startingNewChat, newChatArmed, newChatError,
} = ctrl

const setDraft = (text: string) => { ctrl.newMessage.value = text }
</script>

<template>
    <AskAiPanel
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
        :preview="preview"
        @new-chat="ctrl.requestNewChat"
        @confirm-new-chat="ctrl.confirmNewChat"
        @cancel-new-chat="ctrl.disarmNewChat"
        :display-text="ctrl.displayText"
        :is-streaming="ctrl.isStreaming"
        @update:draft="setDraft"
        @send="ctrl.sendMessage"
        @ask="ctrl.sendQuickAction"
        @close="ctrl.minimizeWidget"
    />
</template>
