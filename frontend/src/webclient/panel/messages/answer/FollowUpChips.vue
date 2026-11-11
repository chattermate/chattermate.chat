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
/** Questions the visitor may ask next, under the latest answer. A tap sends one. */
import { PANEL_COPY } from '../../../copy'

defineProps<{ choices: string[]; disabled: boolean }>()
const emit = defineEmits<{ pick: [text: string] }>()
</script>

<template>
    <div class="cm-follow-ups" role="group" :aria-label="PANEL_COPY.followUps">
        <button
            v-for="(choice, i) in choices"
            :key="choice"
            type="button"
            class="cm-follow-ups__chip cm-press cm-enter"
            :style="{ '--cm-i': i }"
            :disabled="disabled"
            @click="emit('pick', choice)"
        >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
            <span>{{ choice }}</span>
        </button>
    </div>
</template>

<style scoped>
.cm-follow-ups { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.cm-follow-ups__chip { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; text-align: left; }
</style>
