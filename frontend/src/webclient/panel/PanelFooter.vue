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
// Under the composer: the AI disclosure (dropped once a person takes over) and the
// "Powered by ChatterMate" link (unless the plan hides it), one above the other: the
// full disclosure does not share a line with the link at the panel's width.
// Screens with no conversation (workflow, unavailable) show the link only.
import { computed, inject } from 'vue'
import { WIDGET_CTX } from './controller'
import BrandMark from '../../components/common/BrandMark.vue'
import { AI_DISCLAIMER_TEXT } from '../../utils/aiDisclaimer'
import { PANEL_COPY } from '../copy'

const props = defineProps<{ brandingOnly?: boolean }>()

const ctrl = inject(WIDGET_CTX)!
const { showBranding } = ctrl
const showDisclaimer = computed(() => !props.brandingOnly && ctrl.showAiDisclaimer.value)
</script>

<template>
    <p v-if="showDisclaimer || showBranding" class="cm-footer">
        <span v-if="showDisclaimer" class="ai-disclaimer">{{ AI_DISCLAIMER_TEXT }}</span>
        <a v-if="showBranding" class="cm-footer__brand" href="https://chattermate.chat" target="_blank" rel="noopener">
            <BrandMark :size="13" />
            <span>{{ PANEL_COPY.poweredBy }} <strong>{{ PANEL_COPY.brandName }}</strong></span>
        </a>
    </p>
</template>

<style scoped>
.cm-footer {
    margin: 8px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    text-align: center;
}
.cm-footer__brand { display: inline-flex; align-items: center; gap: 6px; }
</style>
