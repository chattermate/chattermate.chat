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
 * STOPGAP until the restyled overlays (plan 1.4): the widget cannot be used, either
 * because it is not set up (no API key) or because the visitor's session failed.
 */
import { inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { isApiKeyAuthRequired, authError } = ctrl

const reloadPage = () => window.location.reload()
</script>

<template>
    <div class="cm-blocked" role="alert">
        <button type="button" class="cm-icon-button cm-blocked__close" :aria-label="PANEL_COPY.closeChat" @click="ctrl.minimizeWidget">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
        </button>
        <template v-if="isApiKeyAuthRequired">
            <p class="cm-blocked__title">{{ PANEL_COPY.unavailableTitle }}</p>
            <p class="cm-blocked__text">{{ PANEL_COPY.unavailableText }}</p>
        </template>
        <template v-else>
            <p class="cm-blocked__title">{{ PANEL_COPY.authErrorTitle }}</p>
            <p class="cm-blocked__text">{{ authError }}</p>
            <button type="button" class="cm-primary cm-press" @click="reloadPage">{{ PANEL_COPY.refresh }}</button>
        </template>
    </div>
</template>

<style scoped>
.cm-blocked { position: relative; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 10px; padding: 24px; }
.cm-blocked__close { position: absolute; top: 12px; right: 12px; }
.cm-blocked__title, .cm-blocked__text { margin: 0; }
</style>
