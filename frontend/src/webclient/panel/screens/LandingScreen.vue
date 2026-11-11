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
// A workflow's landing page in front of the chat: its heading, its text and the
// button that starts the workflow (the controller's handleLandingPageProceed).
import { inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { landingPageData, workflowButtonText } = ctrl
</script>

<template>
    <div class="cm-screen cm-landing">
        <h2 v-if="landingPageData?.heading" class="cm-screen__title">{{ landingPageData.heading }}</h2>
        <p v-if="landingPageData?.content" class="cm-screen__text cm-landing__text">{{ landingPageData.content }}</p>
        <button type="button" class="cm-primary cm-press cm-screen__action" @click="ctrl.handleLandingPageProceed">
            {{ workflowButtonText || PANEL_COPY.continueLabel }}
        </button>
    </div>
</template>

<style scoped>
.cm-landing__text { white-space: pre-line; }
</style>
