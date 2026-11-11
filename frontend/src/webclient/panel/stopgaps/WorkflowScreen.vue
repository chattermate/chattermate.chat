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
 * STOPGAP until the workflow screens (plan 1.4): a workflow's landing page with its
 * button, and a full-screen form's title and description as text (the form itself
 * is not fillable here yet).
 */
import { inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { showLandingPage, landingPageData, workflowButtonText, fullScreenFormData } = ctrl
</script>

<template>
    <div class="cm-screen">
        <template v-if="showLandingPage && landingPageData">
            <p class="cm-screen__title">{{ landingPageData.heading }}</p>
            <p class="cm-screen__text">{{ landingPageData.content }}</p>
            <button type="button" class="cm-primary cm-press" @click="ctrl.handleLandingPageProceed">
                {{ workflowButtonText || PANEL_COPY.continueLabel }}
            </button>
        </template>
        <template v-else-if="fullScreenFormData">
            <p class="cm-screen__title">{{ fullScreenFormData.title || PANEL_COPY.formFallback }}</p>
            <p v-if="fullScreenFormData.description" class="cm-screen__text">{{ fullScreenFormData.description }}</p>
        </template>
    </div>
</template>

<style scoped>
.cm-screen { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 10px; padding: 24px 18px; }
.cm-screen__title, .cm-screen__text { margin: 0; }
</style>
