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
// A workflow conversation ended: say so and offer a new one, in place of the
// composer (classic wording; the controller starts it).
import { inject } from 'vue'
import { WIDGET_CTX } from './controller'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!
</script>

<template>
    <div class="cm-ended" role="status">
        <p class="cm-ended__text">{{ PANEL_COPY.chatEnded }}</p>
        <button type="button" class="cm-primary cm-press" @click="ctrl.handleStartNewConversation">
            {{ PANEL_COPY.startNewConversation }}
        </button>
    </div>
</template>

<style scoped>
.cm-ended { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
.cm-ended__text { margin: 0; text-align: center; }
</style>
