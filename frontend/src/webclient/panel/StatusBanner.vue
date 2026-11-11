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
 * Under the header: starting up, connecting or a dropped connection (with its
 * retry), and the error alert, with the classic wording. The status line stays
 * mounted and only its text changes, so screen readers announce it.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from './controller'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!
const { isInitializing, connectionStatus, showError, errorMessage } = ctrl

const state = computed<'starting' | 'connecting' | 'failed' | null>(() => {
    if (isInitializing.value) return 'starting'
    if (connectionStatus.value === 'connecting') return 'connecting'
    if (connectionStatus.value === 'failed') return 'failed'
    return null
})
const STATE_TEXT = {
    starting: PANEL_COPY.initializing,
    connecting: PANEL_COPY.connecting,
    failed: PANEL_COPY.connectionFailed,
}
const text = computed(() => (state.value ? STATE_TEXT[state.value] : ''))
</script>

<template>
    <div class="cm-banner-stack">
        <div class="cm-banner" :class="[state ? `cm-banner--${state}` : 'cm-banner--idle']" role="status">
            <template v-if="state">
                <span v-if="state === 'failed'" class="cm-banner__icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 16.5v.01"></path><circle cx="12" cy="12" r="9"></circle></svg>
                </span>
                <span v-else class="cm-banner__dots" aria-hidden="true"><span class="cm-typing-dot"></span><span class="cm-typing-dot"></span><span class="cm-typing-dot"></span></span>
                <span class="cm-banner__text">{{ text }}</span>
                <button v-if="state === 'failed'" type="button" class="cm-link-button" @click="ctrl.handleReconnect">{{ PANEL_COPY.reconnect }}</button>
            </template>
        </div>
        <p v-if="showError" class="cm-banner cm-banner--error" role="alert">
            <span class="cm-banner__icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 16.5v.01"></path><circle cx="12" cy="12" r="9"></circle></svg>
            </span>
            <span class="cm-banner__text">{{ errorMessage }}</span>
        </p>
    </div>
</template>

<style scoped>
.cm-banner-stack { flex-shrink: 0; display: flex; flex-direction: column; gap: 6px; padding: 0 14px; }
.cm-banner-stack:has(.cm-banner:not(.cm-banner--idle)) { padding-top: 8px; }
.cm-banner { margin: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 12px; }
.cm-banner--idle { padding: 0; }
.cm-banner__icon { display: flex; flex-shrink: 0; }
.cm-banner__dots { display: inline-flex; gap: 3px; }
.cm-banner__dots .cm-typing-dot { width: 5px; height: 5px; }
.cm-banner__text { flex: 1 1 auto; min-width: 0; }
</style>
