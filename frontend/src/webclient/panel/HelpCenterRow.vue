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
 * A row on the start state that opens the org's public help center in a new tab,
 * shown only when the help center is live (the server sends its URL only then).
 * Styled like the suggestion rows (.cm-suggestion in widget-panel-start.css).
 */
import { inject } from 'vue'
import { WIDGET_CTX } from './controller'
import { PANEL_COPY } from '../copy'

const { helpCenterUrl } = inject(WIDGET_CTX)!
</script>

<template>
    <div v-if="helpCenterUrl" class="cm-suggestions cm-help-row">
        <a
            class="cm-suggestion"
            :href="helpCenterUrl"
            target="_blank"
            rel="noopener noreferrer"
        >
            <span class="cm-suggestion__icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z"></path><path d="M8 7h8M8 11h6"></path></svg>
            </span>
            <span class="cm-suggestion__label">
                {{ PANEL_COPY.helpCenter }}
                <span class="cm-visually-hidden">{{ PANEL_COPY.opensInNewTab }}</span>
            </span>
            <svg class="cm-suggestion__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"></path></svg>
        </a>
    </div>
</template>

<style scoped>
.cm-help-row { margin-top: 10px; }
.cm-suggestion {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    box-sizing: border-box;
    text-decoration: none;
}
.cm-suggestion__icon { width: 34px; height: 34px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.cm-suggestion__label { flex-grow: 1; min-width: 0; overflow-wrap: anywhere; }
.cm-suggestion__chevron { flex-shrink: 0; }
</style>
