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
 * The live work trace: the steps the agent is taking for the reply on its way,
 * each a spinner that turns into a check (or a cross) when the step is done.
 * Polite status: a screen reader hears each step once.
 */
import { PANEL_COPY } from '../copy'
import type { LiveStep } from '../../composables/useAgentTrace'

defineProps<{ steps: LiveStep[] }>()
</script>

<template>
    <div class="cm-trace cm-fade" role="status" aria-live="polite" :aria-label="PANEL_COPY.working">
        <ol class="cm-trace__steps">
            <li v-for="step in steps" :key="step.step_id" :class="['cm-trace__step', 'cm-enter', `is-${step.state}`]">
                <span class="cm-trace__icon" aria-hidden="true">
                    <span v-if="step.state === 'running'" class="cm-trace__spinner"></span>
                    <svg v-else-if="step.state === 'error'" class="cm-trace__mark" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"></path></svg>
                    <svg v-else class="cm-trace__mark" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                </span>
                <span class="cm-trace__label">{{ step.label }}</span>
            </li>
        </ol>
    </div>
</template>

<style scoped>
.cm-trace__steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.cm-trace__step { display: flex; align-items: center; gap: 10px; }
.cm-trace__icon { display: grid; place-items: center; width: 18px; height: 18px; flex: none; }
.cm-trace__spinner { width: 12px; height: 12px; border-radius: 50%; }
</style>
