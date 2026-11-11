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
/**
 * The empty chat, for every chat style: the agent's mark, a greeting
 * (welcome_title), a headline (welcome_subtitle), the welcome message as body
 * text, and the suggestions (quick_actions) as rows. The composer stays below it.
 * The panel swaps it for the conversation on the first message, and it collapses
 * as it goes (see the cm-start transition in widget-panel-start.css).
 * The inline email card sits above it (PanelWidget), and the two scroll together.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from './controller'
import AgentMark from './AgentMark.vue'
import StartSuggestions from './StartSuggestions.vue'
import HelpCenterRow from './HelpCenterRow.vue'
import RecentRow from './history/RecentRow.vue'
import { agentFace } from './agent-face'
import { renderMarkdown } from '../markdown'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!
const { customization, welcomeMessageText, photoUrl, orbStyle } = ctrl

const face = computed(() => agentFace(customization.value, photoUrl.value))
const greeting = computed(() => customization.value.welcome_title || PANEL_COPY.welcomeTitle)
const headline = computed(() => customization.value.welcome_subtitle || PANEL_COPY.welcomeSubtitle)
// The agent's own text: sanitised markdown (renderMarkdown), as in its replies.
const bodyHtml = computed(() => renderMarkdown(welcomeMessageText.value))
</script>

<template>
    <div class="cm-start">
        <AgentMark class="cm-enter" size="lg" :face="face" :photo-url="photoUrl" :orb-style="orbStyle" />
        <p class="cm-start__greeting cm-enter" style="--cm-i: 1">{{ greeting }}</p>
        <h2 class="cm-start__headline cm-enter" style="--cm-i: 2">{{ headline }}</h2>
        <!-- .cm-welcome-block .message-bubble: the e2e page object's welcome hook. -->
        <div v-if="welcomeMessageText" class="cm-welcome-block cm-enter" style="--cm-i: 3">
            <div class="message-bubble cm-start__body" v-html="bodyHtml"></div>
        </div>
        <div class="cm-start__spacer"></div>
        <!-- The Recent row (past conversations) joins here with plan 5.x. -->
        <StartSuggestions class="cm-enter" style="--cm-i: 4" />
        <RecentRow class="cm-enter" style="--cm-i: 5" />
        <HelpCenterRow class="cm-enter" style="--cm-i: 6" />
    </div>
</template>

<style scoped>
/* Its content's height at least (the panel body scrolls when that is more than
   fits); on a tall panel it fills the space and the spacer keeps the rows low. */
.cm-start {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    padding: 24px 18px 10px;
}
.cm-start > * { flex-shrink: 0; }
.cm-start__greeting { margin: 18px 0 0; }
.cm-start__headline { margin: 4px 0 0; }
.cm-welcome-block { margin-top: 8px; }
.cm-start__spacer { flex-grow: 1; min-height: 20px; }
</style>
