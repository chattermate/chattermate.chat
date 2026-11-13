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
 * The widget cannot be used: not set up (no API key: "Chat Unavailable") or the
 * visitor's session failed ("Authentication Error", with Refresh). Classic wording;
 * the panel's footer keeps the branding under it.
 */
import { inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { isApiKeyAuthRequired, authError } = ctrl

const reloadPage = () => window.location.reload()
</script>

<template>
    <div class="cm-screen cm-blocked" role="alert">
        <button type="button" class="cm-icon-button cm-blocked__close" :aria-label="PANEL_COPY.closeChat" @click="ctrl.minimizeWidget">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
        </button>
        <span class="cm-screen__icon" aria-hidden="true">
            <svg v-if="isApiKeyAuthRequired" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16.5v.01"></path></svg>
        </span>
        <template v-if="isApiKeyAuthRequired">
            <h2 class="cm-screen__title">{{ PANEL_COPY.unavailableTitle }}</h2>
            <p class="cm-screen__text">{{ PANEL_COPY.unavailableText }}</p>
        </template>
        <template v-else>
            <h2 class="cm-screen__title">{{ PANEL_COPY.authErrorTitle }}</h2>
            <p class="cm-screen__text">{{ authError }}</p>
            <button type="button" class="cm-primary cm-press cm-screen__action" @click="reloadPage">{{ PANEL_COPY.refresh }}</button>
        </template>
    </div>
</template>

<style scoped>
.cm-blocked { position: relative; }
.cm-blocked__close { position: absolute; top: 12px; right: 12px; }
</style>
