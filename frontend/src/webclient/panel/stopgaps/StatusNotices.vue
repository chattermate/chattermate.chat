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
 * STOPGAP until the restyled banners (plan 1.4): starting up, the connection
 * state with its retry, and the error alert, as plain notices with the classic text.
 */
import { inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { isInitializing, connectionStatus, showError, errorMessage } = ctrl
</script>

<template>
    <p v-if="isInitializing" class="cm-notice" role="status">{{ PANEL_COPY.initializing }}</p>
    <p v-else-if="connectionStatus === 'connecting'" class="cm-notice" role="status">{{ PANEL_COPY.connecting }}</p>
    <p v-else-if="connectionStatus === 'failed'" class="cm-notice" role="alert">
        {{ PANEL_COPY.connectionFailed }}
        <button type="button" class="cm-link-button" @click="ctrl.handleReconnect">{{ PANEL_COPY.reconnect }}</button>
    </p>
    <p v-if="showError" class="cm-notice cm-notice--error" role="alert">{{ errorMessage }}</p>
</template>

<style scoped>
.cm-notice { margin: 0 14px 8px; padding: 8px 12px; }
</style>
